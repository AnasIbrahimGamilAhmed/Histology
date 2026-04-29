import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { DifficultyLevel, VariationType } from "@prisma/client";

export type ExamMode = "standard" | "pressure";
export type ExamQuestionType =
  | "identify_sample"
  | "list_features"
  | "identify_tissue_type"
  | "compare_samples"
  | "interpret_partial_slide"
  | "identify_structure"
  | "describe_features";

export type QuestionPattern =
  | "identify_specimen"
  | "identify_tissue_type"
  | "describe_features"
  | "compare_views"
  | "interpret_partial_slide"
  | "identify_structure";

export type MicroscopyConfig = {
  zoomLevel: 1 | 2 | 3;
  partialView: boolean;
  blurPx: number;
  contrast: number;
  rotationDeg: number;
  cropRect?: { x: number; y: number; width: number; height: number };
};

export type ExamQuestion = {
  examId: string;
  id: string;
  sampleId: string;
  type: ExamQuestionType;
  difficulty: DifficultyLevel;
  prompt: string;
  image: string;
  variationType: VariationType | null;
  choices: string[];
  acceptedAnswers: string[];
  pressureConfig?: {
    timerSeconds: number;
    oneTimeImageView: boolean;
    noHints: boolean;
    noGoingBack: boolean;
  };
  microscopy: MicroscopyConfig;
  sample: {
    name: string;
    description: string;
    keyFeatures: string[];
  };
};

export type ExamResponse = {
  examId: string;
  questions: ExamQuestion[];
};

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomElement<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function sampleCategory(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("epitheli") || lower.includes("epithelium")) return "epithelial";
  if (/(cartilage|bone|connective|adipose|areolar)/.test(lower)) return "connective";
  if (/(muscle|skeletal|smooth|cardiac)/.test(lower)) return "muscle";
  if (/(nerve|spinal cord|sciatic|nervous|neuroglia|motor neuron)/.test(lower)) return "nervous";
  if (/(blood|rabbit|toad)/.test(lower)) return "blood";
  if (/(liver|kidney|stomach|esophagus|trachea|pancreas|ileum)/.test(lower)) return "organ";
  if (lower.includes("skin")) return "skin";
  return "other";
}

function categoryLabel(name: string) {
  const category = sampleCategory(name);
  if (category === "epithelial") return "Epithelial tissue";
  if (category === "connective") return "Connective tissue";
  if (category === "muscle") return "Muscle tissue";
  if (category === "nervous") return "Nervous tissue";
  if (category === "blood") return "Blood film";
  if (category === "organ") return "Organ section";
  if (category === "skin") return "Skin histology";
  return "Mixed histology";
}

function buildMicroscopyConfig(variation: { type: VariationType }) {
  const partialView = Math.random() < 0.45;
  const zoomLevel = (Math.random() < 0.35 ? 3 : Math.random() < 0.6 ? 2 : 1) as 1 | 2 | 3;
  const blurPx = partialView ? 2 + Math.random() * 2 : Math.random() * 1.8;
  const contrast = Number((0.75 + Math.random() * 0.5).toFixed(2));
  const rotationDeg = Math.round((Math.random() - 0.5) * 24);
  const cropRect = partialView
    ? {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20),
        width: 70 + Math.floor(Math.random() * 25),
        height: 70 + Math.floor(Math.random() * 25)
      }
    : undefined;

  return { zoomLevel, partialView, blurPx, contrast, rotationDeg, cropRect };
}

