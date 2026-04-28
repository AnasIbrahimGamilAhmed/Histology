import { NextResponse } from "next/server";
import { getAllSamples } from "@/lib/sampleService";

export async function GET() {
  const samples = await getAllSamples();
  return NextResponse.json(samples);
}

