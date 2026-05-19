import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // SECURITY: Strict file type validation
    if (!file.name.toLowerCase().endsWith(".docx")) {
      return NextResponse.json({ error: "Only .docx files are allowed" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${user.id}-${Date.now()}-${safeName}`;
    let fileUrl = "";

    // 1. Try S3 Cloud Storage
    let uploadSuccessful = false;
    if (process.env.SUPABASE_S3_ACCESS_KEY_ID && process.env.SUPABASE_S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME) {
      try {
        const s3Client = new S3Client({
          region: process.env.SUPABASE_S3_REGION || "us-east-1",
          endpoint: process.env.S3_ENDPOINT ? process.env.S3_ENDPOINT : undefined,
          forcePathStyle: !!process.env.S3_ENDPOINT, // Required for Supabase/MinIO
          credentials: {
            accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
          },
        });

        const command = new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: uniqueFileName,
          Body: buffer,
          ContentType: file.type,
        });

        await s3Client.send(command);
        
        // Determine public URL structure based on whether it's Supabase or raw AWS
        if (process.env.S3_ENDPOINT && process.env.S3_ENDPOINT.includes('supabase')) {
          const projectIdMatch = process.env.S3_ENDPOINT.match(/https:\/\/([^.]+)\./);
          const projectId = projectIdMatch ? projectIdMatch[1] : '';
          fileUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${process.env.S3_BUCKET_NAME}/${uniqueFileName}`;
        } else {
          fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.SUPABASE_S3_REGION || "us-east-1"}.amazonaws.com/${uniqueFileName}`;
        }
        
        console.log("Successfully uploaded to S3 Cloud:", fileUrl);
        uploadSuccessful = true;
      } catch (s3Error) {
        console.error("S3 upload failed, falling back to local:", s3Error);
      }
    } 

    // 2. Fallback to Local Storage (If S3 failed or credentials missing)
    if (!uploadSuccessful) {
      console.warn("Falling back to local disk storage.");
      // SECURITY: Move files OUT of public/ to prevent direct browser access
      const uploadDir = path.join(process.cwd(), "storage/resumes");
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        console.error("Failed to create upload dir:", err);
      }

      const filePath = path.join(uploadDir, uniqueFileName);
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${uniqueFileName}`;
      console.log("Successfully saved locally:", fileUrl);
    }

    // Save the URL to the Prisma DB
    await prisma.user.update({
      where: { id: user.id },
      data: { resumePath: fileUrl },
    });

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
