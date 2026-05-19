import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.resumePath) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    let buffer: Buffer;

    // Check if it's an S3 URL or Local path
    if (user.resumePath.startsWith('http')) {
      // S3 Download
      const s3Client = new S3Client({
        region: process.env.SUPABASE_S3_REGION || "us-east-1",
        endpoint: process.env.S3_ENDPOINT ? process.env.S3_ENDPOINT : undefined,
        forcePathStyle: !!process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY!,
        },
      });

      // Extract filename from URL
      const urlParts = user.resumePath.split('/');
      const fileName = urlParts[urlParts.length - 1];

      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileName,
      });

      const response = await s3Client.send(command);
      const arrayBuffer = await response.Body?.transformToByteArray();
      if (!arrayBuffer) throw new Error("Could not read S3 body");
      buffer = Buffer.from(arrayBuffer);
    } else {
      // Local File Read
      const fileName = path.basename(user.resumePath);
      const filePath = path.join(process.cwd(), "storage/resumes", fileName);
      buffer = await fs.readFile(filePath);
    }

    // Convert DOCX to Text
    const result = await mammoth.extractRawText({ buffer });
    
    return NextResponse.json({ 
      text: result.value,
      fileName: path.basename(user.resumePath).split('-').slice(2).join('-') || "My Resume"
    });
  } catch (error) {
    console.error("View resume error:", error);
    return NextResponse.json({ error: "Failed to read resume content" }, { status: 500 });
  }
}
