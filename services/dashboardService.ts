import { prisma } from "@/lib/prisma";
import { getConfusionDrillPairs, getPredictionInsights } from "@/services/advancedFeaturesService";

type MasteryStatus = "Weak" | "Medium" | "Strong";

type DashboardData = {
  overall: {
    totalQuestionsAnswered: number;
    accuracyPercentage: number;
    weakSamplesCount: number;
    strongSamplesCount: number;
  };
  sampleMastery: {
    sampleId: string;
    sampleName: string;
    sampleNameAr?: string;
    masteryScore: number;
    status: MasteryStatus;
  }[];
  confusionTop5: {
    label: string;
    count: number;
  }[];
  progressTimeline: {
    date: string;
    answered: number;
    correct: number;
    accuracy: number;
  }[];
  trend: {
    direction: "increase" | "decrease" | "stable";
    delta: number;
  };
  insights: string[];
  predictions: {
    likelyExamTopics: string[];
    highRiskSamples: string[];
    weakFocusAreas: string[];
  };
  drillPairs: {
    sampleA: string;
    sampleB: string;
    confusionCount: number;
  }[];
};

function masteryStatus(score: number): MasteryStatus {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Medium";
  return "Weak";
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const progress = await prisma.userProgress.findUnique({
    where: { userId },
    include: {
      performances: {
        include: { sample: true },
        orderBy: { sample: { name: "asc" } }
      },
      confusionPairs: {
        orderBy: { count: "desc" },
        take: 5
      },
      attempts: {
        orderBy: { answeredAt: "asc" }
      }
    }
  });

  const allSamples = await prisma.sample.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, nameAr: true }
  });

  if (!progress) {
    return {
      overall: {
        totalQuestionsAnswered: 0,
        accuracyPercentage: 0,
        weakSamplesCount: 0,
        strongSamplesCount: 0
      },
      sampleMastery: allSamples.map((sample) => ({
        sampleId: sample.id,
        sampleName: sample.name,
        sampleNameAr: sample.nameAr ?? undefined,
        masteryScore: 0,
        status: "Weak"
      })),
      confusionTop5: [],
      progressTimeline: [],
      trend: { direction: "stable", delta: 0 },
      insights: ["No progress data yet. Start exam sessions to generate analytics."],
      predictions: {
        likelyExamTopics: [],
        highRiskSamples: [],
        weakFocusAreas: []
      },
      drillPairs: []
    };
  }

  const performanceBySample = new Map(progress.performances.map((item) => [item.sampleId, item]));
  const sampleMastery = allSamples.map((sample) => {
    const perf = performanceBySample.get(sample.id);
    const masteryScore = perf?.masteryScore ?? 0;
    return {
      sampleId: sample.id,
      sampleName: sample.name,
      sampleNameAr: sample.nameAr ?? undefined,
      masteryScore,
      status: masteryStatus(masteryScore)
    };
  });

  const weakSamplesCount = sampleMastery.filter((item) => item.status === "Weak").length;
  const strongSamplesCount = sampleMastery.filter((item) => item.status === "Strong").length;
  const totalQuestionsAnswered = progress.correctAnswers + progress.wrongAnswers;
  const accuracyPercentage =
    totalQuestionsAnswered === 0 ? 0 : Number(((progress.correctAnswers / totalQuestionsAnswered) * 100).toFixed(2));

  const sampleNameById = Object.fromEntries(allSamples.map((sample) => [sample.id, sample.name]));
  const confusionTop5 = progress.confusionPairs.map((pair) => ({
    label: `${sampleNameById[pair.sampleAId] ?? pair.sampleAId} ↔ ${sampleNameById[pair.sampleBId] ?? pair.sampleBId}`,
    count: pair.count
  }));

  const grouped = new Map<string, { answered: number; correct: number }>();
  for (const attempt of progress.attempts) {
    const date = attempt.answeredAt.toISOString().slice(0, 10);
    const prev = grouped.get(date) ?? { answered: 0, correct: 0 };
    prev.answered += 1;
    prev.correct += attempt.isCorrect ? 1 : 0;
    grouped.set(date, prev);
  }

  const progressTimeline = [...grouped.entries()].map(([date, value]) => ({
    date,
    answered: value.answered,
    correct: value.correct,
    accuracy: Number(((value.correct / value.answered) * 100).toFixed(2))
  }));

  const recent = progressTimeline.slice(-7);
  const previous = progressTimeline.slice(-14, -7);
  const recentAvg = recent.length ? recent.reduce((sum, day) => sum + day.accuracy, 0) / recent.length : 0;
  const previousAvg = previous.length ? previous.reduce((sum, day) => sum + day.accuracy, 0) / previous.length : recentAvg;
  const delta = Number((recentAvg - previousAvg).toFixed(2));
  const trend =
    delta > 1 ? { direction: "increase" as const, delta } : delta < -1 ? { direction: "decrease" as const, delta } : { direction: "stable" as const, delta };

  const insights: string[] = [];
  if (sampleMastery.some((item) => item.sampleName.toLowerCase().includes("epithelium") && item.status === "Weak")) {
    insights.push("You are currently weak in epithelial tissue recognition.");
  }

  const stainWrongRate = progress.attempts.filter((attempt) => attempt.variationType === "stain_variation" && !attempt.isCorrect).length;
  if (stainWrongRate >= 2) {
    insights.push("You confuse stain variations frequently. Re-check color and contrast cues.");
  }

  const boneSample = sampleMastery.find((item) => item.sampleName.toLowerCase().includes("bone"));
  if (boneSample && boneSample.masteryScore >= 70) {
    insights.push("Bone-related samples are improving. Keep reinforcing osteon-related features.");
  }

  if (insights.length === 0) {
    insights.push("Performance is stable. Continue mixed practice to improve medium-mastery samples.");
  }

  const predictions = await getPredictionInsights(userId);
  const drillPairs = await getConfusionDrillPairs(userId);

  return {
    overall: {
      totalQuestionsAnswered,
      accuracyPercentage,
      weakSamplesCount,
      strongSamplesCount
    },
    sampleMastery,
    confusionTop5,
    progressTimeline,
    trend,
    insights,
    predictions,
    drillPairs
  };
}
