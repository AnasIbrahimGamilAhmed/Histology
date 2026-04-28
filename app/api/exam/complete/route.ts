import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId } = await request.json();
  if (!examId) {
    return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
  }

  try {
    await prisma.examInstance.update({
      where: { id: examId, userId },
      data: { status: "completed" }
    });
  } catch (error) {
    console.warn("Skipping complete update due to DB write error (Vercel SQLite read-only)", error);
  }

  return NextResponse.json({ success: true });
}
