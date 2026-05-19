/* DIAGNOSTIC: Force re-compile to resolve 404 ghost routes */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { optimizeResumeContent } from "@/lib/gemini";
import mammoth from "mammoth";
import PizZip from "pizzip";
import fs from "fs/promises";
import path from "path";
import { checkUsageLimit, incrementUsage } from "@/lib/usage";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // --- ACTION: OPTIMIZE ---
    if (body.action === 'optimize') {
      const usage = await checkUsageLimit(session.user.email, 'optimization');
      if (!usage.allowed) {
        return NextResponse.json({ error: "Limit Reached" }, { status: 403 });
      }

      if (!user.resumePath) {
        return NextResponse.json({ error: "No resume found" }, { status: 404 });
      }

      const jobId = body.jobId;
      const existingJob = jobId ? await prisma.job.findUnique({ where: { id: jobId } }) : null;

      let opt: any = null;

      // 1. Check if we already optimized this specific job
      if (existingJob?.optimizedSummary) {
        console.log(`[OPTIMIZE] Cache Hit for Job ${jobId}`);
        opt = {
          newSummary: existingJob.optimizedSummary,
          bulletReplacements: existingJob.optimizedBullets
        };
      } else {
        // 2. AI Optimization (Cache Miss)
        console.log(`[OPTIMIZE] Cache Miss for Job ${jobId}. Calling Gemini...`);
        
        // Fetch Resume
        let buffer: Buffer;
        if (user.resumePath.startsWith("http")) {
          const res = await fetch(user.resumePath);
          buffer = Buffer.from(await res.arrayBuffer());
        } else {
          const filePath = path.join(process.cwd(), "storage/resumes", path.basename(user.resumePath));
          buffer = await fs.readFile(filePath);
        }

        const extracted = await mammoth.extractRawText({ buffer });
        opt = await optimizeResumeContent(extracted.value, body.jobDescription || "");
        
        if (!opt) return NextResponse.json({ error: "AI failed" }, { status: 422 });

        // Save result to cache
        if (existingJob) {
          await prisma.job.update({
            where: { id: existingJob.id },
            data: {
              optimizedSummary: opt.newSummary,
              optimizedBullets: opt.bulletReplacements,
              // If it was in wishlist, mark as applied now that we optimized it
              status: existingJob.status === 'WISHLIST' ? 'APPLIED' : existingJob.status
            }
          }).catch(e => console.error("Failed to cache optimization:", e));
        }

        await incrementUsage(session.user.email, 'optimization');
      }

      // 3. Surgical XML Update (using the 'opt' data, whether from cache or AI)
      let resumeBuffer: Buffer;
      if (user.resumePath.startsWith("http")) {
        const res = await fetch(user.resumePath);
        resumeBuffer = Buffer.from(await res.arrayBuffer());
      } else {
        const filePath = path.join(process.cwd(), "storage/resumes", path.basename(user.resumePath));
        resumeBuffer = await fs.readFile(filePath);
      }

      const zip = new PizZip(resumeBuffer);
      const xml = zip.file("word/document.xml")?.asText();
      if (!xml) throw new Error("XML Read Error");

      const paragraphs = xml.split(/(?=<w:p)/);
      const getCleanText = (p: string) => p.replace(/<[^>]+>/g, "").trim();
      const normalizeText = (t: string) => (t || "").replace(/[\s\u00A0]+/g, " ").trim().toLowerCase();
      const xmlEscape = (s: string) => (s || "").replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m] || m));

      const updated = paragraphs.map(p => {
        const cleanParagraph = normalizeText(getCleanText(p));
        if (!cleanParagraph) return p;

        // 1. Try Summary Match
        if (opt.newSummary && opt.originalSummary) {
          const cleanOriginal = normalizeText(opt.originalSummary);
          // Match if significant chunk overlap exists (first 40 chars)
          if (cleanParagraph.includes(cleanOriginal.substring(0, 40)) || cleanOriginal.includes(cleanParagraph.substring(0, 40))) {
            console.log("[SURGICAL] Successfully matched and optimized Summary paragraph.");
            return p.replace(/<w:r>[\s\S]*<\/w:r>/, `<w:r><w:t>${xmlEscape(opt.newSummary)}</w:t></w:r>`);
          }
        }

        // 2. Try Bullet Matches
        for (const bullet of opt.bulletReplacements || []) {
          if (bullet.new && bullet.original) {
            const cleanOriginal = normalizeText(bullet.original);
            if (cleanParagraph.includes(cleanOriginal.substring(0, 35)) || cleanOriginal.includes(cleanParagraph.substring(0, 35))) {
              console.log("[SURGICAL] Successfully matched and optimized Bullet point.");
              return p.replace(/<w:r>[\s\S]*<\/w:r>/, `<w:r><w:t>${xmlEscape(bullet.new)}</w:t></w:r>`);
            }
          }
        }
        return p;
      });

      zip.file("word/document.xml", updated.join(""));
      const out = zip.generate({ type: "nodebuffer" });

      return new Response(new Uint8Array(out), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="Optimized_Resume.docx"`
        }
      });
    }

    // --- ACTION: SEARCH ---
    const usage = await checkUsageLimit(session.user.email, 'scan');
    if (!usage.allowed) return NextResponse.json({ error: "Limit Reached" }, { status: 403 });

    // Clear old wishlist jobs from DB so stale results don't reappear on refresh
    if (!body.page || body.page === 0) {
      await prisma.job.deleteMany({
        where: { userId: user.id, status: "WISHLIST" }
      });
    }

    const title = user.jobTitle?.trim() || "Product Designer";
    const loc = user.location?.trim() || "Remote";
    const key = process.env.SERPAPI_API_KEY;

    if (!key) return NextResponse.json({ jobs: [] });

    const isRemote = loc.toLowerCase().includes("remote") || loc.toLowerCase().includes("usa");
    const q = isRemote ? `${title} Remote` : title;

    // --- STEP 1: PRUNE OLD CACHE (Housekeeping to save DB space) ---
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await prisma.searchCache.deleteMany({ where: { createdAt: { lt: sevenDaysAgo } } }).catch(() => {});

    // --- STEP 2: NORMALIZE LOCATION & CHECK CACHE ---
    let serpLocation = "";
    if (!isRemote) {
      // Check if we have a location mapping in cache already
      try {
        const locRes = await fetch(`https://serpapi.com/locations.json?q=${encodeURIComponent(loc)}&limit=1`);
        const locData = await locRes.json();
        if (locData.length > 0) {
          serpLocation = locData[0].canonical_name || locData[0].name || loc;
        } else {
          serpLocation = loc;
        }
      } catch {
        serpLocation = loc;
      }
    }

    const cacheKey = { query: q, location: serpLocation || loc };
    const cached = await prisma.searchCache.findUnique({
      where: { query_location: cacheKey }
    });

    let allJobs: any[] = [];
    const tier = user.tier;
    const pageOffset = (body.page || 0) * 50; // Each 'page' in UI now jumps 5 pages of API results

    // If cached and fresh (< 24h), use it to save SerpApi credits
    if (cached && (Date.now() - new Date(cached.createdAt).getTime()) < 24 * 60 * 60 * 1000 && (!body.page || body.page === 0)) {
      console.log(`[CACHE] Hit: ${q} in ${serpLocation || 'Remote'}`);
      allJobs = cached.results as any[];
    } else {
      console.log(`[CACHE] Miss/Pagination: Fetching ${q} (Start: ${pageOffset})`);
      
      const fetchJobs = async (start: number) => {
        try {
          const p = new URLSearchParams({
            engine: "google_jobs",
            q,
            gl: "us",
            hl: "en",
            start: start.toString(),
            api_key: key
          });
          if (serpLocation) p.append("location", serpLocation);
          if (isRemote || body.remoteOnly) p.append("ltype", "1");
          
          const res = await fetch(`https://serpapi.com/search.json?${p.toString()}`);
          const data = await res.json();
          return data.jobs_results || [];
        } catch {
          return [];
        }
      };

      // Increase depth based on tier
      const pageCount = tier === 'PROFESSIONAL' ? 10 : tier === 'ELITE' ? 5 : 3;
      const pages = Array.from({ length: pageCount }, (_, i) => pageOffset + (i * 10));
      
      const results = await Promise.all(pages.map(p => fetchJobs(p)));
      allJobs = results.flat();

      // Normalize results for local city searches
      if (!isRemote && allJobs.length > 0) {
        const filtered = allJobs.filter((j: any) => {
          const jLoc = (j.location || "").toLowerCase();
          return jLoc !== "anywhere" && jLoc !== "remote" && !jLoc.startsWith("anywhere");
        });
        if (filtered.length > 0) allJobs = filtered;
      }

      // Save to Cache if we got results (only for first page)
      if (allJobs.length > 0 && (!body.page || body.page === 0)) {
        await prisma.searchCache.upsert({
          where: { query_location: cacheKey },
          update: { results: allJobs, createdAt: new Date() },
          create: { ...cacheKey, results: allJobs }
        }).catch(err => console.error("[CACHE] Upsert failed:", err));
      }
    }
    
    if (allJobs.length === 0) return NextResponse.json({ jobs: [] });

    const saveLimit = tier === 'PROFESSIONAL' ? 100 : tier === 'ELITE' ? 50 : 30;
    const saved = await Promise.all(allJobs.slice(0, saveLimit).map(async (j: any) => {
      const id = j.job_id || Math.random().toString(36).substr(2, 9);
      
      // UI Polish: Title and Location
      let displayTitle = j.title || "Unknown Position";
      let displayLocation = j.location || "Remote";

      // 1. Strip "job at ...", "role at ...", etc.
      displayTitle = displayTitle.split(/\s+(job|role)\s+at\s+/i)[0];
      displayTitle = displayTitle.split(/\s+at\s+[A-Z][a-z]+/)[0]; // Split at " at CompanyName"
      
      // 2. Strip long location lists (e.g. "in New York, NY, ...")
      displayTitle = displayTitle.split(/\s+in\s+[A-Z][a-z]+/)[0];

      const isActuallyRemote = 
        displayLocation.toLowerCase().includes("anywhere") || 
        displayLocation.toLowerCase().includes("remote") ||
        displayTitle.toLowerCase().includes("remote");

      if (isActuallyRemote) {
        displayLocation = "Remote";
        // Clean "remote" out of the title before re-adding it standardized
        displayTitle = displayTitle.replace(/\s*remote\s*/gi, " ").replace(/\s+/g, " ").trim();
        if (!displayTitle.includes("[Remote]")) {
          displayTitle = displayTitle + " [Remote]";
        }
      }

      // 3. Hard limit for visual consistency
      if (displayTitle.length > 70) {
        displayTitle = displayTitle.substring(0, 67) + "...";
      }

      // UI Polish: Description (Surgical cleanup)
      let displayDesc = j.description || "No description provided.";
      
      // 1. Remove Title if it's at the start
      const cleanTitleForMatch = displayTitle.replace(/\[Remote\]/g, "").trim().toLowerCase();
      if (displayDesc.toLowerCase().startsWith(cleanTitleForMatch)) {
        displayDesc = displayDesc.substring(cleanTitleForMatch.length).trim();
      }

      // 2. Remove common location/type prefixes
      displayDesc = displayDesc.replace(/^(remote|anywhere|work from home|full[- ]time|contract|internship)\s*[:-]?\s*/gi, "").trim();
      
      // 3. Final polish
      displayDesc = displayDesc.replace(/^[•\-–\s\r\n*]+/, ""); // Remove leading bullets
      displayDesc = displayDesc.charAt(0).toUpperCase() + displayDesc.slice(1); // Capitalize
      displayDesc = displayDesc.substring(0, 450) + "...";

      return prisma.job.upsert({
        where: { id },
        update: { 
          title: displayTitle,
          company: j.company_name || "Unknown",
          location: displayLocation,
          description: displayDesc
        },
        create: {
          id,
          title: displayTitle,
          company: j.company_name || "Unknown",
          location: displayLocation,
          description: displayDesc,
          matchScore: Math.floor(Math.random() * (98 - 85 + 1)) + 85,
          applyLink: j.apply_options?.[0]?.link || "#",
          status: "WISHLIST",
          userId: user.id
        }
      });
    }));

    // FINAL STEP: Fetch sorted jobs from DB to ensure Favorites are pinned to the top
    const finalJobs = await prisma.job.findMany({
      where: { 
        userId: user.id,
        status: "WISHLIST",
        isDeleted: false
      },
      orderBy: [
        { isSaved: 'desc' },
        { matchScore: 'desc' }
      ]
    });

    await incrementUsage(session.user.email, 'scan');
    return NextResponse.json({ jobs: finalJobs });

  } catch (err: any) {
    console.error("SEARCH_ROUTE_CRITICAL:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
