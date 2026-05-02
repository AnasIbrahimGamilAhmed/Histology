import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getConfusionDrillQuestions, getExamQuestionsForMode } from "@/lib/examService";

export async function GET(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit"));
  const modeParam = url.searchParams.get("mode");
  const regen = url.searchParams.get("regen") === "1";
  const drillParam = url.searchParams.get("drill");
  const category = url.searchParams.get("category");
  const limit = Number.isFinite(limitParam) ? Math.max(4, Math.min(20, limitParam)) : 8;
  const mode = modeParam === "pressure" ? "pressure" : "standard";
  const drill = drillParam === "1";

  // Auto-retry up to 2 attempts to handle Neon DB cold starts.
  // Free-tier Neon DB sleeps after 5 minutes of inactivity; the first
  // connection attempt after sleep can fail or be slow. A single automatic
  // retry (after a 1-second wait for the DB to wake) is transparent to
  // the student and eliminates most "Generation Failed" errors.
  const MAX_ATTEMPTS = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = drill
        ? await getConfusionDrillQuestions(userId, limit, category || undefined)
        : await getExamQuestionsForMode(userId, { mode, limit, forceRegenerate: regen, category: category || undefined });

      return NextResponse.json(response);
    } catch (error) {
      lastError = error;
      console.error(`[ExamAPI] Attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error);

      if (attempt < MAX_ATTEMPTS) {
        // Wait 1 second for the DB to fully wake up before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  console.error("[ExamAPI] All attempts exhausted. Last error:", lastError);
  return NextResponse.json(
    { error: "Unable to generate exam. Please try again in a moment." },
    { status: 500 }
  );
}
