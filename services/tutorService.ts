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
    if (input.questionType === "identify_structure") {
      return `Excellent! You correctly identified the structure in ${input.sample.name}.`;
    }
    if (input.questionType === "list_features" || input.questionType === "describe_features") {
      return `Correct! You identified the key diagnostic feature for ${input.sample.name}.`;
    }
    return `Excellent! You correctly identified ${input.sample.name}. Diagnostic features to remember: ${input.sample.keyFeatures.slice(0, 2).join(", ")}.`;
  }

  const chosen = input.chosenSample ? ` (You noted: ${input.chosenSample}).` : "";
  
  if (input.questionType === "identify_structure") {
    return `Not quite.${chosen} The correct structure was ${input.correctAnswer}. It's a key part of ${input.sample.name}.`;
  }
  
  if (input.questionType === "list_features" || input.questionType === "describe_features") {
    return `Not quite.${chosen} The expected diagnostic feature for ${input.sample.name} was: ${input.correctAnswer}. Keep practicing your observations!`;
  }

  return `Not quite.${chosen} The correct identification is ${input.sample.name}. Look for these key markers: ${input.sample.keyFeatures.slice(0, 2).join(", ")}. Don't worry, histology takes practice!`;
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
    "You are an expert Histology Tutor. Your goal is to help medical students master tissue identification under a microscope. Be encouraging, educational, and precise. Use ONLY the provided sample data.";

  const userPrompt = `
    TASK: Provide feedback for a histology exam question.
    
    QUESTION TYPE: "${input.questionType}" (This could be identifying the specimen, a specific structure, or a diagnostic feature)
    PROMPT GIVEN: "${input.prompt}"
    STUDENT ANSWER: "${input.userAnswer}"
    CORRECT ANSWER: "${input.correctAnswer}"
    CORRECT SPECIMEN: "${input.sample.name}"
    RESULT: ${status}
    ERROR TYPE: ${classification ?? "None"}
    
    SAMPLE DATA:
    - Description: ${input.sample.description}
    - Key Features: ${input.sample.keyFeatures.join(", ")}
    - Variation in this question: ${input.variationType ?? "Standard view"}
    
    INSTRUCTIONS:
    1. Focus your feedback on the QUESTION TYPE. If it was a structure/feature question, don't just talk about the specimen name.
    2. If correct, explain WHY (mentioning pathognomonic features).
    3. If incorrect, gently explain why the student's answer might be wrong and highlight the correct answer.
    4. Specifically address the variation (${input.variationType}) if present.
    5. Keep it under 80 words.
    6. Be professional and educational.
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", errText);
      return {
        status,
        errorClassification: classification,
        explanation: fallbackExplanation(input, classification)
      };
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content?.trim();

    return {
      status,
      errorClassification: classification,
      explanation: explanation || fallbackExplanation(input, classification)
    };
  } catch (err) {
    console.error("Tutor feedback generation failed:", err);
    return {
      status,
      errorClassification: classification,
      explanation: fallbackExplanation(input, classification)
    };
  }
}
