import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sampleCount = await prisma.sample.count();
  const questionCount = await prisma.question.count();
  const variationCount = await prisma.variation.count();
  const examCount = await prisma.examInstance.count();

  console.log({
    sampleCount,
    questionCount,
    variationCount,
    examCount
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
