import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobTitle, location, tier } = await req.json();

    if (!jobTitle || !location) {
      return NextResponse.json(
        { error: "Job title and location are required" },
        { status: 400 }
      );
    }

    // First fetch current user state to preserve fields
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        jobTitle: jobTitle.trim(),
        location: location.trim(),
        // We only set the tier to SEEKER here. 
        // Paid tiers (ELITE/PROFESSIONAL) are handled by the Stripe webhook after successful payment.
        tier: tier === 'SEEKER' ? 'SEEKER' : existingUser.tier,
      },
    });

    console.log(`[ONBOARD] User ${session.user.email} updated: ${jobTitle} in ${location} (${tier} selected)`);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
