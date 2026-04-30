import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mailService";

export async function POST(req: Request) {
  try {
    const { universityId, email: selectedEmail } = await req.json();

    // STEP 1: Lookup ID and return emails
    if (universityId && !selectedEmail) {
      const student = await (prisma.studentAccount as any).findUnique({
        where: { universityId },
        include: { accounts: true }
      });

      if (!student) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Collect all available emails
      const emailOptions: { type: 'email'; val: string; provider: string }[] = [];
      
      // 1. Primary Email (Manual Account)
      if (student.email && !student.email.endsWith("@example.com")) {
        emailOptions.push({ type: 'email', val: student.email, provider: 'Manual Account' });
      }
      
      // 2. Linked Social Accounts
      if ((student as any).accounts) {
        (student as any).accounts.forEach((acc: any) => {
          if (acc.email && !acc.email.endsWith("@example.com")) {
            const existing = emailOptions.find(e => e.val === acc.email);
            const providerName = acc.provider === "google" ? "Google" : 
                                 acc.provider === "microsoft-entra-id" ? "Microsoft" : 
                                 acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1);
            
            if (!existing) {
              emailOptions.push({ 
                type: 'email', 
                val: acc.email, 
                provider: `${providerName} Account` 
              });
            } else if (!existing.provider.includes(providerName)) {
              existing.provider += ` & ${providerName}`;
            }
          }
        });
      }

      // Mask for security
      const maskedOptions = emailOptions.map(opt => {
        const [user, domain] = opt.val.split("@");
        return { 
          type: 'email', 
          masked: `${user.substring(0, 2)}***@${domain}`, 
          full: opt.val,
          provider: opt.provider
        };
      });

      return NextResponse.json({ 
        success: true, 
        options: maskedOptions
      });
    }

    // STEP 2: Send code to selected target (email)
    if (selectedEmail) {
      const student = await (prisma.studentAccount as any).findFirst({
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
