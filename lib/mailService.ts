import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(email: string, code: string) {
  // Always log in terminal for development
  console.log(`\n================================================`);
  console.log(`[DEV_MODE] Verification code for ${email} is: ${code}`);
  console.log(`================================================\n`);

  if (!resend) {
    console.warn("RESEND_API_KEY not set. Email not sent.");
    return { success: true, message: "Dev mode: Code logged to terminal" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: "Verification Code - HistoPro",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">HistoPro Verification</h2>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Resend Exception:", error);
    return { success: false, error };
  }
}
