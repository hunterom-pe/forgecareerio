import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const supportSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").max(254),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters long").max(5000),
});

// In-memory rate limiter — best effort only (serverless functions may not share state)
// Keyed by client IP; resets on cold start.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 5; // 5 messages per IP per hour

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count += 1;
  return true;
}

// Escape user-supplied strings before embedding in HTML email
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await req.json();

    const validation = supportSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, email, subject, message } = validation.data;

    const { error } = await resend.emails.send({
      from: "Forge Support <hello@forgecareer.io>",
      to: ["hunterom8@proton.me"],
      replyTo: email,
      subject: `[SUPPORT TICKET] ${escapeHtml(subject)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
          <h2 style="color: #0f172a;">New Support Inquiry</h2>
          <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="white-space: pre-wrap; line-height: 1.6; color: #334155;">${escapeHtml(message)}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">Sent via Forge Support Center</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ message: "Message sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Support API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
