import { prisma } from "./prisma";
import { Tier } from "@prisma/client";

export const TIER_LIMITS = {
  SEEKER: {
    optimizations: 1, // Matches pricing "1 Surgical Resume Download"
    briefs: 0,        // Exclusive to Elite
    scans: 3,         // Daily teaser
    playbooks: 0,
  },
  ELITE: {
    optimizations: 25, 
    briefs: 15,
    scans: 10,
    playbooks: 9999,
  },
  PROFESSIONAL: {
    optimizations: 9999,
    briefs: 9999,
    scans: 9999,
    playbooks: 9999,
  }

};

export async function checkUsageLimit(
  email: string, 
  action: 'optimization' | 'brief' | 'scan' | 'playbook'
) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      tier: true,
      optimizationCount: true,
      briefCount: true,
      scanCount: true,
      lastResetDate: true,
    }
  });

  if (!user) throw new Error("User not found");

  // Handle Resets
  const now = new Date();
  const lastReset = new Date(user.lastResetDate);
  
  const isNewMonth = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
  const isNewDay = now.getDate() !== lastReset.getDate() || isNewMonth;

  if (isNewMonth || isNewDay) {
    const updateData: any = { lastResetDate: now };
    
    // Monthly Resets
    if (isNewMonth) {
      updateData.optimizationCount = 0;
      updateData.briefCount = 0;
      user.optimizationCount = 0;
      user.briefCount = 0;
    }
    
    // Daily Resets
    if (isNewDay) {
      updateData.scanCount = 0;
      user.scanCount = 0;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });
  }


  const limits = TIER_LIMITS[user.tier];
  let currentCount = 0;
  let limit = 0;

  switch (action) {
    case 'optimization':
      currentCount = user.optimizationCount;
      limit = limits.optimizations;
      break;
    case 'brief':
      currentCount = user.briefCount;
      limit = limits.briefs;
      break;
    case 'scan':
      currentCount = user.scanCount;
      limit = limits.scans;
      break;
    case 'playbook':
      // Playbook is special (locked for Seeker)
      limit = limits.playbooks;
      currentCount = 0; // We don't strictly track count yet if it's unlimited for higher tiers
      break;
  }

  if (currentCount >= limit) {
    return { allowed: false, limit };
  }

  return { allowed: true, limit };
}

export async function incrementUsage(
  email: string,
  action: 'optimization' | 'brief' | 'scan'
) {
  const data: any = {};
  if (action === 'optimization') data.optimizationCount = { increment: 1 };
  if (action === 'brief') data.briefCount = { increment: 1 };
  if (action === 'scan') data.scanCount = { increment: 1 };

  await prisma.user.update({
    where: { email },
    data
  });
}
