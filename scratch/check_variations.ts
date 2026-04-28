import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const samples = await prisma.sample.findMany({ include: { variations: true } });
  console.log(`Total samples: ${samples.length}`);
  
  const empty = samples.filter(s => s.variations.length === 0);
  if (empty.length > 0) {
    console.log("Samples with NO variations:");
    empty.forEach(e => console.log(`- ${e.name}`));
  } else {
    console.log("All samples have at least one variation.");
  }
}

check().finally(() => prisma.$disconnect());
