import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  console.log(`\n================================================`);
  console.log(`[DEV_MODE] Verification code for ${email} is: ${code}`);
  console.log(`================================================\n`);

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD not set. Email not sent.");
    return { success: true, message: "Dev mode: Code logged to terminal" };
  }

  try {
    const info = await transporter.sendMail({
      from: `"HistoPro Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verification Code - HistoPro",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">HistoPro Verification</h2>
          <p>Your verification code is: <strong style="font-size: 24px;">${code}</strong></p>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    console.log(`Email sent via Gmail: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error("Nodemailer Error:", error);
    return { success: false, error };
  }
}
