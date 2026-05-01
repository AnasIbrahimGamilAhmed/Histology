import { prisma } from "@/lib/prisma";
import AtlasClient from "./AtlasClient";

export default async function AtlasPage() {
  let validSamples = [];
  try {
    const samples = await prisma.sample.findMany({
      include: {
        variations: {
          where: {
            image: { contains: "micro" }
          }
        }
      }
    });
    // Filter out samples with no micro variations
    validSamples = samples.filter(s => s.variations.length > 0);
  } catch (error) {
    console.error("Failed to fetch samples for Atlas during build:", error);
    validSamples = [];
  }

  return <AtlasClient samples={validSamples} />;
}
