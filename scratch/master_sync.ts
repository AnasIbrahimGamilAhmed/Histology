import { PrismaClient, VariationType, QuestionType, DifficultyLevel } from "@prisma/client";
import { histologyData, TissueSection } from "../lib/data/histologyData";

const prisma = new PrismaClient();

async function sync() {
  console.log("Starting master sync...");

  // Clear existing data (preserving student accounts)
  await prisma.examQuestionInstance.deleteMany();
  await prisma.examInstance.deleteMany();
  await prisma.attemptHistory.deleteMany();
  await prisma.variation.deleteMany();
  await prisma.question.deleteMany();
  await prisma.sample.deleteMany();

  const allSamples: TissueSection[] = [];

  function collectSamples(nodes: TissueSection[]) {
    for (const node of nodes) {
      if (node.subSections && node.subSections.length > 0) {
        collectSamples(node.subSections);
      } else {
        allSamples.push(node);
      }
    }
  }

  collectSamples(histologyData);
  console.log(`Found ${allSamples.length} samples in histologyData.ts`);

  for (const item of allSamples) {
    const sample = await prisma.sample.create({
      data: {
        name: item.title,
        description: item.description,
        keyFeatures: item.practicalTips || [],
        confusionTags: item.confusionWarning ? [item.confusionWarning] : [],
      }
    });

    const variations = item.imageUrls || [item.imageUrl].filter(Boolean) as string[];

    for (const img of variations) {
      const isMicro = img.toLowerCase().includes("micro");
      const isKeratinized = img.toLowerCase().includes("kerat") && !img.toLowerCase().includes("non");
      const isNonKeratinized = img.toLowerCase().includes("non");

      let notes = isMicro ? "Clinical Microscopic View" : "Overview Slide";
      if (isKeratinized) notes += " (Keratinized)";
      if (isNonKeratinized) notes += " (Non-Keratinized)";

      const variation = await prisma.variation.create({
        data: {
          sampleId: sample.id,
          image: img,
          type: isMicro ? VariationType.exam_tricky_view : VariationType.stain_variation,
          notes: notes
        }
      });

      // Automatically create a question for each micro variation
      if (isMicro) {
        await prisma.question.create({
          data: {
            sampleId: sample.id,
            variationId: variation.id,
            type: QuestionType.identify_sample,
            difficulty: DifficultyLevel.medium,
            prompt: `Identify this specimen (Practical Identification).`,
            image: img,
            choices: [], // Will be populated dynamically in examService or we can seed here
            acceptedAnswers: [item.title],
          }
        });
      }
    }
    console.log(`  [OK] Seeded: ${item.title} (${variations.length} views)`);
  }

  console.log("Master Sync Complete!");
}

sync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
