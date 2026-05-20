import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { rewriteResumeContentGeneral } from "@/lib/gemini";
import mammoth from "mammoth";
import PizZip from "pizzip";
import fs from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // STRICT GATE: Only Professional tier can auto-rewrite/forge optimized versions
    if (user.tier !== "PROFESSIONAL") {
      return NextResponse.json({ error: "Auto-Rewrite is only available on the Professional plan." }, { status: 403 });
    }

    if (!user.resumePath) {
      return NextResponse.json({ error: "No resume found. Please upload one first." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const consList = body.cons || [];

    // 1. Fetch original file buffer
    let resumeBuffer: Buffer;
    if (user.resumePath.startsWith("http")) {
      const res = await fetch(user.resumePath);
      resumeBuffer = Buffer.from(await res.arrayBuffer());
    } else {
      const filePath = path.join(process.cwd(), "storage/resumes", path.basename(user.resumePath));
      resumeBuffer = await fs.readFile(filePath);
    }

    // 2. Extract text using mammoth to feed to Gemini
    const extracted = await mammoth.extractRawText({ buffer: resumeBuffer });
    const resumeText = extracted.value;

    if (!resumeText.trim()) {
      return NextResponse.json({ error: "Could not read resume text." }, { status: 422 });
    }

    // 3. Call AI Optimization
    const opt = await rewriteResumeContentGeneral(resumeText, user.jobTitle || "Software Engineer", consList);
    if (!opt || (!opt.newSummary && (!opt.bulletReplacements || opt.bulletReplacements.length === 0))) {
      return NextResponse.json({ error: "Failed to optimize content with AI" }, { status: 422 });
    }

    // 4. Perform surgical XML Replacement
    const zip = new PizZip(resumeBuffer);
    const xml = zip.file("word/document.xml")?.asText();
    if (!xml) {
      return NextResponse.json({ error: "Could not read docx XML template" }, { status: 500 });
    }

    const paragraphs = xml.split(/(?=<w:p)/);
    const getCleanText = (p: string) => p.replace(/<[^>]+>/g, "").trim();
    const normalizeText = (t: string) => (t || "").replace(/[\s\u00A0]+/g, " ").trim().toLowerCase();
    const xmlEscape = (s: string) => (s || "").replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m] || m));

    const updated = paragraphs.map(p => {
      const cleanParagraph = normalizeText(getCleanText(p));
      if (!cleanParagraph) return p;

      // Match summary and replace
      if (opt.newSummary && opt.originalSummary) {
        const cleanOriginal = normalizeText(opt.originalSummary);
        if (cleanParagraph.includes(cleanOriginal.substring(0, 40)) || cleanOriginal.includes(cleanParagraph.substring(0, 40))) {
          console.log("[SURGICAL ANALYSIS] Replacing summary paragraph.");
          return p.replace(/<w:r>[\s\S]*<\/w:r>/, `<w:r><w:t>${xmlEscape(opt.newSummary)}</w:t></w:r>`);
        }
      }

      // Match bullets and replace
      for (const bullet of opt.bulletReplacements || []) {
        if (bullet.new && bullet.original) {
          const cleanOriginal = normalizeText(bullet.original);
          if (cleanParagraph.includes(cleanOriginal.substring(0, 35)) || cleanOriginal.includes(cleanParagraph.substring(0, 35))) {
            console.log("[SURGICAL ANALYSIS] Replacing bullet point.");
            return p.replace(/<w:r>[\s\S]*<\/w:r>/, `<w:r><w:t>${xmlEscape(bullet.new)}</w:t></w:r>`);
          }
        }
      }

      return p;
    });

    zip.file("word/document.xml", updated.join(""));
    const out = zip.generate({ type: "nodebuffer" });

    // 5. Send optimized file as an attachment download
    return new Response(new Uint8Array(out), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="Forge_Optimized_Resume.docx"',
      },
    });
  } catch (error: any) {
    console.error("General rewrite API failure:", error);
    return NextResponse.json({ error: "Failed to perform automated rewrite" }, { status: 500 });
  }
}
