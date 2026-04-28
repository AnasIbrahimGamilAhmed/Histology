import { PrismaClient } from "@prisma/client";
import { histologyData } from "../lib/data/histologyData";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Master Data Sync with Bilingual Support...");

  for (const category of histologyData) {
    if (!category.subSections) continue;

    for (const section of category.subSections) {
      console.log(`Syncing sample: ${section.title} (${section.titleAr || "N/A"})`);
      
      const sample = await prisma.sample.upsert({
        where: { name: section.title },
        update: {
          nameAr: section.titleAr || null,
          description: section.description,
          keyFeatures: section.practicalTips || [],
          confusionTags: [],
        },
        create: {
          name: section.title,
          nameAr: section.titleAr || null,
          description: section.description,
          keyFeatures: section.practicalTips || [],
          confusionTags: [],
        },
      });

      if (section.imageUrls) {
        for (const url of section.imageUrls) {
          const isMicro = url.toLowerCase().includes("micro");
          const isComparison = url.toLowerCase().includes("kerat") || url.toLowerCase().includes("non");
          
          const existing = await prisma.variation.findFirst({
            where: { image: url, sampleId: sample.id }
          });

          if (existing) {
            await prisma.variation.update({
              where: { id: existing.id },
              data: {
                type: isMicro ? "magnification_variation" : "exam_tricky_view",
                notes: isComparison ? "Comparative Slide" : isMicro ? "High Magnification" : "Overview",
              }
            });
          } else {
            await prisma.variation.create({
              data: {
                sampleId: sample.id,
                image: url,
                type: isMicro ? "magnification_variation" : "exam_tricky_view",
                notes: isComparison ? "Comparative Slide" : isMicro ? "High Magnification" : "Overview",
              }
            });
          }
        }
      }
    }
  }

  console.log("✅ Bilingual Sync Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
