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
    const variationForQuestion =
      sample.variations.find((variation: any) => variation.type === VariationType.exam_tricky_view) ?? sample.variations[0];

    if (!variationForQuestion) {
      continue;
    }

    const distractors = createdSamples
      .filter((candidate: any) => candidate.id !== sample.id)
      .map((candidate: any) => candidate.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const identifyChoices = [...distractors, sample.name].sort(() => Math.random() - 0.5);

    await prisma.question.create({
      data: {
        sampleId: sample.id,
        variationId: variationForQuestion.id,
        type: QuestionType.identify_sample,
        difficulty:
          variationForQuestion.type === VariationType.exam_tricky_view ? DifficultyLevel.hard : DifficultyLevel.medium,
        prompt: "Identify this histology sample.",
        image: variationForQuestion.image,
        choices: identifyChoices,
        acceptedAnswers: JSON.parse(JSON.stringify([sample.name])),
      }
    });

    await prisma.question.create({
      data: {
        sampleId: sample.id,
        variationId: variationForQuestion.id,
        type: QuestionType.list_features,
        difficulty: DifficultyLevel.easy,
        prompt: "List one key feature that supports your diagnosis for this sample.",
        image: variationForQuestion.image,
        acceptedAnswers: JSON.parse(JSON.stringify(sample.keyFeatures)),
      }
    });
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

  console.log(`Seeded ${createdSamples.length} samples and ${createdSamples.length * 2} exam questions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

