import { getExamQuestionsForMode } from "./lib/examService";
import { prisma } from "./lib/prisma";

async function test() {
  try {
    const userId = "test-user-id"; // Any ID will do for testing creation
    const result = await getExamQuestionsForMode(userId, { mode: "standard", limit: 8, forceRegenerate: true });
    console.log("Success! Generated exam with", result.questions.length, "questions.");
  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
