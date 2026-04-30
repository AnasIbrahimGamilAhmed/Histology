import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mailService";

export async function POST(req: Request) {
  try {
    const { universityId, email: selectedEmail } = await req.json();

    // STEP 1: Lookup ID and return emails
    if (universityId && !selectedEmail) {
      const student = await prisma.studentAccount.findUnique({
        where: { universityId },
        include: { accounts: true }
      });

      if (!student) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Collect all available emails
      const emailOptions = [];
      if (student.email) emailOptions.push(student.email);
      student.accounts.forEach(acc => {
        if (acc.email && !emailOptions.includes(acc.email)) {
          emailOptions.push(acc.email);
        }
      });

      // Mask emails for security: an***@gmail.com
      const maskedEmails = emailOptions.map(email => {
        const [user, domain] = email.split("@");
        return `${user.substring(0, 2)}***@${domain}`;
      });

      return NextResponse.json({ 
        success: true, 
        emails: maskedEmails,
        fullEmails: emailOptions // We'll use index to select on client
      });
    }

    // STEP 2: Send code to selected email
    if (selectedEmail) {
      // Find the student by universityId or by any linked email
      const student = await prisma.studentAccount.findFirst({
        where: {
          OR: [
            { universityId: universityId },
            { email: selectedEmail },
            { accounts: { some: { email: selectedEmail } } }
          ]
        }
      });

      if (student) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.studentAccount.update({
          where: { id: student.id },
          data: {
            resetToken: code,
            resetTokenExpiry: expiry
          }
        });

        await sendVerificationEmail(selectedEmail, code);
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
