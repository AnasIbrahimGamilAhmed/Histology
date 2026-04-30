import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await req.json();

    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 });
    }

    // 1. Get the student account
    const student = await (prisma.studentAccount as any).findUnique({
      where: { universityId: session.user.id },
      include: { accounts: true }
    }) as any;

    if (!student) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Check security: Allow unlinking if they have a password set (fallback method)
    if (!student.password || student.password.trim() === "") {
      if ((student.accounts || []).length <= 1) {
        return NextResponse.json({ 
          error: "Cannot unlink. You must have at least one login method (Password or Social Account)." 
        }, { status: 400 });
      }
    }

    // 3. Delete the linked account
    // We use deleteMany to avoid "Record not found" errors and for better type safety
    await (prisma as any).linkedAccount.deleteMany({
      where: {
        userId: student.id,
        provider: provider
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[UNLINK_ERROR]", error);
    return NextResponse.json({ error: "Failed to unlink account" }, { status: 500 });
  }
}
