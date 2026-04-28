import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const account = await prisma.studentAccount.findUnique({
      where: { email }
    });

    if (!account || account.resetToken !== code) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    if (account.resetTokenExpiry && new Date() > account.resetTokenExpiry) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
