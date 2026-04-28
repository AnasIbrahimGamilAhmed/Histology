import { prisma } from "@/lib/prisma";

export type StudySample = {
  id: string;
  name: string;
  description: string;
  keyFeatures: string[];
  confusionTags: string[];
  variations: {
    id: string;
    sampleId: string;
    image: string;
    type: "stain_variation" | "section_variation" | "magnification_variation" | "region_variation" | "exam_tricky_view";
    notes: string | null;
  }[];
};

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

export async function getAllSamples() {
  const samples = await prisma.sample.findMany({
    orderBy: { name: "asc" },
    include: { variations: true }
  });

  return samples.map((sample) => ({
    ...sample,
    keyFeatures: toStringArray(sample.keyFeatures),
    confusionTags: toStringArray(sample.confusionTags)
  })) satisfies StudySample[];
}

export async function getComparisonSampleByConfusionTags(sampleId: string, confusionTags: string[]) {
  const normalizedTags = new Set(confusionTags.map((tag) => tag.toLowerCase()));
  const samples = await prisma.sample.findMany({
    where: { id: { not: sampleId } },
    include: { variations: true }
  });

  const candidate = samples
    .map((sample) => {
      const sampleTags = toStringArray(sample.confusionTags).map((tag) => tag.toLowerCase());
      const overlap = sampleTags.filter((tag) => normalizedTags.has(tag)).length;
      return { sample, overlap };
    })
    .filter((item) => item.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)[0];

  if (!candidate) {
    return null;
  }

  return {
    ...candidate.sample,
    keyFeatures: toStringArray(candidate.sample.keyFeatures),
    confusionTags: toStringArray(candidate.sample.confusionTags)
  } satisfies StudySample;
}

export async function getSampleById(id: string) {
  const sample = await prisma.sample.findUnique({
    where: { id },
    include: { variations: true }
  });

  if (!sample) {
    return null;
  }

  return {
    ...sample,
    keyFeatures: toStringArray(sample.keyFeatures),
    confusionTags: toStringArray(sample.confusionTags)
  } satisfies StudySample;
}

