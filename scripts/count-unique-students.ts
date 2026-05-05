import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📊 Starting Student Data Analysis...\n");

  // 1. Total Accounts in Database
  const totalAccounts = await prisma.studentAccount.count();

  // 2. Unique University IDs (The most accurate "Net" count)
  const uniqueUniIds = await prisma.studentAccount.groupBy({
    by: ['universityId'],
  });

  // 3. Unique Names (To catch if someone used different IDs but same name)
  const uniqueNames = await prisma.studentAccount.groupBy({
    by: ['name'],
  });

  // 4. Recently Active (Last 24 hours) - Optional if you have timestamps
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeToday = await prisma.studentAccount.count({
    where: {
      createdAt: {
        gte: oneDayAgo,
      },
    },
  });

  console.log("-----------------------------------------");
  console.log(`✅ Total Registrations (Accounts): ${totalAccounts}`);
  console.log(`✅ Net Students (by University ID): ${uniqueUniIds.length}`);
  console.log(`✅ Net Students (by Name):          ${uniqueNames.length}`);
  console.log(`✅ New Registrations Today:        ${activeToday}`);
  console.log("-----------------------------------------");

  if (totalAccounts > uniqueUniIds.length) {
    console.log(`⚠️ Warning: Found ${totalAccounts - uniqueUniIds.length} potential duplicate accounts.`);
  } else {
    console.log("✨ No duplicate University IDs found.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