function fingerprintForQuestion(question: {
  prompt: string;
  sampleId: string;
  variationType: VariationType | null;
  type: ExamQuestionType;
  choices: string[];
  difficulty: DifficultyLevel;
  reasoningPattern: QuestionPattern;
}) {
  const normalized = [
    normalize(question.prompt),
    question.sampleId,
    question.variationType ?? "none",
    question.type,
    question.difficulty,
    question.reasoningPattern,
    ...question.choices.map((choice) => normalize(choice)).sort()
  ].join("|");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function buildQuestionTemplate(
  sample: { id: string; name: string; description: string; keyFeatures: unknown; confusionTags: unknown; variations: { id: string; image: string; type: VariationType }[] },
  allSamples: { id: string; name: string; category: string }[],
  type: ExamQuestionType,
  difficulty: DifficultyLevel,
  variation: { id: string; image: string; type: VariationType }
): { prompt: string; choices: string[]; acceptedAnswers: string[]; reasoningPattern: QuestionPattern } {
  const sampleLabel = sample.name;
  const category = categoryLabel(sampleLabel);
  const parsedFeatures = Array.isArray(sample.keyFeatures) ? sample.keyFeatures : typeof sample.keyFeatures === "string" ? [sample.keyFeatures] : [];
  const featureChoices = parsedFeatures.length > 0 ? parsedFeatures : [sample.description];

  const sampleChoices = shuffle(
    allSamples
      .filter((candidate) => candidate.id !== sample.id && candidate.category === category)
      .map((candidate) => candidate.name)
  ).slice(0, 3);

  // If not enough in same category, fill with others
  if (sampleChoices.length < 3) {
    const others = shuffle(
      allSamples
        .filter((candidate) => candidate.id !== sample.id && !sampleChoices.includes(candidate.name))
        .map((candidate) => candidate.name)
    ).slice(0, 3 - sampleChoices.length);
    sampleChoices.push(...others);
  }

  const tissueOptions = [
    "Epithelial tissue",
    "Connective tissue",
    "Muscle tissue",
    "Nervous tissue",
    "Blood film",
    "Organ section",
    "Skin histology"
  ];

  const compareChoices = shuffle([...sampleChoices, sampleLabel]).slice(0, 4);

  const structurePool = shuffle(
    allSamples
      .flatMap((candidate) => candidate.name === sampleLabel ? [] : [
        ...(candidate.name.toLowerCase().includes("bone") ? ["Osteon", "Concentric lamellae", "Haversian canal"] : []),
        ...(candidate.name.toLowerCase().includes("muscle") ? ["Striation", "Intercalated disc", "Peripheral nuclei"] : []),
        ...(candidate.name.toLowerCase().includes("cartilage") ? ["Lacuna", "Isogenous group", "Perichondrium"] : []),
        ...(candidate.name.toLowerCase().includes("liver") ? ["Central vein", "Hepatic sinusoid", "Kupffer cell"] : []),
        ...(candidate.name.toLowerCase().includes("spinal") ? ["Butterfly-shaped grey matter", "Central canal", "Ventral horn"] : []),
        ...(candidate.name.toLowerCase().includes("skin") ? ["Keratin layer", "Hair follicle", "Sebaceous gland"] : []),
        ...(candidate.name.toLowerCase().includes("blood") ? ["Nucleated RBC", "Lymphocyte", "Platelet"] : [])
      ])
      .filter(Boolean) as string[]
  );

  const structureChoices = shuffle([...featureChoices.slice(0, 3), ...structurePool.slice(0, 6)]).slice(0, 4);
  const structureAnswer = featureChoices[0];

  switch (type) {
    case "identify_sample":
      return {
        prompt: `Based on this microscopic view, identify the specific histology specimen.`,
        choices: shuffle([...compareChoices]),
        acceptedAnswers: [sampleLabel],
        reasoningPattern: "identify_specimen" as const
      };
    case "identify_tissue_type":
      return {
        prompt: `Analyze the cellular arrangement and extracellular matrix. Which broad tissue category does this belong to?`,
        choices: tissueOptions,
        acceptedAnswers: [category],
        reasoningPattern: "identify_tissue_type" as const
      };
    case "compare_samples":
      return {
        prompt: `Focusing on the key diagnostic features, which specimen is most likely represented here?`,
        choices: compareChoices,
        acceptedAnswers: [sampleLabel],
        reasoningPattern: "compare_views" as const
      };
    case "interpret_partial_slide":
      return {
        prompt: `Clinical micro-view: Even in this specific or tricky field, which specimen can be confirmed?`,
        choices: shuffle([...compareChoices]),
        acceptedAnswers: [sampleLabel],
        reasoningPattern: "interpret_partial_slide" as const
      };
    case "identify_structure":
      return {
        prompt: `Which specific histological structure is most clearly visible in this high-power region?`,
        choices: structureChoices.length >= 4 ? structureChoices : [featureChoices[0], "Parallel fibers", "Lacunae", "Central vein"],
        acceptedAnswers: [structureAnswer],
        reasoningPattern: "identify_structure" as const
      };
    case "list_features":
    case "describe_features":
      return {
        prompt: `Identify the pathognomonic feature or practical tip that confirms this as ${sampleLabel}.`,
        choices: [],
        acceptedAnswers: parsedFeatures.length > 0 ? parsedFeatures : [sample.description],
        reasoningPattern: "describe_features" as const
      };
    default:
      return {
        prompt: `Identify this specimen from the provided microscope field.`,
        choices: shuffle([...compareChoices]),
        acceptedAnswers: [sampleLabel],
        reasoningPattern: "identify_specimen" as const
      };
  }
}

function buildQuestionTypeWeightList() {
  return [
    { type: "identify_sample" as const, weight: 18 },
    { type: "identify_tissue_type" as const, weight: 14 },
    { type: "compare_samples" as const, weight: 14 },
    { type: "interpret_partial_slide" as const, weight: 12 },
    { type: "identify_structure" as const, weight: 10 },
    { type: "list_features" as const, weight: 10 },
    { type: "describe_features" as const, weight: 8 }
  ];
}

function weightedChoice<T extends { weight: number; type: ExamQuestionType }>(items: T[]) {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
  let threshold = Math.random() * total;
  for (const item of items) {
    threshold -= Math.max(0, item.weight);
    if (threshold <= 0) {
      return item;
    }
  }
  return items[items.length - 1];
}

async function getPreviousExamSamplePatterns(userId: string) {
  const previousQuestions = await prisma.examQuestionInstance.findMany({
    where: {
      examInstance: {
        userId
      }
    },
    orderBy: { id: "desc" },
    take: 50,
    select: {
      sampleId: true,
      reasoningPattern: true
    }
  });

  const map = new Map<string, Set<QuestionPattern>>();
  for (const item of previousQuestions) {
    const patterns = map.get(item.sampleId) ?? new Set<QuestionPattern>();
    patterns.add(item.reasoningPattern as QuestionPattern);
    map.set(item.sampleId, patterns);
  }
  return map;
}

async function getUniqueSamplePool(userId: string, limit: number, mode: ExamMode) {
  const allAvailable = await prisma.sample.findMany({ include: { variations: true } });
  if (allAvailable.length === 0) return [];

  // ONLY include samples that have at least one micro image
  const poolWithMicro = allAvailable.filter(s => 
    s.variations.some(v => v.image.toLowerCase().includes("micro"))
  );

  if (poolWithMicro.length === 0) return [];

  // Exclude samples from the last few exams to ensure high variety
  const recentSampleIds = new Set(
    (await prisma.examQuestionInstance.findMany({
      where: {
        examInstance: { userId }
      },
      orderBy: { id: 'desc' },
      take: limit * 2.5,
      select: { sampleId: true }
    })).map((item) => item.sampleId)
  );

  const filteredPool = poolWithMicro.filter((s) => !recentSampleIds.has(s.id));
  const poolToUse = filteredPool.length >= limit ? filteredPool : poolWithMicro;

  return shuffle(poolToUse).slice(0, limit);
}

async function createExamInstance(userId: string, options: { mode: ExamMode; limit: number; forceConfusionDrill?: boolean }) {
  const availableSamples = await prisma.sample.findMany({ include: { variations: true } });
  const allSamples = availableSamples.map((sample) => ({ id: sample.id, name: sample.name, category: sampleCategory(sample.name) }));
  const previousPatterns = await getPreviousExamSamplePatterns(userId);
  const existingFingerprints = new Set(
    (await prisma.examQuestionInstance.findMany({ select: { fingerprint: true } })).map((item) => item.fingerprint)
  );

  const samplePool = await getUniqueSamplePool(userId, options.limit, options.mode);
  const questions = [] as Array<{
    sampleId: string;
    variationId?: string;
    type: ExamQuestionType;
    difficulty: DifficultyLevel;
    prompt: string;
    image: string;
    variationType: VariationType | null;
    choices: string[];
    acceptedAnswers: string[];
    reasoningPattern: QuestionPattern;
    microscopyConfig: MicroscopyConfig;
    fingerprint: string;
  }>;

  for (const sample of samplePool) {
    // FORCE usage of ONLY micro images as requested by the user
    const microVariations = sample.variations.filter(v => v.image.toLowerCase().includes("micro"));
    
    // Strictly skip samples that don't have a micro (or revision) image
    if (microVariations.length === 0) continue;
    
    const variation = randomElement(microVariations);
    if (!variation) continue;

    const typeCandidates = buildQuestionTypeWeightList()
      .map((entry) => ({ type: entry.type, weight: entry.weight }))
      .filter((entry) => {
        const existingPatterns = previousPatterns.get(sample.id);
        if (!existingPatterns) return true;
        return entry.type !== "list_features"
          ? true
          : true;
      });

    const selectedType = weightedChoice(typeCandidates);
    const difficulty: DifficultyLevel = variation.type === "exam_tricky_view" ? "hard" : Math.random() < 0.4 ? "hard" : Math.random() < 0.6 ? "medium" : "easy";
    const template = buildQuestionTemplate(sample, allSamples, selectedType.type, difficulty, variation);
    const fingerprint = fingerprintForQuestion({
      prompt: template.prompt,
      sampleId: sample.id,
      variationType: variation.type,
      type: selectedType.type,
      choices: template.choices,
      difficulty,
      reasoningPattern: template.reasoningPattern
    });

    if (existingFingerprints.has(fingerprint)) {
      continue;
    }

    questions.push({
      sampleId: sample.id,
      variationId: variation.id,
      type: selectedType.type,
      difficulty,
      prompt: template.prompt,
      image: variation.image,
      variationType: variation.type,
      choices: template.choices,
      acceptedAnswers: template.acceptedAnswers,
      reasoningPattern: template.reasoningPattern,
      microscopyConfig: buildMicroscopyConfig(variation),
      fingerprint
    });
  }

  if (questions.length === 0) {
    throw new Error("Failed to create a unique exam. Try again later.");
  }

  const uniqueSignature = crypto.createHash("sha256").update(questions.map((question) => question.fingerprint).join("|")).digest("hex");

  try {
    const created = await prisma.examInstance.create({
      data: {
        userId,
        mode: options.mode,
        status: "active",
        questionCount: questions.length,
        uniqueSignature,
        questions: {
          create: questions.map((question) => ({
            sampleId: question.sampleId,
            variationId: question.variationId,
            type: question.type,
            difficulty: question.difficulty,
            prompt: question.prompt,
            image: question.image,
            variationType: question.variationType,
            choices: question.choices,
            acceptedAnswers: question.acceptedAnswers,
            microscopyConfig: question.microscopyConfig,
            reasoningPattern: question.reasoningPattern,
            fingerprint: question.fingerprint
          }))
        }
      },
      include: {
        questions: {
          include: {
            sample: true
          }
        }
      }
    });

    return created;
  } catch (error) {
    console.warn("Falling back to stateless exam due to database write error (e.g. Vercel SQLite read-only).", error);
    const mockExamId = "stateless-exam-" + Date.now();
    return {
      id: mockExamId,
      userId,
      mode: options.mode,
      status: "active",
      questionCount: questions.length,
      uniqueSignature,
      createdAt: new Date(),
      updatedAt: new Date(),
      questions: questions.map((q, i) => {
        const fullSample = availableSamples.find((s) => s.id === q.sampleId);
        return {
          id: "stateless-q-" + i,
          examInstanceId: mockExamId,
          questionTemplateId: null,
          sampleId: q.sampleId,
          variationId: q.variationId || null,
          type: q.type,
          reasoningPattern: q.reasoningPattern,
          difficulty: q.difficulty,
          prompt: q.prompt,
          image: q.image,
          choices: q.choices,
          acceptedAnswers: q.acceptedAnswers,
          microscopyConfig: q.microscopyConfig,
          variationType: q.variationType || null,
          fingerprint: q.fingerprint,
          sample: fullSample || { name: "", description: "", keyFeatures: [] }
        };
      })
    } as any;
  }
}

async function findActiveExam(userId: string, mode: ExamMode, limit: number) {
  return prisma.examInstance.findFirst({
    where: {
      userId,
      mode,
      status: "active",
      questionCount: limit
    },
    include: {
      questions: {
        include: {
          sample: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function getExamQuestionsForMode(
  userId: string,
  options: { mode: ExamMode; limit?: number; forceConfusionDrill?: boolean; forceRegenerate?: boolean }
): Promise<ExamResponse> {
  const limit = options.limit ?? 8;
  const existing = await findActiveExam(userId, options.mode, limit);
  if (existing && existing.questions.length > 0 && !options.forceRegenerate) {
    return {
      examId: existing.id,
      questions: existing.questions.map((question) => ({
        examId: existing.id,
        id: question.id,
        sampleId: question.sampleId,
        type: question.type as ExamQuestionType,
        difficulty: question.difficulty,
        prompt: question.prompt,
        image: question.image,
        variationType: question.variationType,
        choices: Array.isArray(question.choices) ? question.choices.filter((item: any): item is string => typeof item === "string") : [],
        acceptedAnswers: Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers.filter((item: any): item is string => typeof item === "string") : [],
        pressureConfig:
          options.mode === "pressure"
            ? {
                timerSeconds: question.difficulty === "hard" ? 25 : question.difficulty === "medium" ? 35 : 45,
                oneTimeImageView: true,
                noHints: true,
                noGoingBack: true
              }
            : undefined,
        microscopy: question.microscopyConfig as MicroscopyConfig,
        sample: {
          name: question.sample.name,
          description: question.sample.description,
          keyFeatures: Array.isArray(question.sample.keyFeatures) ? question.sample.keyFeatures.filter((item: any): item is string => typeof item === "string") : []
        }
      }))
    };
  }

  const exam = await createExamInstance(userId, { mode: options.mode, limit, forceConfusionDrill: options.forceConfusionDrill });
  return {
    examId: exam.id,
    questions: exam.questions.map((question: any) => ({
      examId: exam.id,
      id: question.id,
      sampleId: question.sampleId,
      type: question.type as ExamQuestionType,
      difficulty: question.difficulty,
      prompt: question.prompt,
      image: question.image,
      variationType: question.variationType,
      choices: Array.isArray(question.choices) ? question.choices.filter((item: any): item is string => typeof item === "string") : [],
      acceptedAnswers: Array.isArray(question.acceptedAnswers) ? question.acceptedAnswers.filter((item: any): item is string => typeof item === "string") : [],
      pressureConfig:
        options.mode === "pressure"
          ? {
              timerSeconds: question.difficulty === "hard" ? 25 : question.difficulty === "medium" ? 35 : 45,
              oneTimeImageView: true,
              noHints: true,
              noGoingBack: true
            }
          : undefined,
      microscopy: question.microscopyConfig as MicroscopyConfig,
      sample: {
        name: question.sample.name,
        description: question.sample.description,
        keyFeatures: Array.isArray(question.sample.keyFeatures) ? question.sample.keyFeatures.filter((item: any): item is string => typeof item === "string") : []
      }
    }))
  };
}

export async function getConfusionDrillQuestions(userId: string, limit = 6): Promise<ExamResponse> {
  return getExamQuestionsForMode(userId, {
    mode: "standard",
    limit,
    forceConfusionDrill: true,
    forceRegenerate: true
  });
}
