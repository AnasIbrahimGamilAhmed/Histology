import { DifficultyLevel, PrismaClient, QuestionType, VariationType } from "@prisma/client";

const prisma = new PrismaClient();

type SeedSample = {
  name: string;
  description: string;
  keyFeatures: string[];
  confusionTags: string[];
  variations: {}[] & {
    image: string;
    type: VariationType;
    notes?: string;
  }[];
};
import { histologyData } from "../lib/data/histologyData";

async function main() {
  // await prisma.studentAccount.deleteMany(); // Preserve user accounts
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

  for (const category of histologyData) {
    if (!category.subSections) continue;
    
    for (const sub of category.subSections) {
      const allImages = sub.imageUrls || (sub.imageUrl ? [sub.imageUrl] : []);
      if (allImages.length === 0) continue;

      const variations = allImages.map((img, index) => {
        const isMicro = img.toLowerCase().includes("micro");
        return {
          image: img,
          type: isMicro ? VariationType.exam_tricky_view : VariationType.stain_variation,
          notes: isMicro ? "Microscope view" : "General view"
        };
      });

      await prisma.sample.create({
        data: {
          name: sub.title,
          nameAr: sub.titleAr,
          description: sub.description,
          keyFeatures: sub.practicalTips,
          confusionTags: sub.confusionWarning ? [sub.confusionWarning] : [],
          variations: {
            create: variations
          }
        }
      });
    }
  }

  const createdSamples = await prisma.sample.findMany({
    include: { variations: true }
  });

  for (const sample of createdSamples) {
    const locations = createdSamples
      .filter(s => {
        const features = s.keyFeatures as string[];
        return (s.description && s.description.includes("Found in")) || (features && features.some(t => t.includes("Found in")));
      })
      .map(s => {
        const features = s.keyFeatures as string[];
        const tip = features ? features.find(t => t.includes("Found in")) : null;
        return tip ? tip.replace("Found in ", "").replace(".", "") : s.name;
      })
      .filter(l => l.length > 5);

    for (const variation of sample.variations) {
      // 1. Identify Question
      const distractors = createdSamples
        .filter((candidate: any) => candidate.id !== sample.id)
        .map((candidate: any) => candidate.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const identifyChoices = Array.from(new Set([...distractors, sample.name])).sort(() => Math.random() - 0.5);

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
        }
      });

      // 2. Identify Features (Text)
      await prisma.question.create({
        data: {
          sampleId: sample.id,
          variationId: variation.id,
          type: QuestionType.list_features,
          difficulty: DifficultyLevel.medium,
          prompt: `List one pathognomonic feature visible in this field that confirms it is ${sample.name}.`,
          image: variation.image,
          acceptedAnswers: JSON.parse(JSON.stringify(sample.keyFeatures)),
        }
      });

      // 3. Identify Specific Structure (MCQ)
      const primaryFeature = (sample.keyFeatures as string[])[0] || "General structure";
      await prisma.question.create({
        data: {
          sampleId: sample.id,
          variationId: variation.id,
          type: QuestionType.identify_structure,
          difficulty: DifficultyLevel.hard,
          prompt: `Which specific histological structure is most prominent in this field?`,
          image: variation.image,
          choices: shuffle([...(sample.keyFeatures as string[]).slice(0, 3), "Basal lamina", "Fibroblast", "Capillary"]).slice(0, 4),
          acceptedAnswers: JSON.parse(JSON.stringify([primaryFeature])),
        }
      });

      // 3. Location Question (if available)
      const features = sample.keyFeatures as string[];
      const locationTip = features ? features.find(f => f.toLowerCase().includes("found in")) : null;
      if (locationTip) {
        const correctLocation = locationTip.replace(/found in/i, "").trim().replace(/\.$/, "");
        const otherLocs = locations.filter(l => l !== correctLocation).sort(() => Math.random() - 0.5).slice(0, 3);
        const locationChoices = Array.from(new Set([...otherLocs, correctLocation])).sort(() => Math.random() - 0.5);

        await prisma.question.create({
          data: {
            sampleId: sample.id,
            variationId: variation.id,
            type: QuestionType.identify_sample, // Reuse identify type for MCQ
            difficulty: DifficultyLevel.medium,
            prompt: `Where is this ${sample.name} typically found in the body?`,
            image: variation.image,
            choices: locationChoices,
            acceptedAnswers: JSON.parse(JSON.stringify([correctLocation])),
          }
        });
      }

      // 4. Differentiation (if confusion warning exists)
      const confusionTags = sample.confusionTags as string[];
      if (confusionTags && confusionTags.length > 0) {
        // Textual differentiation
        await prisma.question.create({
          data: {
            sampleId: sample.id,
            variationId: variation.id,
            type: QuestionType.list_features,
            difficulty: DifficultyLevel.hard,
            prompt: `How do you distinguish this sample from its common confusion: ${confusionTags[0]}?`,
            image: variation.image,
            acceptedAnswers: JSON.parse(JSON.stringify(sample.keyFeatures)),
          }
        });

        // Side-by-Side Comparison
        const confusedSample = createdSamples.find(s => s.name.toLowerCase().includes(confusionTags[0].toLowerCase()));
        if (confusedSample && confusedSample.variations.length > 0) {
          const confusedVar = confusedSample.variations[0];
          const isCorrectFirst = Math.random() > 0.5;
          const comboImages = isCorrectFirst ? `${variation.image},${confusedVar.image}` : `${confusedVar.image},${variation.image}`;
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
            }
          });
        }
      }

      // 5. Tissue Category ID
      const category = categoryLabel(sample.name);
      const tissueOptions = [
        "Epithelial tissue",
        "Connective tissue",
        "Muscle tissue",
        "Nervous tissue",
        "Blood film",
        "Organ section",
        "Skin histology"
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
          acceptedAnswers: JSON.parse(JSON.stringify([category])),
        }
      });
    }
  }

  // Helper for categories
  function categoryLabel(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes("epitheli") || lower.includes("epithelium")) return "Epithelial tissue";
    if (/(cartilage|bone|connective|adipose|areolar)/.test(lower)) return "Connective tissue";
    if (/(muscle|skeletal|smooth|cardiac)/.test(lower)) return "Muscle tissue";
    if (/(nerve|spinal cord|sciatic|nervous|neuroglia|motor neuron)/.test(lower)) return "Nervous tissue";
    if (/(blood|rabbit|toad)/.test(lower)) return "Blood film";
    if (/(liver|kidney|stomach|esophagus|trachea|pancreas|ileum|testis)/.test(lower)) return "Organ section";
    if (lower.includes("skin")) return "Skin histology";
    return "Mixed histology";
  }

  // Helper for shuffling arrays
  function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  const testAccounts = [
    {
      universityId: "ASU-1001",
      name: "Student One",
      email: "student1@asu.edu.eg",
      password: "password123"
    },
    {
      universityId: "ASU-2002",
      name: "Test User",
      email: "test@example.com",
      password: "123456"
    }
  ];

  for (const acc of testAccounts) {
    await prisma.studentAccount.upsert({
      where: { universityId: acc.universityId },
      update: {},
      create: acc
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

