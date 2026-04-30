import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.studentAccount.findUnique({
      where: { universityId: session.user.id },
      include: { accounts: true }
    });

    if (!student) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const providers = student.accounts.map(acc => acc.provider);

    return NextResponse.json({ providers });

  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
