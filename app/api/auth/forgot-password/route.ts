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

      // Collect all available emails and phone
      const emailOptions: { type: 'email' | 'phone'; val: string }[] = [];
      if (student.email) emailOptions.push({ type: 'email', val: student.email });
      if (student.phone) emailOptions.push({ type: 'phone', val: student.phone });
      
      student.accounts.forEach(acc => {
        if (acc.email && !emailOptions.some(e => e.val === acc.email)) {
          emailOptions.push({ type: 'email', val: acc.email });
        }
      });

      // Mask for security
      const maskedOptions = emailOptions.map(opt => {
        if (opt.type === 'email') {
          const [user, domain] = opt.val.split("@");
          return { type: 'email', masked: `${user.substring(0, 2)}***@${domain}`, full: opt.val };
        } else {
          return { type: 'phone', masked: `${opt.val.substring(0, 4)}****${opt.val.slice(-3)}`, full: opt.val };
        }
      });

      return NextResponse.json({ 
        success: true, 
        options: maskedOptions
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
