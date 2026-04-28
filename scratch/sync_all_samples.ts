import { PrismaClient, VariationType } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Mocking the structure of histologyData.ts since I can't import TS directly easily in a scratch script without setup
// I'll read the file and extract the data using regex or simple parsing

async function sync() {
  const filePath = path.join(process.cwd(), "lib/data/histologyData.ts");
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract all subSections
  // This is a bit hacky but it works for this specific file structure
  const subSectionMatches = content.matchAll(/id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*practicalTips:\s*\[([^\]]+)\],\s*(?:confusionWarning:\s*"([^"]+)",\s*)?imageUrl:\s*"([^"]+)",\s*imageUrls:\s*\[([^\]]+)\]/g);

  await prisma.examQuestionInstance.deleteMany();
  await prisma.examInstance.deleteMany();
  await prisma.attemptHistory.deleteMany();
  await prisma.variation.deleteMany();
  await prisma.sample.deleteMany();

  console.log("Cleared old data. Importing new samples...");

  for (const match of subSectionMatches) {
    const [_, id, title, description, tipsStr, confusion, mainImg, allImgsStr] = match;
    const tips = tipsStr.split(",").map(t => t.trim().replace(/"/g, ""));
    const allImgs = allImgsStr.split(",").map(t => t.trim().replace(/"/g, ""));

    const sample = await prisma.sample.create({
      data: {
        name: title,
        description: description,
        keyFeatures: tips,
        confusionTags: confusion ? [confusion] : [],
      }
    });

    for (const img of allImgs) {
      // User requested ONLY micro images for the exam
      const isMicro = img.toLowerCase().includes("micro");
      
      await prisma.variation.create({
        data: {
          sampleId: sample.id,
          image: img,
          type: isMicro ? VariationType.exam_tricky_view : VariationType.stain_variation,
          notes: isMicro ? "Microscopic clinical view" : "Standard histological view"
        }
      });
    }
    console.log(`  [OK] Imported ${title} (${allImgs.length} variations)`);
  }
}

sync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
