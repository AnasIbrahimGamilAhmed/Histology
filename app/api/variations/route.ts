import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { VariationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CreateVariationBody = {
  sampleId: string;
  image: string;
  type: VariationType;
  notes?: string;
  approved: boolean;
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as CreateVariationBody;
  const sample = await prisma.sample.findUnique({ where: { id: body.sampleId } });
  if (!sample) {
    return NextResponse.json({ error: "Sample not found" }, { status: 404 });
  }

  if (!body.approved) {
    return NextResponse.json({ error: "Variation must be explicitly approved." }, { status: 400 });
  }

  const variation = await prisma.variation.create({
    data: {
      sampleId: body.sampleId,
      image: body.image,
      type: body.type,
      notes: body.notes,
      sourceType: "user_approved_upload",
      isApproved: true
    }
  });

  return NextResponse.json(variation);
}
