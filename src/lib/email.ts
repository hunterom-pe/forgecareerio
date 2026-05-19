import { Resend } from 'resend';

export async function sendWelcomeEmail(toEmail: string, userName?: string | null) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not found. Skipping welcome email.");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const displayName = userName || toEmail.split('@')[0];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://forgecareer.io';
    const loginUrl = `${baseUrl}/login`;

    const { data, error } = await resend.emails.send({
      from: 'Forge <hello@forgecareer.io>',
      to: [toEmail],
      subject: `Welcome to Forge! Let's get started.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff;">
          <div style="margin-bottom: 60px; text-align: left;">
            <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; letter-spacing: 0.4em; margin: 0; text-transform: uppercase;">FORGE</h1>
          </div>
          
          <div style="border-left: 1px solid #e2e8f0; padding-left: 32px; margin-bottom: 48px;">
            <h2 style="color: #0f172a; font-size: 32px; font-weight: 800; margin-top: 0; letter-spacing: -0.02em; line-height: 1.1;">
              Welcome to the <br/>
              <span style="color: #2563eb;">Elite Performance</span> Tier.
            </h2>
            <p style="color: #64748b; font-size: 16px; font-weight: 500; line-height: 1.6; margin-top: 24px;">
              Hello ${displayName},<br/><br/>
              Your account has been successfully initialized. You now have full access to the Forge Surgical Intelligence Engine. Forge your professional path today.
            </p>
          </div>
          
          <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 32px; border-radius: 24px; margin-bottom: 48px;">
            <p style="color: #0f172a; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0; margin-bottom: 12px;">Immediate Actions Required:</p>
            <ul style="color: #64748b; font-size: 14px; font-weight: 500; line-height: 1.8; padding-left: 20px; margin: 0;">
              <li>Complete your profile to calibrate the DNA matching engine.</li>
              <li>Upload your master resume for surgical ATS optimization.</li>
              <li>Initiate your first deep-scan discovery.</li>
            </ul>
          </div>
          
          <a href="${loginUrl}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 20px 40px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.2em; box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.3);">
            Access The Dashboard
          </a>
          
          <div style="margin-top: 80px; padding-top: 32px; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1.8;">
              © 2026 FORGE SYSTEMS &bull; FORGECAREER.IO<br/>
              PHOENIX, AZ &bull; <a href="${baseUrl}/dashboard/profile" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a><br/>
              BANK-LEVEL SECURITY &bull; AES-256 ENCRYPTED
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Email Sending Error:", error);
      return;
    }

    console.log("Welcome email sent successfully to:", toEmail, data?.id);
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}
