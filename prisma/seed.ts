import { DifficultyLevel, PrismaClient, QuestionType, VariationType } from "@prisma/client";
import { histologyData } from "../lib/data/histologyData";

const prisma = new PrismaClient();

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function categoryLabel(name: string) {
  const lower = name.toLowerCase();
  if (/(epitheli|squamous|cuboidal|columnar|pseudostratified|transitional)/.test(lower)) return "Epithelial tissue";
  if (/(cartilage|bone|connective|adipose|areolar|fibrous|tendon|ligament|elastic)/.test(lower)) return "Connective tissue";
  if (/(muscle|skeletal|smooth|cardiac|myofibril)/.test(lower)) return "Muscle tissue";
  if (/(nerve|spinal cord|sciatic|nervous|neuroglia|motor neuron|axon|dendrite)/.test(lower)) return "Nervous tissue";
  if (/(blood|rabbit|toad|leukocyte|erythrocyte|platelet|monocyte|lymphocyte|neutrophil|eosinophil|basophil)/.test(lower)) return "Blood film";
  if (/(liver|kidney|stomach|esophagus|oesophagus|trachea|pancreas|ileum|testis|organ|gland|duct|follicle)/.test(lower)) return "Organ section";
  if (lower.includes("skin") || lower.includes("dermis") || lower.includes("epidermis") || lower.includes("hair")) return "Skin histology";
  return "Mixed histology";
}

// ─── LOCATION MAP ────────────────────────────────────────────────────────────

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

// ─── CLINICAL SCENARIO MAP ───────────────────────────────────────────────────

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

// ─── MAIN SEED ───────────────────────────────────────────────────────────────

