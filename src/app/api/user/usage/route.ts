import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { TIER_LIMITS } from "@/lib/usage";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        tier: true,
        optimizationCount: true,
        briefCount: true,
        scanCount: true,
        lastResetDate: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      usage: {
        optimizationCount: user.optimizationCount,
        briefCount: user.briefCount,
        scanCount: user.scanCount,
        tier: user.tier,
        limits: TIER_LIMITS[user.tier]
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
