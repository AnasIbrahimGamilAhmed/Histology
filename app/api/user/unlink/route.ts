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
    const student = await prisma.studentAccount.findUnique({
      where: { universityId: session.user.id },
      include: { accounts: true }
    });

    if (!student) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Check security: Don't allow unlinking if it's the ONLY way they can log in 
    // (i.e., if they have no password set or no other accounts)
    // Actually, in our system they ALWAYS have a password (either manual or set during OAuth signup)
    // But as an extra safety measure:
    if (student.accounts.length <= 1 && (!student.password || student.password === "PENDING_OAUTH_SETUP")) {
      return NextResponse.json({ 
        error: "Cannot unlink the only login method. Please set a password first." 
      }, { status: 400 });
    }

    // 3. Delete the linked account
    await prisma.linkedAccount.delete({
      where: {
        provider_providerAccountId: {
          provider: provider,
          providerAccountId: student.accounts.find(a => a.provider === provider)?.providerAccountId || ""
        }
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("[UNLINK_ERROR]", error);
    return NextResponse.json({ error: "Failed to unlink account" }, { status: 500 });
  }
}
