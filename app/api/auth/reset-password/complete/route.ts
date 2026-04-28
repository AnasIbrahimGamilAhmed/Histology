import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    // Update password and clear token
    await prisma.studentAccount.update({
      where: { email },
      data: {
        password: password, // In real app, hash this!
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
