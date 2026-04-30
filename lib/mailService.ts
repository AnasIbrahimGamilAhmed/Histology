import nodemailer from 'nodemailer';

const DEV_MODE = process.env.NODE_ENV === 'development';

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Your App Password
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  // Always log in terminal for development
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
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; border-radius: 10px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log(`Email sent via Gmail: ${info.messageId}`);
    return { success: true };
  } catch (err) {
    console.error("Nodemailer Error:", err);
    return { success: false, error: err };
  }
}
