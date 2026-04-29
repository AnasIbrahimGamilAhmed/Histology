import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { touchUserActivity } from "@/services/adaptiveLearningService";
import { getDashboardData } from "@/services/dashboardService";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await touchUserActivity(userId, "/dashboard");
    const data = await getDashboardData(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard stats fetch failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
