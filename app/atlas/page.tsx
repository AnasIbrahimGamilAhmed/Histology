import { prisma } from "@/lib/prisma";
import AtlasClient from "./AtlasClient";

export default async function AtlasPage() {
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
  const validSamples = samples.filter(s => s.variations.length > 0);

  return <AtlasClient samples={validSamples} />;
}
