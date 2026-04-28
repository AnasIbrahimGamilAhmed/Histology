import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { recordExamAttempt } from "@/services/adaptiveLearningService";
import { generateTutorFeedback } from "@/services/tutorService";
import type { ExamQuestionType } from "@/lib/examService";

type FeedbackRequestBody = {
  examId?: string;
  questionId: string;
  sampleId: string;
  questionType: ExamQuestionType;
  prompt: string;
  variationType: "stain_variation" | "section_variation" | "magnification_variation" | "region_variation" | "exam_tricky_view" | null;
  mode?: "standard" | "pressure";
  timeSpentSeconds?: number;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  chosenSample: string | null;
  sample: {
    name: string;
    description: string;
    keyFeatures: string[];
  };
};

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as FeedbackRequestBody;

  await recordExamAttempt({
    userId,
    sampleId: body.sampleId,
    examId: body.examId,
    questionId: body.questionId,
    questionType: body.questionType,
    variationType: body.variationType,
    mode: body.mode,
    timeSpentSeconds: body.timeSpentSeconds,
    isCorrect: body.isCorrect,
    chosenSampleName: body.chosenSample
  });

  const feedback = await generateTutorFeedback(body);
  return NextResponse.json(feedback);
}
