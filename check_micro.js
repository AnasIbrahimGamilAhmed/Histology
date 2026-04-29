const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const samples = await prisma.sample.findMany({ include: { variations: true } });
  const pool = samples.filter(s => s.variations.some(v => v.image.toLowerCase().includes('micro')));
  console.log('Total samples with micro:', pool.length);
  pool.forEach(p => console.log(p.category, p.name));
  await prisma.$disconnect();
}
main();
