import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  // Disable in production — this endpoint serves a static fixture for local dev only
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), "storage/resumes/Sarah_Jenkins_Master.docx");
    const fileBuffer = await fs.readFile(filePath);

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="Sarah_Jenkins_Master.docx"',
      },
    });
  } catch {
    return NextResponse.json({ error: "Test resume not found" }, { status: 404 });
  }
}
