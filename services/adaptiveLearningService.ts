import { ReviewStage } from "@prisma/client";
import type { QuestionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RecordAttemptInput = {
  userId: string;
  sampleId: string;
  examId?: string;
  questionId?: string;
  questionType: QuestionType;
  variationType?: "stain_variation" | "section_variation" | "magnification_variation" | "region_variation" | "exam_tricky_view" | null;
  mode?: "standard" | "pressure";
  timeSpentSeconds?: number;
  isCorrect: boolean;
  chosenSampleName?: string | null;
};

type StudyIndicator = "Weak" | "Strong" | "Needs Review";

function clampMastery(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function determineReviewStage(masteryScore: number, wrongCount: number): ReviewStage {
  if (wrongCount >= 3 || masteryScore < 45) {
    return ReviewStage.day_1_learning;
  }
  if (wrongCount >= 2 || masteryScore < 65) {
    return ReviewStage.day_3_review;
  }
  if (masteryScore < 85) {
    return ReviewStage.day_7_reinforcement;
  }
  return ReviewStage.pre_exam_final_revision;
}

function nextReviewDateFromStage(stage: ReviewStage, now: Date): Date {
  if (stage === ReviewStage.day_1_learning) return addDays(now, 1);
  if (stage === ReviewStage.day_3_review) return addDays(now, 3);
  if (stage === ReviewStage.day_7_reinforcement) return addDays(now, 7);
  return addDays(now, 14);
}

function normalizePair(a: string, b: string): { sampleAId: string; sampleBId: string } {
  return a < b ? { sampleAId: a, sampleBId: b } : { sampleAId: b, sampleBId: a };
}

async function getOrCreateUserProgress(userId: string) {
  let progress = await prisma.userProgress.findUnique({
    where: { userId }
  });

  if (!progress) {
    progress = await prisma.userProgress.create({
      data: {
        userId,
        weakSamples: []
      }
    });
  }

  return progress;
}

export async function recordExamAttempt(input: RecordAttemptInput) {
  const now = new Date();
  const progress = await getOrCreateUserProgress(input.userId);

  const updatedProgress = await prisma.userProgress.update({
    where: { id: progress.id },
    data: {
      correctAnswers: { increment: input.isCorrect ? 1 : 0 },
      wrongAnswers: { increment: input.isCorrect ? 0 : 1 }
    }
  });

  const existingPerformance = await prisma.samplePerformance.findUnique({
    where: {
      userProgressId_sampleId: {
        userProgressId: progress.id,
        sampleId: input.sampleId
      }
    }
  });

  const correctCount = (existingPerformance?.correctCount ?? 0) + (input.isCorrect ? 1 : 0);
  const wrongCount = (existingPerformance?.wrongCount ?? 0) + (input.isCorrect ? 0 : 1);
  const total = correctCount + wrongCount;
  const masteryScore = clampMastery(total === 0 ? 0 : (correctCount / total) * 100);
  const confusionRate = total === 0 ? 0 : Number((wrongCount / total).toFixed(2));

  await prisma.samplePerformance.upsert({
    where: {
      userProgressId_sampleId: {
        userProgressId: progress.id,
        sampleId: input.sampleId
      }
    },
    create: {
      userProgressId: progress.id,
      sampleId: input.sampleId,
      correctCount,
      wrongCount,
      masteryScore,
      confusionRate,
      lastAnsweredAt: now
    },
    update: {
      correctCount,
      wrongCount,
      masteryScore,
      confusionRate,
      lastAnsweredAt: now
    }
  });

  const stage = determineReviewStage(masteryScore, wrongCount);
  const nextReviewAt = nextReviewDateFromStage(stage, now);

  await prisma.reviewSchedule.upsert({
    where: {
      userProgressId_sampleId: {
        userProgressId: progress.id,
        sampleId: input.sampleId
      }
    },
    create: {
      userProgressId: progress.id,
      sampleId: input.sampleId,
      stage,
      nextReviewAt,
      mistakeFrequency: wrongCount,
      confusionRate
    },
    update: {
      stage,
      nextReviewAt,
      mistakeFrequency: wrongCount,
      confusionRate
    }
  });

  if (!input.isCorrect && input.chosenSampleName) {
    const chosenSample = await prisma.sample.findUnique({
      where: { name: input.chosenSampleName },
      select: { id: true }
    });

    if (chosenSample && chosenSample.id !== input.sampleId) {
      const pair = normalizePair(input.sampleId, chosenSample.id);
      await prisma.confusionPair.upsert({
        where: {
          userProgressId_sampleAId_sampleBId: {
            userProgressId: progress.id,
            sampleAId: pair.sampleAId,
            sampleBId: pair.sampleBId
          }
        },
        create: {
          userProgressId: progress.id,
          sampleAId: pair.sampleAId,
          sampleBId: pair.sampleBId,
          count: 1,
          lastConfusedAt: now
        },
        update: {
          count: { increment: 1 },
          lastConfusedAt: now
        }
      });
    }
  }

  const weakPerformances = await prisma.samplePerformance.findMany({
    where: {
      userProgressId: progress.id,
      OR: [{ masteryScore: { lt: 60 } }, { wrongCount: { gte: 2 } }]
    },
    select: { sampleId: true }
  });

  await prisma.userProgress.update({
    where: { id: progress.id },
    data: {
      weakSamples: weakPerformances.map((item) => item.sampleId)
    }
  });

  const totalAnswers = updatedProgress.correctAnswers + updatedProgress.wrongAnswers;
  const accuracyAfter = totalAnswers === 0 ? 0 : Number(((updatedProgress.correctAnswers / totalAnswers) * 100).toFixed(2));

  await prisma.attemptHistory.create({
    data: {
      userProgressId: progress.id,
      examInstanceId: input.examId ?? null,
      sampleId: input.sampleId,
      questionId: input.questionId ?? null,
      questionType: input.questionType,
      mode: input.mode ?? "standard",
      variationType: input.variationType ?? null,
      timeSpentSeconds: input.timeSpentSeconds ?? null,
      isCorrect: input.isCorrect,
      chosenSampleName: input.chosenSampleName ?? null,
      masteryAfter: masteryScore,
      accuracyAfter
    }
  });

  return updatedProgress;
}

export async function getStudyIndicators(userId: string): Promise<Record<string, StudyIndicator>> {
  const progress = await prisma.userProgress.findUnique({
    where: { userId },
    include: {
      performances: true,
      schedules: true
    }
  });

  if (!progress) {
    return {};
  }

  const now = new Date();
  const indicators: Record<string, StudyIndicator> = {};

  for (const performance of progress.performances) {
    const schedule = progress.schedules.find((item) => item.sampleId === performance.sampleId);
    const dueReview = schedule ? schedule.nextReviewAt <= now : false;

    if (performance.masteryScore >= 80 && !dueReview) {
      indicators[performance.sampleId] = "Strong";
      continue;
    }

    if (performance.masteryScore < 60 || performance.wrongCount >= 2) {
      indicators[performance.sampleId] = "Weak";
      continue;
    }

    indicators[performance.sampleId] = "Needs Review";
  }

  return indicators;
}

export async function touchUserActivity(userId: string, path: string) {
  const progress = await getOrCreateUserProgress(userId);
  await prisma.userProgress.update({
    where: { id: progress.id },
    data: {
      lastActivityAt: new Date(),
      lastActivityPath: path
    }
  });
}

export async function getLastActivityPath(userId: string): Promise<string | null> {
  const progress = await prisma.userProgress.findUnique({
    where: { userId },
    select: { lastActivityPath: true }
  });
  return progress?.lastActivityPath ?? null;
}
