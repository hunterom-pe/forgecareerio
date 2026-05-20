import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/lib/gemini";
import mammoth from "mammoth";
import fs from "fs/promises";
import path from "path";

// Simple in-memory cache to prevent redundant Gemini API calls during active sessions
const analysisCache = new Map<string, { resumePath: string; analysis: any }>();

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const useMock = searchParams.get("mock") === "true";

    if (useMock) {
      const mockAnalysis = {
        score: 74,
        grade: "C+",
        pros: [
          "Strong use of action verbs like 'Architected' and 'Deployed' in modern tech settings.",
          "Good section layout with clear job descriptions and technical profile competencies.",
          "Demonstrates solid experience with React, Next.js, and backend microservices."
        ],
        cons: [
          "Only 15% of your bullet points contain quantifiable business metrics (e.g. latency reduction, budget savings).",
          "Multiple bullet points are passive descriptors of tasks rather than active accomplishments.",
          "Resume lacks direct alignment with higher-level architectural principles required for a Senior role."
        ],
        suggestions: [
          "Inject metrics into at least 3 job bullets (e.g. 'Improved speed by X%', 'Cut load times by Y%').",
          "Swap passive verbs (e.g. 'Responsible for maintaining') with active accomplishment statements.",
          "Add a targeted summary section emphasizing your leadership in System Design and team mentoring."
        ]
      };
      return NextResponse.json(gateAnalysisResponse(mockAnalysis, user.tier));
    }

    if (!user.resumePath) {
      return NextResponse.json({ error: "No resume uploaded. Please upload a resume first." }, { status: 400 });
    }

    // Check cache first
    const cached = analysisCache.get(user.id);
    if (cached && cached.resumePath === user.resumePath) {
      console.log(`[ANALYZE] Cache hit for user ${user.id}`);
      return NextResponse.json(gateAnalysisResponse(cached.analysis, user.tier));
    }

    // Read file buffer
    let buffer: Buffer;
    if (user.resumePath.startsWith("http")) {
      const res = await fetch(user.resumePath);
      buffer = Buffer.from(await res.arrayBuffer());
    } else {
      const filePath = path.join(process.cwd(), "storage/resumes", path.basename(user.resumePath));
      buffer = await fs.readFile(filePath);
    }

    // Extract text
    const extracted = await mammoth.extractRawText({ buffer });
    const resumeText = extracted.value;

    if (!resumeText.trim()) {
      return NextResponse.json({ error: "Could not read any text from the uploaded resume." }, { status: 422 });
    }

    // Call Gemini Analyzer
    const analysis = await analyzeResume(resumeText, user.jobTitle || "Software Engineer");

    // Cache the result
    analysisCache.set(user.id, {
      resumePath: user.resumePath,
      analysis,
    });

    // Return the response, gated by the user's tier
    return NextResponse.json(gateAnalysisResponse(analysis, user.tier));
  } catch (error: any) {
    console.error("Resume Analyze API critical failure:", error);
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 });
  }
}

// Function to filter/gate analysis properties based on user's subscription tier
function gateAnalysisResponse(analysis: any, tier: string) {
  const { score, grade, pros, cons, suggestions } = analysis;

  if (tier === "SEEKER") {
    // Seeker (Free) gets only the score and grade
    return {
      tier,
      score,
      grade,
      pros: null,
      cons: null,
      suggestions: null,
    };
  }

  // Elite and Professional get full diagnostics
  return {
    tier,
    score,
    grade,
    pros,
    cons,
    suggestions,
  };
}
