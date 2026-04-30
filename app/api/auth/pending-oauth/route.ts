import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing pending ID" }, { status: 400 });
  }

  try {
    const pending = await prisma.pendingOAuth.findUnique({
      where: { id }
    });

    if (!pending) {
      return NextResponse.json({ error: "Not found or expired" }, { status: 404 });
    }

    // Check if the pending record is too old (more than 30 minutes)
    const ageMs = Date.now() - pending.createdAt.getTime();
    if (ageMs > 30 * 60 * 1000) {
      // Clean up expired record
      await prisma.pendingOAuth.delete({ where: { id } });
      return NextResponse.json({ error: "Session expired" }, { status: 410 });
    }

    return NextResponse.json({
      email: pending.email,
      provider: pending.provider,
      name: pending.name,
    });

  } catch (error: any) {
    console.error("Pending OAuth fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
