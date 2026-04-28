import { UserProfileBar } from "@/components/UserProfileBar";
import { requireUserId } from "@/lib/session";
import { touchUserActivity } from "@/services/adaptiveLearningService";
import { getDashboardData } from "@/services/dashboardService";
import { BookOpen, Brain, Activity, Target, ShieldAlert, CheckCircle2, ChevronRight, TrendingUp, Sparkles, Microscope, Info, Lightbulb } from "lucide-react";
import Link from "next/link";

const statusClasses = {
  Weak: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Strong: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
};

export default async function DashboardPage() {
  const userId = await requireUserId();
  await touchUserActivity(userId, "/dashboard");
  const data = await getDashboardData(userId);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 pb-20">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <UserProfileBar />
        
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Learning Analytics
            </h1>
            <p className="mt-4 text-slate-400 text-lg max-w-2xl">
              Real-time tracking of your diagnostic mastery and practical identification trends.
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Growth Trend</p>
              <p className="text-sm font-bold text-white">
                {data.trend.delta > 0 ? "+" : ""}{data.trend.delta}% this period
              </p>
            </div>
          </div>
        </header>

        {/* Action Grid */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard 
            href="/study"
            icon={<BookOpen size={28} />}
            title="Study Navigator"
            desc="Explore interactive tissue maps and expert tips."
            color="bg-indigo-600"
          />
          <ActionCard 
            href="/exam"
            icon={<Brain size={28} />}
            title="Exam Engine"
            desc="Unlimited randomized micro-view practicals."
            color="bg-slate-800"
          />
          <ActionCard 
            href="/atlas"
            icon={<Microscope size={28} />}
            title="Micro Atlas"
            desc="Browse high-res slides with active magnifier."
            color="bg-slate-900"
            border
          />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard label="Total Identified" value={data.overall.totalQuestionsAnswered} icon={<Activity size={20} />} />
          <StatCard label="Overall Accuracy" value={`${data.overall.accuracyPercentage}%`} icon={<Target size={20} />} />
          <StatCard label="Critical Area (Weak)" value={data.overall.weakSamplesCount} icon={<ShieldAlert size={20} />} color="text-rose-400" />
          <StatCard label="Mastered (Elite)" value={data.overall.strongSamplesCount} icon={<CheckCircle2 size={20} />} color="text-emerald-400" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* MASTERY GRID SECTION */}
          <section className="lg:col-span-2 rounded-[3rem] bg-slate-900/50 border border-slate-800 p-10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Specimen Mastery</h2>
                  <p className="text-slate-500 text-sm">Diagnostic performance per sample</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar scroll-smooth">
              {data.sampleMastery.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                  <p className="text-slate-500">No session data. Start an exam to track mastery.</p>
                </div>
              ) : (
                data.sampleMastery.map((item) => (
                  <div key={item.sampleId} className="group p-5 rounded-2xl bg-slate-950/40 border border-slate-800/50 hover:border-indigo-500/30 transition-all hover:bg-slate-900/50 hover:shadow-xl hover:shadow-indigo-500/5 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <p className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors text-sm line-clamp-1">{item.sampleName}</p>
                      <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[8px] font-black border uppercase tracking-tighter transition-colors ${statusClasses[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                    {item.sampleNameAr && <p className="text-[10px] font-bold text-slate-600 mb-4">{item.sampleNameAr}</p>}
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                        <span>Mastery Score</span>
                        <span className="text-indigo-400 font-bold">{item.masteryScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${
                            item.masteryScore >= 80 ? "bg-gradient-to-r from-emerald-600 to-emerald-400" : 
                            item.masteryScore >= 60 ? "bg-gradient-to-r from-amber-600 to-amber-400" : 
                            "bg-gradient-to-r from-rose-600 to-rose-400"
                          }`}
                          style={{ width: `${item.masteryScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* SIDEBAR: Confusions & Insights */}
          <div className="space-y-8">
            <section className="rounded-[3rem] bg-slate-900/50 border border-slate-800 p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <ShieldAlert size={20} className="text-rose-400" />
                Common Confusions
              </h3>
              <div className="space-y-4">
                {data.confusionTop5.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-6">No diagnostic patterns yet.</p>
                ) : (
                  data.confusionTop5.map((pair) => (
                    <div key={pair.label} className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 group hover:bg-rose-500/10 transition-colors">
                      <p className="text-sm text-rose-200 font-medium group-hover:text-white transition-colors">{pair.label}</p>
                      <span className="text-xs font-black text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg">{pair.count}x</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[3rem] bg-slate-900/50 border border-slate-800 p-8 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Lightbulb size={20} className="text-amber-400" />
                Adaptive Insights
              </h3>
              <div className="space-y-4">
                {data.insights.map((insight, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                    <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    <p className="text-sm text-slate-400 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function ActionCard({ href, icon, title, desc, color, border }: { href: string; icon: React.ReactNode; title: string; desc: string; color: string; border?: boolean }) {
  return (
    <Link href={href} className={`group relative overflow-hidden rounded-[2.5rem] ${color} p-8 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] ${border ? "border border-slate-700/50" : ""}`}>
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-all"></div>
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-md">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed max-w-[200px]">
          {desc}
        </p>
        <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white/80">
          Enter <ChevronRight size={14} />
        </div>
      </div>
    </Link>
  );
}

function StatCard({ label, value, icon, color = "text-indigo-400" }: { label: string; value: string | number; icon: React.ReactNode; color?: string }) {
  return (
    <div className="p-6 rounded-[2rem] bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
      <div className={`mb-4 ${color} opacity-80`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}
