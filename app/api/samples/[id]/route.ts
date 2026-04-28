import { NextResponse } from "next/server";
import { getSampleById } from "@/lib/sampleService";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const sample = await getSampleById(id);

  if (!sample) {
    return NextResponse.json({ error: "Sample not found" }, { status: 404 });
  }

  return NextResponse.json(sample);
}