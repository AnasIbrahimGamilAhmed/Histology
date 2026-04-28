import type { ExamQuestionType } from "@/lib/examService";

type MistakeClass =
  | "Misidentification error"
  | "Feature omission error"
  | "Confusion with similar sample"
  | "Misinterpretation of variation";

type TutorFeedbackInput = {
  questionType: ExamQuestionType;
  prompt: string;
  variationType: "stain_variation" | "section_variation" | "magnification_variation" | "region_variation" | "exam_tricky_view" | null;
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

export type TutorFeedbackResult = {
  status: "Correct Answer" | "Incorrect Answer";
  errorClassification: MistakeClass | null;
  explanation: string;
};

function classifyMistake(input: TutorFeedbackInput): MistakeClass {
  if (input.questionType === "identify_sample") {
    if (input.chosenSample && input.chosenSample.trim()) {
      return "Confusion with similar sample";
    }
    if (input.variationType === "exam_tricky_view" || input.variationType === "section_variation") {
      return "Misinterpretation of variation";
    }
    return "Misidentification error";
  }

  if (input.variationType === "magnification_variation" || input.variationType === "stain_variation") {
    return "Misinterpretation of variation";
  }
  return "Feature omission error";
}

function fallbackExplanation(input: TutorFeedbackInput, classification: MistakeClass | null): string {
  if (input.isCorrect) {
    return `Your answer matches the expected diagnosis for ${input.sample.name}. The key diagnostic features in this sample are: ${input.sample.keyFeatures.join(", ")}. Keep focusing on these features when the view changes.`;
  }

  const chosen = input.chosenSample ? ` You selected: ${input.chosenSample}.` : "";
  return `Your answer is not accepted for this question.${chosen} Correct reference: ${input.sample.name}. Focus on these key features: ${input.sample.keyFeatures.join(", ")}. Error type: ${classification ?? "Feature omission error"}.`;
}

export async function generateTutorFeedback(input: TutorFeedbackInput): Promise<TutorFeedbackResult> {
  const classification = input.isCorrect ? null : classifyMistake(input);
  const status: TutorFeedbackResult["status"] = input.isCorrect ? "Correct Answer" : "Incorrect Answer";

  if (!process.env.OPENAI_API_KEY) {
    return {
      status,
      errorClassification: classification,
      explanation: fallbackExplanation(input, classification)
    };
  }

  const systemPrompt =
    "You are a histology exam feedback tutor. Use ONLY the provided sample data and student answer. Do not add external medical facts. Keep explanation short, educational, and simple.";

  const userPrompt = JSON.stringify(
    {
      task: "Generate educational feedback after an exam answer.",
      requiredOutput: {
        format: "plain text, max 120 words",
        mustInclude: [
          "why answer is correct or incorrect",
          "key diagnostic features from provided sample only",
          "improvement advice for next question"
        ]
      },
      data: {
        questionType: input.questionType,
        questionPrompt: input.prompt,
        variationType: input.variationType,
        resultStatus: status,
        errorClassification: classification,
        userAnswer: input.userAnswer,
        correctReferenceSample: input.sample.name,
        correctReferenceDescription: input.sample.description,
        correctReferenceFeatures: input.sample.keyFeatures,
        correctAnswer: input.correctAnswer,
        chosenSample: input.chosenSample
      },
      hardRules: [
        "Do not invent histology knowledge",
        "Do not mention unknown structures",
        "Do not use any source outside provided data"
      ]
    },
    null,
    2
  );

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
          { role: "user", content: [{ type: "input_text", text: userPrompt }] }
        ]
      })
    });

    if (!response.ok) {
      return {
        status,
        errorClassification: classification,
        explanation: fallbackExplanation(input, classification)
      };
    }

    const data = (await response.json()) as { output_text?: string };

    return {
      status,
      errorClassification: classification,
      explanation: data.output_text?.trim() || fallbackExplanation(input, classification)
    };
  } catch {
    return {
      status,
      errorClassification: classification,
      explanation: fallbackExplanation(input, classification)
    };
  }
}
