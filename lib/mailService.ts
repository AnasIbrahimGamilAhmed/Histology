import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(email: string, code: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY not found. Email not sent.");
    // In dev mode, we still log it so you can see it in terminal
    console.log(`[DEV_MODE] Verification code for ${email} is: ${code}`);
    return;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  console.log(`Sending email to ${email} via Resend. Using sender: ${fromEmail}`);

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your HistoPro Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #4f46e5;">HistoPro Verification</h2>
          <p>You requested a verification code for your histology account.</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center;">
            ${code}
          </div>
          <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
            This code will expire in 15 minutes. If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
    } else {
      console.log("Resend Success:", data);
    }
  } catch (err) {
    console.error("Unexpected error sending email via Resend:", err);
  }
}
