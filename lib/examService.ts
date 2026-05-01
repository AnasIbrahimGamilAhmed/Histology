/** Version: 2.1.1 - Sample Splitting (Keratinized/Non) **/
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
  | "describe_features"
  | "identify_location"
  | "high_power_id"
  | "clinical_correlation";

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

const LOCATION_MAP: Record<string, string> = {
  "Simple Squamous": "Blood vessel walls & lung alveoli",
  "Simple Cuboidal": "Kidney tubules & thyroid follicles",
  "Simple Columnar": "Stomach & intestinal lining",
  "Pseudostratified Columnar": "Trachea & upper airways",
  "Non-Keratinized Stratified Squamous": "Esophagus & oral cavity",
  "Keratinized Stratified Squamous": "Skin epidermis",
  "Transitional Epithelium": "Urinary bladder & ureter",
  "Mucous Connective Tissue": "Umbilical cord (Wharton's Jelly)",
  "Loose (Areolar) CT": "Beneath epithelial layers throughout the body",
  "Adipose Tissue (Fat)": "Subcutaneous tissue & omentum",
  "Reticular Tissue": "Spleen, lymph nodes & bone marrow",
  "Dense Regular CT": "Tendons & ligaments",
  "Elastic Connective Tissue": "Aorta & elastic arteries",
  "Hyaline Cartilage": "Trachea rings & articular joint surfaces",
  "Elastic Cartilage": "Ear pinna & epiglottis",
  "Fibrocartilage": "Intervertebral discs & pubic symphysis",
  "Compact Bone": "Outer cortex of long bones",
  "Spongy (Cancellous) Bone": "Interior of flat bones & epiphyses",
  "Motor Neuron": "Spinal cord anterior horn",
  "Spinal Cord (T.S.)": "Vertebral canal",
  "Sciatic Nerve (Peripheral Nerve T.S.)": "Posterior thigh",
  "Skeletal Muscle": "Attached to skeleton",
  "Cardiac Muscle": "Heart wall (myocardium)",
  "Smooth Muscle": "Walls of hollow visceral organs",
  "Pancreas": "Retroperitoneal, behind stomach",
  "Ileum (Small Intestine)": "Abdomen (terminal small intestine)",
  "Kidney": "Retroperitoneal, posterior abdominal wall",
  "Esophagus": "Mediastinum, connecting pharynx to stomach",
  "Skin (V.S.)": "External surface of entire body",
  "Testis": "Scrotal sac",
  "Liver": "Right upper quadrant of abdomen",
  "Trachea": "Anterior neck & superior mediastinum",
  "Stomach": "Left upper quadrant of abdomen",
  "Rabbit Blood": "Systemic circulation",
  "Toad Blood": "Systemic circulation (amphibian)",
};
const ALL_LOCATIONS = Object.values(LOCATION_MAP);

