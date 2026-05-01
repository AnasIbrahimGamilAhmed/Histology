import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const qCount = await prisma.examQuestionInstance.count();
    const eCount = await prisma.examInstance.count();
    console.log({ qCount, eCount });
  } catch (err) {
    console.error(err.message);
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
