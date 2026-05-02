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

  // Auto-retry with exponential backoff to handle Neon DB cold starts.
  // Free-tier Neon DB sleeps after 5 minutes of inactivity and can take
  // 3-8 seconds to wake up. We retry up to 3 times (waits: 1.5s → 3s)
  // which covers even the slowest Neon wake-ups, transparent to the student.
  // Total worst-case wait: ~5.5 seconds — well within Vercel's 30s timeout.
  const RETRY_DELAYS_MS = [1500, 3000]; // wait after attempt 1, then after attempt 2
  const MAX_ATTEMPTS = RETRY_DELAYS_MS.length + 1; // = 3
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = drill
        ? await getConfusionDrillQuestions(userId, limit, category || undefined)
        : await getExamQuestionsForMode(userId, { mode, limit, forceRegenerate: regen, category: category || undefined });

      if (attempt > 1) {
        console.log(`[ExamAPI] Succeeded on attempt ${attempt}/${MAX_ATTEMPTS} (DB was cold-starting)`);
      }
      return NextResponse.json(response);
    } catch (error) {
      lastError = error;
      console.error(`[ExamAPI] Attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error);

      if (attempt < MAX_ATTEMPTS) {
        const waitMs = RETRY_DELAYS_MS[attempt - 1];
        console.log(`[ExamAPI] Waiting ${waitMs}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    }
  }

  console.error("[ExamAPI] All 3 attempts exhausted. Last error:", lastError);
  return NextResponse.json(
    { error: "Unable to generate exam. Please try again in a moment." },
    { status: 500 }
  );
}