const CLINICAL_MAP: Record<string, string> = {
  "Simple Squamous": "A student examines a lung slide. They see an extremely thin, flat single-layer lining in the alveolar walls. What tissue type is this?",
  "Simple Cuboidal": "A kidney biopsy shows tubular structures lined by a single layer of cube-shaped cells with round central nuclei. What epithelium is this?",
  "Simple Columnar": "A patient undergoes a gastric biopsy. The lining shows tall, single-layered cells with basal oval nuclei and goblet cells. What tissue is seen?",
  "Pseudostratified Columnar": "A respiratory tract biopsy shows cells at different heights, all touching the basement membrane, with cilia on the surface. What epithelium is this?",
  "Non-Keratinized Stratified Squamous": "An esophageal biopsy shows multiple cell layers. The surface cells are flat but have visible nuclei. What tissue is this?",
  "Keratinized Stratified Squamous": "A skin biopsy shows multiple cell layers. The outermost consists of anucleated dead cells packed with keratin. What tissue is this?",
  "Transitional Epithelium": "A bladder biopsy shows a special epithelium that stretches. The surface has large dome-shaped 'umbrella cells'. What tissue is this?",
  "Hyaline Cartilage": "A joint biopsy shows a glassy, homogeneous matrix with chondrocytes in lacunae. What cartilage is this?",
  "Elastic Cartilage": "The ear pinna biopsy shows dark branching elastic fibers in the cartilage matrix. What cartilage is this?",
  "Fibrocartilage": "An intervertebral disc biopsy shows chondrocytes arranged in rows between thick collagen bundles. What tissue is this?",
  "Compact Bone": "A long bone cross-section shows concentric rings around a central canal forming cylindrical osteons. What tissue is this?",
  "Skeletal Muscle": "A muscle biopsy shows long, multinucleated fibers with peripheral nuclei and visible striations. What muscle type is this?",
  "Cardiac Muscle": "A heart biopsy shows branching fibers with central nuclei and dark intercalated discs. What tissue is this?",
  "Smooth Muscle": "A stomach biopsy shows spindle-shaped cells with central oval nuclei and no striations. What muscle type is this?",
  "Motor Neuron": "A spinal cord sample shows degeneration of large star-shaped cells with prominent nucleoli in the anterior horn. What cells are affected?",
  "Pancreas": "A biopsy from a diabetic patient shows pale cell clusters (islets) surrounded by darker acinar cells. What organ is this?",
  "Ileum (Small Intestine)": "A bowel biopsy shows finger-like villi projecting into the lumen, lined by columnar cells with many goblet cells. What part of the GI tract is this?",
  "Kidney": "A renal biopsy shows cortical tissue with spherical glomeruli enclosed in Bowman's capsule. What organ is this?",
  "Liver": "A biopsy shows hepatocytes arranged in cords radiating from a central vein forming hexagonal lobules. What organ is this?",
  "Trachea": "A windpipe biopsy shows pseudostratified ciliated columnar epithelium overlying C-shaped rings of hyaline cartilage. What structure is this?",
  "Stomach": "A biopsy shows deep gastric pits with NO goblet cells. The lamina propria contains gastric glands. What organ is this?",
  "Skin (V.S.)": "A palm biopsy shows a very thick keratinized epithelium with hair follicles and sebaceous glands below. What is this specimen?",
  "Esophagus": "A dysphagia patient biopsy shows very thick non-keratinized stratified squamous epithelium with a prominent folded mucosa. What organ is this?",
  "Rabbit Blood": "A blood smear shows numerous anucleated biconcave disc-shaped RBCs with various leukocytes. What specimen is this?",
  "Toad Blood": "A blood smear shows large oval RBCs with prominent nuclei, characteristic of an amphibian. What specimen is this?",
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
  if (/(epitheli|squamous|cuboidal|columnar|pseudostratified|transitional)/.test(lower)) return "epithelial";
  if (/(cartilage|bone|connective|adipose|areolar|fibrous|tendon|ligament|elastic)/.test(lower)) return "connective";
  if (/(muscle|skeletal|smooth|cardiac|myofibril)/.test(lower)) return "muscular";
  if (/(nerve|spinal cord|sciatic|nervous|neuroglia|motor neuron|axon|dendrite)/.test(lower)) return "nervous";
  if (/(blood|rabbit|toad|leukocyte|erythrocyte|platelet|monocyte|lymphocyte|neutrophil|eosinophil|basophil)/.test(lower)) return "blood";
  if (/(liver|kidney|stomach|esophagus|oesophagus|trachea|pancreas|ileum|testis|organ|gland|duct|follicle)/.test(lower)) return "organ-samples";
  if (lower.includes("skin") || lower.includes("dermis") || lower.includes("epidermis") || lower.includes("hair")) return "skin";
  return "other";
}

