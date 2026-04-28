import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mailService";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const account = await prisma.studentAccount.findUnique({
      where: { email }
    });

    if (account) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await prisma.studentAccount.update({
        where: { email },
        data: {
          resetToken: code,
          resetTokenExpiry: expiry
        }
      });

      await sendVerificationEmail(email, code);
      return NextResponse.json({ success: true }); 
    }

    return NextResponse.json({ success: true }); // Still return true for security
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
