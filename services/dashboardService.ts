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
  
  // Categorical Analysis
  const weakSamples = sampleMastery.filter(s => s.status === "Weak");
  const weakCategories = new Set(weakSamples.map(s => {
    const name = s.sampleName.toLowerCase();
    if (name.includes("epitheli")) return "Epithelial Tissue";
    if (name.includes("muscle")) return "Muscle Tissue";
    if (name.includes("bone") || name.includes("cartilage")) return "Skeletal Tissue";
    if (name.includes("blood")) return "Hematology";
    return "Organ Systems";
  }));

  if (weakCategories.has("Epithelial Tissue")) {
    insights.push("Focus on the 'Basement Membrane' and 'Cell Shape' for Epithelial samples. You seem to confuse simple vs stratified layers.");
  }
  
  if (weakCategories.has("Muscle Tissue")) {
    insights.push("Diagnostic Tip: Look for 'Striations' and 'Nuclei Position' to differentiate between Skeletal (peripheral) and Cardiac (central) muscle.");
  }

  // Error Pattern Analysis
  const stainWrongRate = progress.attempts.filter((attempt) => attempt.variationType === "stain_variation" && !attempt.isCorrect).length;
  if (stainWrongRate >= 3) {
    insights.push("Warning: You are relying too much on 'Color'. Histology is about 'Structure'. Practice with the grayscale mode in the Atlas.");
  }

  const zoomWrongRate = progress.attempts.filter((attempt) => attempt.variationType === "zoom_variation" && !attempt.isCorrect).length;
  if (zoomWrongRate >= 3) {
    insights.push("Identification Alert: You struggle with High-Power views. Spend more time in 'Magnifier Mode' to recognize cellular details.");
  }

  // Mastery Praise
  if (strongSamplesCount > 5) {
    insights.push(`Excellent work! You have mastered ${strongSamplesCount} specimens. Try the 'Pressure Mode' to test your speed.`);
  }

  if (insights.length === 0) {
    insights.push("Your performance is stable. We recommend taking a 'Mixed Practice' exam to discover new areas for improvement.");
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
