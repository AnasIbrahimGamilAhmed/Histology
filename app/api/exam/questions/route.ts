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

  const response = drill
    ? await getConfusionDrillQuestions(userId, limit, category || undefined)
    : await getExamQuestionsForMode(userId, { mode, limit, forceRegenerate: regen, category: category || undefined });

  return NextResponse.json(response);
}
