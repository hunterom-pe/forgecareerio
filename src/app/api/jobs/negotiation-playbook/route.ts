import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateNegotiationPlaybook } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { checkUsageLimit } from "@/lib/usage";


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usage = await checkUsageLimit(session.user.email, 'playbook');
    if (!usage.allowed) {
      return NextResponse.json({ 
        error: "Feature Locked", 
        message: "Negotiation Playbooks are exclusive to Elite and Professional members.",
        code: "LIMIT_REACHED"
      }, { status: 403 });
    }


    const { title, company, matchScore } = await req.json();

    if (!title || !company) {
      return NextResponse.json({ error: "Missing required job details" }, { status: 400 });
    }

    // 1. Fetch user profile for location
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { location: true }
    });

    const location = user?.location || "United States";
    const SERPAPI_KEY = process.env.SERPAPI_API_KEY;
    let marketData = "";

    // 2. Fetch live market data from SerpApi
    if (SERPAPI_KEY) {
      try {
        const searchQuery = encodeURIComponent(`salary for ${title} in ${location}`);
        const url = `https://serpapi.com/search.json?engine=google&q=${searchQuery}&api_key=${SERPAPI_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // Extract snippets from search results to give Gemini context
          marketData = data.organic_results?.slice(0, 3).map((r: any) => r.snippet).join("\n") || "";
          
          // Also check for "answer_box" which often has direct salary info
          if (data.answer_box?.answer || data.answer_box?.snippet) {
            marketData = `PRIMARY SOURCE: ${data.answer_box.answer || data.answer_box.snippet}\n\n${marketData}`;
          }
        }
      } catch (e) {
        console.error("SerpApi Salary Search Error:", e);
      }
    }

    // 3. Generate the playbook with live context
    const playbook = await generateNegotiationPlaybook(title, company, matchScore || 90, location, marketData);

    if (!playbook) {
      return NextResponse.json({ error: "Failed to generate negotiation playbook" }, { status: 500 });
    }

    return NextResponse.json({ playbook });
  } catch (error) {
    console.error("Negotiation Playbook API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
