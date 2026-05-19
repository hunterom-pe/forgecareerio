import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const JOB_STATUS = ["WISHLIST", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"] as const;

const updateStatusSchema = z
  .object({
    id: z.string().min(1).optional(),
    title: z.string().min(1).max(500).optional(),
    company: z.string().min(1).max(300).optional(),
    location: z.string().max(300).optional(),
    description: z.string().max(20000).optional(),
    matchScore: z.union([z.number(), z.string()]).optional(),
    status: z.enum(JOB_STATUS).optional(),
    isDeleted: z.boolean().optional(),
    isSaved: z.boolean().optional(),
    rejectionReason: z.string().max(500).optional(),
    rejectionNotes: z.string().max(5000).optional(),
  })
  .refine(
    (data) => data.id || (data.title && data.company),
    "Either an id or both title and company are required",
  );

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

    const body = await req.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    const {
      id,
      title,
      company,
      location,
      description,
      matchScore,
      status,
      isDeleted,
      isSaved,
      rejectionReason,
      rejectionNotes,
    } = validation.data;

    const parsedMatchScore =
      typeof matchScore === "string" ? parseInt(matchScore, 10) || 0 : matchScore ?? 0;

    let savedJob;

    if (id) {
      const existingJob = await prisma.job.findFirst({
        where: { id, userId: user.id },
      });

      if (existingJob) {
        savedJob = await prisma.job.update({
          where: { id, userId: user.id },
          data: {
            status: status || undefined,
            isDeleted: isDeleted !== undefined ? isDeleted : undefined,
            isSaved: isSaved !== undefined ? isSaved : undefined,
            title: title || undefined,
            company: company || undefined,
            rejectionReason: rejectionReason !== undefined ? rejectionReason : undefined,
            rejectionNotes: rejectionNotes !== undefined ? rejectionNotes : undefined,
          },
        });
      } else if (title && company) {
        savedJob = await prisma.job.create({
          data: {
            id,
            title,
            company,
            location: location || "",
            description: description || "",
            matchScore: parsedMatchScore,
            status: status || "WISHLIST",
            userId: user.id,
          },
        });
      }
    } else if (title && company) {
      savedJob = await prisma.job.create({
        data: {
          title,
          company,
          location: location || "",
          description: description || "",
          matchScore: parsedMatchScore,
          status: status || "WISHLIST",
          userId: user.id,
        },
      });
    }

    return NextResponse.json({ success: true, job: savedJob });
  } catch (error) {
    console.error("Update Job Status Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
