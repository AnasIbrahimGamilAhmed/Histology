import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const sampleCount = await prisma.sample.count();
  const variationCount = await prisma.variation.count();
  const questionCount = await prisma.question.count();
  console.log({ sampleCount, variationCount, questionCount });
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
