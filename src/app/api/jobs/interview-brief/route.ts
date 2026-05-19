import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateInterviewBrief } from "@/lib/gemini";
import { checkUsageLimit, incrementUsage } from "@/lib/usage";


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usage = await checkUsageLimit(session.user.email, 'brief');
    if (!usage.allowed) {
      return NextResponse.json({ 
        error: "Limit Reached", 
        message: `You've used your ${usage.limit} monthly Intel Briefs. Upgrade to Elite for more.`,
        code: "LIMIT_REACHED"
      }, { status: 403 });
    }


    const { title, company, description } = await req.json();

    if (!title || !company || !description) {
      return NextResponse.json({ error: "Missing required job details" }, { status: 400 });
    }

    const brief = await generateInterviewBrief(title, company, description);

    if (!brief) {
      return NextResponse.json({ error: "Failed to generate interview brief" }, { status: 500 });
    }

    // Track usage
    await incrementUsage(session.user.email, 'brief');

    return NextResponse.json({ brief });

  } catch (error) {
    console.error("Interview Brief API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