async function main() {
  await prisma.examQuestionInstance.deleteMany();
  await prisma.examInstance.deleteMany();
  await prisma.attemptHistory.deleteMany();
  await prisma.reviewSchedule.deleteMany();
  await prisma.confusionPair.deleteMany();
  await prisma.samplePerformance.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.question.deleteMany();
  await prisma.variation.deleteMany();
  await prisma.sample.deleteMany();

  // ── Create Samples & Variations ──────────────────────────────────────────
  for (const category of histologyData) {
    if (!category.subSections) continue;
    for (const sub of category.subSections) {
      const allImages = sub.imageUrls || (sub.imageUrl ? [sub.imageUrl] : []);
      if (allImages.length === 0) continue;

      const variations = allImages.map((img) => {
        const isMicro = img.toLowerCase().includes("micro");
        return {
          image: img,
          type: isMicro ? VariationType.exam_tricky_view : VariationType.stain_variation,
          notes: isMicro ? "Microscope view" : "General view",
        };
      });

      await prisma.sample.create({
        data: {
          name: sub.title,
          nameAr: sub.titleAr,
          description: sub.description,
          keyFeatures: sub.practicalTips,
          confusionTags: sub.confusionWarning ? [sub.confusionWarning] : [],
          variations: { create: variations },
        },
      });
    }
  }

  // ── Load created samples with variations ─────────────────────────────────
  const createdSamples = await prisma.sample.findMany({
    include: { variations: true },
  });

  const allSampleNames = createdSamples.map((s) => s.name);

  // ── Generate Questions ────────────────────────────────────────────────────
  for (const sample of createdSamples) {
    for (const variation of sample.variations) {
      const distractors = allSampleNames
        .filter((n) => n !== sample.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const identifyChoices = shuffle([...distractors, sample.name]);

      // 1. Identify Sample (MCQ)
      await prisma.question.create({
        data: {
          sampleId: sample.id,
          variationId: variation.id,
          type: QuestionType.identify_sample,
          difficulty: variation.type === VariationType.exam_tricky_view ? DifficultyLevel.hard : DifficultyLevel.medium,
          prompt: "Identify this histology sample.",
          image: variation.image,
          choices: identifyChoices,
          acceptedAnswers: JSON.parse(JSON.stringify([sample.name])),
        },
      });

      // 2. List Features (Text)
      await prisma.question.create({
        data: {
          sampleId: sample.id,
          variationId: variation.id,
          type: QuestionType.list_features,
          difficulty: DifficultyLevel.medium,
          prompt: `List one pathognomonic feature that confirms this is ${sample.name}.`,
          image: variation.image,
          acceptedAnswers: JSON.parse(JSON.stringify(sample.keyFeatures)),
        },
      });

      // 3. Identify Structure (MCQ)
      const primaryFeature = (sample.keyFeatures as string[])[0] || "General structure";
      const structureChoices = shuffle([
        ...(sample.keyFeatures as string[]).slice(0, 3),
        "Basal lamina",
        "Fibroblast",
        "Capillary",
      ]).slice(0, 4);
      await prisma.question.create({
        data: {
          sampleId: sample.id,
          variationId: variation.id,
          type: QuestionType.identify_structure,
          difficulty: DifficultyLevel.hard,
          prompt: "Which specific histological structure is most prominent in this field?",
          image: variation.image,
          choices: structureChoices,
          acceptedAnswers: JSON.parse(JSON.stringify([primaryFeature])),
        },
      });

      // 4. Confusion Differentiation
      const confusionTags = sample.confusionTags as string[];
      if (confusionTags && confusionTags.length > 0) {
        await prisma.question.create({
          data: {
            sampleId: sample.id,
            variationId: variation.id,
            type: QuestionType.list_features,
            difficulty: DifficultyLevel.hard,
            prompt: `How do you distinguish this from its common confusion: ${confusionTags[0]}?`,
            image: variation.image,
            acceptedAnswers: JSON.parse(JSON.stringify(sample.keyFeatures)),
          },
        });

        const confusedSample = createdSamples.find((s) =>
          s.name.toLowerCase().includes(confusionTags[0].toLowerCase())
        );
        if (confusedSample && confusedSample.variations.length > 0) {
          const confusedVar = confusedSample.variations[0];
          const isCorrectFirst = Math.random() > 0.5;
          const comboImages = isCorrectFirst
            ? `${variation.image},${confusedVar.image}`
            : `${confusedVar.image},${variation.image}`;
          const correctAnswer = isCorrectFirst ? "Specimen A" : "Specimen B";
          await prisma.question.create({
            data: {
              sampleId: sample.id,
              variationId: variation.id,
              type: QuestionType.compare_samples,
              difficulty: DifficultyLevel.hard,
              prompt: `Identify which specimen is the ${sample.name}.`,
              image: comboImages,
              choices: ["Specimen A", "Specimen B"],
              acceptedAnswers: JSON.parse(JSON.stringify([correctAnswer])),
            },
          });
        }
      }

      // 5. Tissue Category (MCQ)
      const tissueOptions = [
        "Epithelial tissue",
        "Connective tissue",
        "Muscle tissue",
        "Nervous tissue",
        "Blood film",
        "Organ section",
        "Skin histology",
      ];
      await prisma.question.create({
        data: {
          sampleId: sample.id,
          variationId: variation.id,
          type: QuestionType.identify_tissue_type,
          difficulty: DifficultyLevel.easy,
          prompt: "Analyze the cellular arrangement. Which broad tissue category does this belong to?",
          image: variation.image,
          choices: tissueOptions,
          acceptedAnswers: JSON.parse(JSON.stringify([categoryLabel(sample.name)])),
        },
      });

      // 6. Identify Location (MCQ) — NEW
      const correctLoc = LOCATION_MAP[sample.name];
      if (correctLoc) {
        const wrongLocs = ALL_LOCATIONS
          .filter((l) => l !== correctLoc)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        await prisma.question.create({
          data: {
            sampleId: sample.id,
            variationId: variation.id,
            type: QuestionType.identify_location,
            difficulty: DifficultyLevel.medium,
            prompt: "Where in the human body is this tissue/organ normally found?",
            image: variation.image,
            choices: shuffle([correctLoc, ...wrongLocs]),
            acceptedAnswers: JSON.parse(JSON.stringify([correctLoc])),
          },
        });
      }

      // 7. High Power Identification (use micro variation) — NEW
      // Only create once per sample (not once per variation) to avoid duplicates
      const microVariation = sample.variations.find((v) => v.image.toLowerCase().includes("micro"));
      if (microVariation && microVariation.id !== variation.id) {
        await prisma.question.create({
          data: {
            sampleId: sample.id,
            variationId: microVariation.id,
            type: QuestionType.high_power_id,
            difficulty: DifficultyLevel.hard,
            prompt: "This is a HIGH-POWER microscope field (400×). Examine the cellular detail carefully and identify the tissue.",
            image: microVariation.image,
            choices: shuffle([sample.name, ...allSampleNames.filter((n) => n !== sample.name)]).slice(0, 4),
            acceptedAnswers: JSON.parse(JSON.stringify([sample.name])),
          },
        });
      }

      // 8. Clinical Correlation (MCQ) — NEW
      const scenario = CLINICAL_MAP[sample.name];
      if (scenario) {
        const wrongClinical = allSampleNames
          .filter((n) => n !== sample.name)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        await prisma.question.create({
          data: {
            sampleId: sample.id,
            variationId: variation.id,
            type: QuestionType.clinical_correlation,
            difficulty: DifficultyLevel.hard,
            prompt: scenario,
            image: variation.image,
            choices: shuffle([sample.name, ...wrongClinical]),
            acceptedAnswers: JSON.parse(JSON.stringify([sample.name])),
          },
        });
      }
    }
  }

  // ── Test Accounts ─────────────────────────────────────────────────────────
  const testAccounts = [
    { universityId: "ASU-1001", name: "Student One", email: "student1@asu.edu.eg", password: "password123" },
    { universityId: "ASU-2002", name: "Test User", email: "test@example.com", password: "123456" },
  ];
  for (const acc of testAccounts) {
    await prisma.studentAccount.upsert({
      where: { universityId: acc.universityId },
      update: {},
      create: acc,
    });
  }

  const totalQuestions = await prisma.question.count();
  console.log(`Seeded ${createdSamples.length} samples and ${totalQuestions} exam questions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
