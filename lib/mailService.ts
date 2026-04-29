import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendVerificationEmail(email: string, code: string) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY not found. Email not sent.");
    return;
  }
  
  console.log(`Sending email to ${email}. API Key starts with: ${process.env.SENDGRID_API_KEY.substring(0, 5)}...`);
  console.log(`Using sender: ${process.env.SENDGRID_FROM_EMAIL || 'no-reply@histopro.edu.eg'}`);

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@histopro.edu.eg', // Must be your verified sender in SendGrid
    subject: 'Your HistoPro Verification Code',
    text: `Your verification code is: ${code}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #4f46e5;">HistoPro Verification</h2>
        <p>You requested a verification code for your histology account.</p>
        <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center;">
          ${code}
        </div>
        <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
          This code will expire in 10 minutes. If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error("Error sending email via SendGrid:", error);
  }
}