function categoryLabel(name: string) {
  const category = sampleCategory(name);
  if (category === "epithelial") return "Epithelial tissue";
  if (category === "connective") return "Connective tissue";
  if (category === "muscular") return "Muscle tissue";
  if (category === "nervous") return "Nervous tissue";
  if (category === "blood") return "Blood film";
  if (category === "organ-samples") return "Organ section";
  if (category === "skin") return "Skin histology";
  return "Mixed histology";
}

function buildMicroscopyConfig(variation: { image: string, type: VariationType }) {
  const imgLower = variation.image.toLowerCase();
  const isDual = imgLower.includes("vs") ||
    imgLower.includes("compare") ||
    imgLower.includes("&") ||
    imgLower.includes("spinal") ||
    imgLower.includes("esophagus") ||
    imgLower.includes("stomach") ||
    imgLower.includes("ileum");

  // For dual circular images, focus exactly on the left (25%) or right (75%) circle center
  const useRightSide = variation.image.length % 2 === 0;
  const cropRect = isDual ? { x: useRightSide ? 75 : 25, y: 50, width: 50, height: 100 } : undefined;

  const partialView = Math.random() < 0.2;
  const zoomLevel = (Math.random() < 0.1 ? 3 : Math.random() < 0.3 ? 2 : 1) as 1 | 2 | 3;
  const blurPx = Math.random() * 0.2; // Keep it clear
  const contrast = 1;
  const rotationDeg = 0;

  return { zoomLevel, partialView, blurPx, contrast, rotationDeg, cropRect };
}

