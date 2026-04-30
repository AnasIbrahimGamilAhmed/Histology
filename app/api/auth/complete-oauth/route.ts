import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function generateRandomUniversityId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letters = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const numbers = Math.floor(1000 + Math.random() * 9000).toString();
  return `${letters}-${numbers}`;
}

export async function POST(req: Request) {
  try {
    const { pendingId, name, password } = await req.json();

    if (!pendingId || !name || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch the pending OAuth data
    const pending = await prisma.pendingOAuth.findUnique({
      where: { id: pendingId }
    });

    if (!pending) {
      return NextResponse.json({ error: "Signup session expired. Please try again." }, { status: 400 });
    }

    // 2. Generate a unique University ID
    let newId = '';
    let isUnique = false;
    while (!isUnique) {
      newId = generateRandomUniversityId();
      const existing = await prisma.studentAccount.findUnique({ where: { universityId: newId } });
      if (!existing) isUnique = true;
    }

    // 3. Create the StudentAccount
    const student = await prisma.studentAccount.create({
      data: {
        universityId: newId,
        name: name,
        email: pending.email,
        password: password,
      }
    });

    // 4. Create the LinkedAccount
    await prisma.linkedAccount.create({
      data: {
        userId: student.id,
        type: "oauth",
        provider: pending.provider,
        providerAccountId: pending.providerAccountId,
        email: pending.email,
      }
    });

    // 5. Create UserProgress
    await prisma.userProgress.create({
      data: {
        userId: student.universityId,
        weakSamples: []
      }
    });

    // 6. Delete the pending record
    await prisma.pendingOAuth.delete({
      where: { id: pendingId }
    });

    return NextResponse.json({ success: true, universityId: newId });

  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
