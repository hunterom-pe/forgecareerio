import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { generateStrategicAudit } from "@/lib/gemini";
import mammoth from "mammoth";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { jobs: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trackedJobs = user.jobs.filter(j => !j.isDeleted);
    const appliedThisWeek = trackedJobs.filter(j => j.status !== 'WISHLIST' && j.createdAt >= sevenDaysAgo).length;
    const previousWeek = trackedJobs.filter(j => j.status !== 'WISHLIST' && j.createdAt < sevenDaysAgo && j.createdAt >= new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000)).length;
    
    const velocityDiff = previousWeek === 0 ? appliedThisWeek * 100 : Math.round(((appliedThisWeek - previousWeek) / previousWeek) * 100);
    
    const avgMatch = trackedJobs.length > 0 
      ? Math.round(trackedJobs.reduce((acc, curr) => acc + curr.matchScore, 0) / trackedJobs.length)
      : 0;

    // --- REJECTION ANALYSIS ---
    const rejectedJobs = trackedJobs.filter(j => j.status === 'REJECTED');
    const reasonsMap: Record<string, number> = {};
    const rejectionInsights: string[] = [];

    rejectedJobs.forEach(job => {
      if (job.rejectionReason) {
        job.rejectionReason.split(', ').forEach(reason => {
          reasonsMap[reason] = (reasonsMap[reason] || 0) + 1;
        });
      }
      if (job.rejectionNotes) {
        rejectionInsights.push(`[${job.company}] ${job.rejectionNotes}`);
      }
    });

    const frictionData = Object.entries(reasonsMap)
      .map(([name, count]) => ({ 
        name, 
        count, 
        percentage: Math.round((count / rejectedJobs.length) * 100) 
      }))
      .sort((a, b) => b.count - a.count);

    // --- AI STRATEGIC AUDIT ---
    let strategicInsight = "Your search is currently focused on high-match roles. Continue gathering signals to generate a deep-learning pivot recommendation.";
    
    if (rejectedJobs.length > 0 && user.resumePath) {
      try {
        let resumeText = "";
        const fileName = path.basename(user.resumePath);
        const filePath = path.join(process.cwd(), "storage/resumes", fileName);
        const resumeBuffer = await fs.readFile(filePath);
        const extracted = await mammoth.extractRawText({ buffer: resumeBuffer });
        resumeText = extracted.value;

        strategicInsight = await generateStrategicAudit(
          resumeText, 
          user.jobTitle || "Professional", 
          rejectionInsights
        );
      } catch (e) {
        console.error("Failed to extract resume for intel audit:", e);
      }
    }

    // --- REAL-TIME MARKET SKILLS (Analyzed from your scans) ---
    const allDescriptions = trackedJobs.map(j => j.description).join(" ").toLowerCase();
    
    // Define skills to look for based on job title
    const techKeywords = ["react", "next.js", "typescript", "node", "python", "aws", "docker", "kubernetes", "system design", "figma", "tailwind", "graphql", "postgresql", "mongodb"];
    const designKeywords = ["figma", "sketch", "adobe xd", "ui design", "ux research", "prototyping", "design systems", "wireframing", "branding", "user testing"];
    
    const keywordsToSearch = user.jobTitle?.toLowerCase().includes('design') ? designKeywords : techKeywords;
    
    const marketSkills = keywordsToSearch.map(skill => {
      const regex = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'gi');
      const count = (allDescriptions.match(regex) || []).length;
      const totalJobs = trackedJobs.length || 1;
      // Calculate a "Level" (0-100) based on frequency
      const level = Math.min(Math.round((count / totalJobs) * 100) + 15, 100); 
      return { 
        name: skill.charAt(0).toUpperCase() + skill.slice(1), 
        level, 
        trending: level > 70 
      };
    })
    .sort((a, b) => b.level - a.level)
    .slice(0, 5);

    // Trending Skills (Industry Benchmarks - keeping some context)
    const industryTrends = [
      { name: "AI/LLM Integration", level: 92, trending: true },
      { name: "Serverless Architecture", level: 78, trending: true },
      { name: "Edge Computing", level: 65, trending: false }
    ];

    return NextResponse.json({
      stats: [
        { label: "Weekly Velocity", value: appliedThisWeek.toString(), sub: `${velocityDiff >= 0 ? '+' : ''}${velocityDiff}% from last week`, color: "blue" },
        { label: "Avg DNA Match", value: `${avgMatch}%`, sub: avgMatch > 90 ? "Top 5% of candidates" : "Highly competitive", color: "emerald" },
        { label: "Profile Strength", value: avgMatch > 85 ? "Elite" : "Strong", sub: "Based on match scores", color: "indigo" }
      ],
      marketSkills,
      industryTrends,
      friction: frictionData,
      insight: strategicInsight
    });
  } catch (error) {
    console.error("Intelligence API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