function fingerprintForQuestion(userId: string, question: {
  prompt: string;
  sampleId: string;
  variationType: VariationType | null;
  type: ExamQuestionType;
  choices: string[];
  difficulty: DifficultyLevel;
  reasoningPattern: QuestionPattern;
}) {
  const normalized = [
    userId,
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
  allSamples: { id: string; name: string; category: string; variations: { id: string; image: string; type: VariationType }[] }[],
  type: ExamQuestionType,
  difficulty: DifficultyLevel,
  variation: { id: string; image: string; type: VariationType }
): { prompt: string; choices: string[]; acceptedAnswers: string[]; reasoningPattern: QuestionPattern; overrideImage?: string } {
  const sampleLabel = sample.name;
  const category = categoryLabel(sampleLabel);
  const parsedFeatures = Array.isArray(sample.keyFeatures) ? sample.keyFeatures : typeof sample.keyFeatures === "string" ? [sample.keyFeatures] : [];
  const featureChoices = parsedFeatures.length > 0 ? parsedFeatures : [sample.description];

  const parsedConfusionTags = Array.isArray(sample.confusionTags) ? sample.confusionTags.filter(item => typeof item === "string") : [];

  // Prioritize confusing samples for highly realistic distractors
  let sampleChoices = shuffle(
    allSamples
      .filter((candidate) => candidate.id !== sample.id && parsedConfusionTags.some(tag => candidate.name.toLowerCase().includes(String(tag).toLowerCase())))
      .map((candidate) => candidate.name)
  );

  // If not enough from confusion tags, add from same category
  if (sampleChoices.length < 3) {
    const categoryChoices = shuffle(
      allSamples
        .filter((candidate) => candidate.id !== sample.id && candidate.category === category && !sampleChoices.includes(candidate.name))
        .map((candidate) => candidate.name)
    );
    sampleChoices.push(...categoryChoices);
  }

  // If STILL not enough, add totally random ones
  if (sampleChoices.length < 3) {
    const others = shuffle(
      allSamples
        .filter((candidate) => candidate.id !== sample.id && !sampleChoices.includes(candidate.name))
        .map((candidate) => candidate.name)
    );
    sampleChoices.push(...others);
  }

  sampleChoices = sampleChoices.slice(0, 3);

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

  const clean = (s: string) => s.trim().replace(/\.+$/, "");
  const structureAnswer = clean(featureChoices[0]);
  
  // Use ONLY structurePool for the distractors to avoid putting other true features (like locations) as wrong answers
  const structureChoices = shuffle([...structurePool.map(clean).slice(0, 6)]).slice(0, 4);

  // Ensure answer is always in choices
  if (!structureChoices.includes(structureAnswer)) {
    structureChoices[Math.floor(Math.random() * 4)] = structureAnswer;
  }

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
    case "compare_samples": {
      // Find a confusing sample
      const confusedSampleName = parsedConfusionTags.length > 0 
        ? sampleChoices.find(c => parsedConfusionTags.some(tag => c.toLowerCase().includes(String(tag).toLowerCase())))
        : sampleChoices[0];
        
      const confusedSample = allSamples.find(s => s.name === (confusedSampleName || sampleChoices[0]));
      
      let overrideImage = undefined;
      let prompt = `Focusing on the key diagnostic features, which specimen is most likely represented here?`;
      let acceptedAnswers = [sampleLabel];
      let choices = compareChoices;
      
      if (confusedSample && confusedSample.variations.length > 0) {
        const confusedVar = confusedSample.variations.find(v => v.image.toLowerCase().includes("micro")) || confusedSample.variations[0];
        const isCorrectFirst = Math.random() > 0.5;
        overrideImage = isCorrectFirst ? `${variation.image},${confusedVar.image}` : `${confusedVar.image},${variation.image}`;
        
        // Randomize what we ask!
        const questionSubtype = Math.random();
        if (questionSubtype < 0.33) {
          // Which is X?
          prompt = `Identify which specimen is the ${sampleLabel}.`;
          choices = ["Specimen A", "Specimen B"];
          acceptedAnswers = [isCorrectFirst ? "Specimen A" : "Specimen B"];
        } else if (questionSubtype < 0.66) {
          // Which one has feature X?
          const feature = clean(featureChoices[0] || "specific characteristic");
          prompt = `Which specimen exhibits: "${feature}"?`;
          choices = ["Specimen A", "Specimen B"];
          acceptedAnswers = [isCorrectFirst ? "Specimen A" : "Specimen B"];
        } else {
          // Which one is found in location X?
          const loc = LOCATION_MAP[sampleLabel] || "its typical anatomical location";
          prompt = `Which specimen is normally found in: ${loc}?`;
          choices = ["Specimen A", "Specimen B"];
          acceptedAnswers = [isCorrectFirst ? "Specimen A" : "Specimen B"];
        }
      }
      
      return {
        prompt,
        choices,
        acceptedAnswers,
        reasoningPattern: "compare_views" as const,
        overrideImage
      };
    }
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
        choices: structureChoices,
        acceptedAnswers: [structureAnswer],
        reasoningPattern: "identify_structure" as const
      };
    case "list_features":
    case "describe_features":
      return {
        prompt: `Identify the pathognomonic feature or practical tip that confirms this as ${sampleLabel}.`,
        choices: [],
        acceptedAnswers: featureChoices.length > 0 ? featureChoices.map(clean) : [clean(sample.description)],
        reasoningPattern: "describe_features" as const
      };
    case "identify_location": {
      const correctLoc = LOCATION_MAP[sampleLabel] || "General body tissue";
      const wrongLocs = shuffle(ALL_LOCATIONS.filter(l => l !== correctLoc)).slice(0, 3);
      return {
        prompt: `Where in the human body is this tissue/organ normally found?`,
        choices: shuffle([correctLoc, ...wrongLocs]),
        acceptedAnswers: [correctLoc],
        reasoningPattern: "identify_specimen" as const // using specimen pattern for tracking
      };
    }
    case "high_power_id":
      return {
        prompt: `This is a HIGH-POWER microscope field (400×). Examine the cellular detail carefully and identify the tissue.`,
        choices: shuffle([...compareChoices]),
        acceptedAnswers: [sampleLabel],
        reasoningPattern: "identify_specimen" as const
      };
    case "clinical_correlation": {
      const scenario = CLINICAL_MAP[sampleLabel];
      return {
        prompt: scenario || `Clinical case: A patient biopsy reveals this microscopic view. Identify the tissue to aid diagnosis.`,
        choices: shuffle([...compareChoices]),
        acceptedAnswers: [sampleLabel],
        reasoningPattern: "identify_specimen" as const
      };
    }
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
    { type: "identify_sample" as const, weight: 12 },
    { type: "identify_tissue_type" as const, weight: 12 },
    { type: "compare_samples" as const, weight: 12 },
    { type: "interpret_partial_slide" as const, weight: 10 },
    { type: "identify_structure" as const, weight: 10 },
    { type: "list_features" as const, weight: 10 },
    { type: "describe_features" as const, weight: 8 },
    { type: "identify_location" as const, weight: 12 },
    { type: "high_power_id" as const, weight: 10 },
    { type: "clinical_correlation" as const, weight: 12 },
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

async function getUniqueSamplePool(userId: string, limit: number, mode: ExamMode, forceConfusionDrill?: boolean, category?: string) {
  const allAvailableRaw = await prisma.sample.findMany({ include: { variations: true } });
  
  // Filter by category if requested
  const allAvailable = category 
    ? allAvailableRaw.filter(s => sampleCategory(s.name) === category)
    : allAvailableRaw;

  if (allAvailable.length === 0) return [];

  // ONLY include samples that have at least one micro image
  const poolWithMicro = allAvailable.filter(s => 
    s.variations.some(v => v.image.toLowerCase().includes("micro"))
  );

  if (poolWithMicro.length === 0) return [];

  // HYBRID ADAPTIVE LOGIC: 70% Weak/Confused, 30% General Review
  if (forceConfusionDrill) {
    const progress = await prisma.userProgress.findUnique({
      where: { userId },
      select: { weakSamples: true, confusionPairs: true }
    });

    if (progress) {
      const weakIds = new Set(Array.isArray(progress.weakSamples) ? (progress.weakSamples as string[]) : []);
      const confusedIds = new Set(progress.confusionPairs.flatMap(p => [p.sampleAId, p.sampleBId]));
      const priorityIds = new Set([...weakIds, ...confusedIds]);

      const priorityPool = poolWithMicro.filter(s => priorityIds.has(s.id));
      const othersPool = poolWithMicro.filter(s => !priorityIds.has(s.id));

      const weakTarget = Math.ceil(limit * 0.7);
      const generalTarget = limit - weakTarget;

      const selectedWeak = shuffle(priorityPool).slice(0, weakTarget);
      const selectedGeneral = shuffle(othersPool).slice(0, generalTarget);
      
      const combined = [...selectedWeak, ...selectedGeneral];
      
      // Fallback: If we don't have enough in combined, fill from anything available
      if (combined.length < limit) {
        const currentIds = new Set(combined.map(s => s.id));
        const fill = shuffle(poolWithMicro.filter(s => !currentIds.has(s.id)));
        combined.push(...fill.slice(0, limit - combined.length));
      }

      return shuffle(combined);
    }
  }

  // Return ALL available samples shuffled — the main loop will cap at limit,
  // and the padding loop will reuse them to fill any remaining slots with varied questions.
  return shuffle(poolWithMicro);
}

async function createExamInstance(userId: string, options: { mode: ExamMode; limit: number; forceConfusionDrill?: boolean; category?: string; allowSeen?: boolean }) {
  const allAvailableRaw = await prisma.sample.findMany({ include: { variations: true } });

  // allSamples always uses FULL bank so distractors are always diverse and challenging
  const allSamples = allAvailableRaw.map((sample) => ({ id: sample.id, name: sample.name, category: sampleCategory(sample.name), variations: sample.variations }));
  
  let previousPatterns = new Map<string, Set<QuestionPattern>>();
  let existingFingerprints = new Set<string>();

  try {
    previousPatterns = await getPreviousExamSamplePatterns(userId);
    existingFingerprints = new Set(
      (await prisma.examQuestionInstance.findMany({ 
        where: { examInstance: { userId } },
        select: { fingerprint: true } 
      })).map((item) => item.fingerprint)
    );
  } catch (e) {
    console.warn("Could not load previous patterns/fingerprints from DB, using empty sets.");
  }

  const samplePool = await getUniqueSamplePool(userId, options.limit, options.mode, options.forceConfusionDrill, options.category);
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

  // Calculate student performance to identify "Elite" users for adaptive challenges
  const userProgress = await prisma.userProgress.findUnique({
    where: { userId },
    include: { performances: true }
  });

  const totalAnswers = (userProgress?.correctAnswers || 0) + (userProgress?.wrongAnswers || 0);
  const accuracyPercentage = totalAnswers > 0
    ? ((userProgress?.correctAnswers || 0) / totalAnswers) * 100
    : 0;
  const strongSamplesCount = userProgress?.performances.filter(p => p.masteryScore >= 80).length || 0;

  const isEliteUser = accuracyPercentage > 85 && strongSamplesCount > 10;

  for (const sample of samplePool) {
    if (questions.length >= options.limit) break;

    const microVariations = sample.variations.filter(v => v.image.toLowerCase().includes("micro"));
    if (microVariations.length === 0) continue;

    const variation = microVariations[Math.floor(Math.random() * microVariations.length)];
    if (!variation) continue;

    const typeCandidates = buildQuestionTypeWeightList();
    
    // Improved Diversity: Prioritize types not yet used in this exam
    const usedTypes = new Set(questions.map(q => q.type));
    const unusedTypes = typeCandidates.filter(c => !usedTypes.has(c.type));
    
    const selectedType = (unusedTypes.length > 0 && Math.random() < 0.7) 
      ? weightedChoice(unusedTypes) 
      : weightedChoice(typeCandidates);

    const difficulty: DifficultyLevel = variation.type === "exam_tricky_view" ? "hard" : Math.random() < 0.4 ? "hard" : Math.random() < 0.6 ? "medium" : "easy";
    const template = buildQuestionTemplate(sample, allSamples, selectedType.type, difficulty, variation);

    const fingerprint = fingerprintForQuestion(userId, {
      prompt: template.prompt,
      sampleId: sample.id,
      variationType: variation.type,
      type: selectedType.type,
      choices: template.choices,
      difficulty,
      reasoningPattern: template.reasoningPattern
    });

    const isAlreadySeen = existingFingerprints.has(fingerprint);

    // STRICT NON-REPETITION: Skip if already seen to ensure fresh questions
    if (isAlreadySeen && !options.allowSeen) {
      continue;
    }

    let microscopyConfig = buildMicroscopyConfig(variation);
    let finalPrompt = template.prompt;

    // Optional: Keep Elite Challenge if forced to allow seen
    if (isAlreadySeen && isEliteUser && options.allowSeen) {
      microscopyConfig = {
        ...microscopyConfig,
        zoomLevel: 3,
        contrast: 1.8,
        blurPx: 2.5,
        rotationDeg: Math.random() * 360,
      };
      finalPrompt = `[ELITE CHALLENGE] ${finalPrompt} (Artifacts & poor focus simulated)`;
    }

    questions.push({
      sampleId: sample.id,
      variationId: variation.id,
      type: selectedType.type,
      difficulty: isAlreadySeen ? "hard" : difficulty,
      prompt: finalPrompt,
      image: template.overrideImage || variation.image,
      variationType: variation.type,
      choices: template.choices,
      acceptedAnswers: template.acceptedAnswers,
      reasoningPattern: template.reasoningPattern,
      microscopyConfig,
      fingerprint: isAlreadySeen ? `${fingerprint}|challenge|${Math.random()}` : fingerprint
    });
  }

  // Padding: generate more questions by cycling through samples × question types
  // to avoid same image repeating back-to-back
  if (questions.length < options.limit && samplePool.length > 0) {
    const allTypes: ExamQuestionType[] = [
      "identify_sample",
      "identify_tissue_type",
      "identify_structure",
      "list_features",
      "compare_samples",
      "interpret_partial_slide",
      "describe_features"
    ];

    // Build all possible (sample × variation × type) combos not already in questions
    const usedKeys = new Set(questions.map(q => `${q.sampleId}|${q.variationId}|${q.type}`));
    const combos: Array<{ sample: typeof samplePool[0]; variation: typeof samplePool[0]["variations"][0]; type: ExamQuestionType }> = [];

    for (const sample of samplePool) {
      const microVariations = sample.variations.filter(v => v.image.toLowerCase().includes("micro"));
      for (const variation of microVariations) {
        for (const type of allTypes) {
          const key = `${sample.id}|${variation.id}|${type}`;
          if (!usedKeys.has(key)) {
            combos.push({ sample, variation, type });
          }
        }
      }
    }

    const shuffledCombos = shuffle(combos);
    for (const combo of shuffledCombos) {
      if (questions.length >= options.limit) break;
      const { sample, variation, type } = combo;
      const difficulty: DifficultyLevel = variation.type === "exam_tricky_view" ? "hard" : Math.random() < 0.4 ? "hard" : Math.random() < 0.6 ? "medium" : "easy";
      const template = buildQuestionTemplate(sample, allSamples, type, difficulty, variation);
      const fingerprint = fingerprintForQuestion(userId, {
        prompt: template.prompt,
        sampleId: sample.id,
        variationType: variation.type,
        type,
        choices: template.choices,
        difficulty,
        reasoningPattern: template.reasoningPattern
      });

      // STRICT NON-REPETITION padding check
      if (existingFingerprints.has(fingerprint) && !options.allowSeen) {
        continue;
      }

      questions.push({
        sampleId: sample.id,
        variationId: variation.id,
        type,
        difficulty,
        prompt: template.prompt,
        image: template.overrideImage || variation.image,
        variationType: variation.type,
        choices: template.choices,
        acceptedAnswers: template.acceptedAnswers,
        reasoningPattern: template.reasoningPattern,
        microscopyConfig: buildMicroscopyConfig(variation),
        fingerprint: existingFingerprints.has(fingerprint) ? `${fingerprint}|pad|${Math.random()}` : fingerprint
      });
    }
  }

  if (questions.length === 0) {
    if (!options.allowSeen) {
      // Fallback: if all questions have been seen, allow them instead of failing
      return createExamInstance(userId, { ...options, allowSeen: true });
    }
    if (options.category) {
      return createExamInstance(userId, { ...options, category: undefined });
    }
    throw new Error("Critical: No questions could be generated even with duplicates allowed.");
  }

  // Ensure unique signature never conflicts even if exact same questions are generated
  const uniqueSignature = crypto.createHash("sha256").update(questions.map((question) => question.fingerprint).join("|") + Date.now().toString()).digest("hex");

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
    throw error;
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
  options: { mode: ExamMode; limit?: number; forceConfusionDrill?: boolean; forceRegenerate?: boolean; category?: string }
): Promise<ExamResponse> {
  const limit = options.limit ?? 8;
  const existing = options.category ? null : await findActiveExam(userId, options.mode, limit);
  
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

  const exam: any = await createExamInstance(userId, { mode: options.mode, limit, forceConfusionDrill: options.forceConfusionDrill, category: options.category });
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

export async function getConfusionDrillQuestions(userId: string, limit = 6, category?: string): Promise<ExamResponse> {
  return getExamQuestionsForMode(userId, {
    mode: "standard",
    limit,
    forceConfusionDrill: true,
    forceRegenerate: true,
    category
  });
}
