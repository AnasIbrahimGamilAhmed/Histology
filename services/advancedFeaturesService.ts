import { prisma } from "@/lib/prisma";

type PredictionResult = {
  likelyExamTopics: string[];
  highRiskSamples: string[];
  weakFocusAreas: string[];
};

type DrillPair = {
  sampleA: string;
  sampleB: string;
  confusionCount: number;
};

export async function getPredictionInsights(userId: string): Promise<PredictionResult> {
  const progress = await prisma.userProgress.findUnique({
    where: { userId },
    include: {
      performances: { include: { sample: true } },
      confusionPairs: true,
      attempts: true
    }
  });

  if (!progress) {
    return {
      likelyExamTopics: [],
      highRiskSamples: [],
      weakFocusAreas: []
    };
  }

  const likelyExamTopics = progress.performances
    .filter((item) => item.wrongCount >= 2 || item.masteryScore < 65)
    .map((item) => item.sample.name)
    .slice(0, 5);

  const highRiskSamples = progress.performances
    .filter((item) => item.masteryScore < 55)
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .map((item) => item.sample.name)
    .slice(0, 5);

  const weakFocusAreas: string[] = [];
  const trickyWrong = progress.attempts.filter((attempt) => attempt.variationType === "exam_tricky_view" && !attempt.isCorrect).length;
  const sectionWrong = progress.attempts.filter((attempt) => attempt.variationType === "section_variation" && !attempt.isCorrect).length;

  if (trickyWrong >= 2) {
    weakFocusAreas.push("Exam tricky view interpretation");
  }
  if (sectionWrong >= 2) {
    weakFocusAreas.push("Section orientation recognition");
  }
  if (progress.confusionPairs.some((pair) => pair.count >= 2)) {
    weakFocusAreas.push("Differentiating commonly confused sample pairs");
  }

  return {
    likelyExamTopics,
    highRiskSamples,
    weakFocusAreas
  };
}

export async function getConfusionDrillPairs(userId: string): Promise<DrillPair[]> {
  const progress = await prisma.userProgress.findUnique({
    where: { userId },
    include: {
      confusionPairs: {
        orderBy: { count: "desc" },
        take: 5
      }
    }
  });

  if (!progress) return [];

  const sampleIds = Array.from(
    new Set(progress.confusionPairs.flatMap((pair) => [pair.sampleAId, pair.sampleBId]))
  );
  const samples = await prisma.sample.findMany({
    where: { id: { in: sampleIds } },
    select: { id: true, name: true }
  });
  const nameById = Object.fromEntries(samples.map((sample) => [sample.id, sample.name]));

  return progress.confusionPairs.map((pair) => ({
    sampleA: nameById[pair.sampleAId] ?? pair.sampleAId,
    sampleB: nameById[pair.sampleBId] ?? pair.sampleBId,
    confusionCount: pair.count
  }));
}
