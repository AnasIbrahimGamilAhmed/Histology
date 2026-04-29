"use client";

import { UserProfileBar } from "@/components/UserProfileBar";
import { BookOpen, Brain, Activity, Target, ShieldAlert, CheckCircle2, ChevronRight, TrendingUp, Sparkles, Microscope, Lightbulb } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const statusClasses = {
  Weak: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Strong: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 pb-20 overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" 
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]" 
        />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <UserProfileBar />
        
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Learning Analytics
            </h1>
            <p className="mt-4 text-slate-400 text-lg max-w-2xl leading-relaxed">
              Real-time tracking of your diagnostic mastery and practical identification trends.
            </p>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-4 px-6 py-4 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl shadow-2xl"
          >
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Growth Trend</p>
              <p className="text-lg font-black text-white">
                {data?.trend?.delta > 0 ? "+" : ""}{data?.trend?.delta ?? 0}% <span className="text-xs font-medium text-slate-400 ml-1">this period</span>
              </p>
            </div>
          </motion.div>
        </motion.header>

        {/* Action Grid */}
        <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <ActionCard 
            href="/study"
            icon={<BookOpen size={32} />}
            title="Study Navigator"
            desc="Explore interactive tissue maps and expert tips."
            color="from-indigo-600 to-indigo-800"
            delay={0.1}
          />
          <ActionCard 
            href="/exam"
            icon={<Brain size={32} />}
            title="Exam Engine"
            desc="Unlimited randomized micro-view practicals."
            color="from-blue-600 to-blue-800"
            delay={0.2}
          />
          <ActionCard 
            href="/atlas"
            icon={<Microscope size={32} />}
            title="Micro Atlas"
            desc="Browse high-res slides with active magnifier."
            color="from-slate-800 to-slate-900"
            border
            delay={0.3}
          />
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <StatCard label="Total Identified" value={data?.overall?.totalQuestionsAnswered ?? 0} icon={<Activity size={20} />} delay={0.4} />
          <StatCard label="Overall Accuracy" value={`${data?.overall?.accuracyPercentage ?? 0}%`} icon={<Target size={20} />} delay={0.5} />
          <StatCard label="Critical Area" value={data?.overall?.weakSamplesCount ?? 0} icon={<ShieldAlert size={20} />} color="text-rose-400" delay={0.6} />
          <StatCard label="Mastered Elite" value={data?.overall?.strongSamplesCount ?? 0} icon={<CheckCircle2 size={20} />} color="text-emerald-400" delay={0.7} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          {/* MASTERY GRID SECTION */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-2 rounded-[3.5rem] bg-slate-900/40 border border-slate-800/60 p-10 backdrop-blur-md shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-3xl">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Specimen Mastery</h2>
                  <p className="text-slate-500 font-medium">Diagnostic performance per sample</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar scroll-smooth relative z-10">
              {data.sampleMastery.length === 0 ? (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-800/50 rounded-[2.5rem] bg-slate-950/20">
                  <p className="text-slate-500 font-medium">No session data. Start an exam to track mastery.</p>
                </div>
              ) : (
                data.sampleMastery.map((item: any, i: number) => (
                  <motion.div 
                    key={item.sampleId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + (i * 0.05) }}
                    className="group p-6 rounded-3xl bg-slate-950/60 border border-slate-800/40 hover:border-indigo-500/40 transition-all hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-indigo-500/5"
                  >
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <p className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors text-sm line-clamp-1">{item.sampleName}</p>
                      <span className={`shrink-0 px-2.5 py-1 rounded-xl text-[9px] font-black border uppercase tracking-tighter transition-colors ${statusClasses[item.status as keyof typeof statusClasses]}`}>
                        {item.status}
                      </span>
                    </div>
                    {item.sampleNameAr && <p className="text-[11px] font-bold text-slate-600 mb-5 text-right">{item.sampleNameAr}</p>}
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Mastery</span>
                        <span className="text-indigo-400">{item.masteryScore}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.masteryScore}%` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 1.2 }}
                          className={`h-full rounded-full ${
                            item.masteryScore >= 80 ? "bg-gradient-to-r from-emerald-600 to-emerald-400" : 
                            item.masteryScore >= 60 ? "bg-gradient-to-r from-amber-600 to-amber-400" : 
                            "bg-gradient-to-r from-rose-600 to-rose-400"
                          }`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>

          {/* SIDEBAR: Confusions & Insights */}
          <div className="space-y-10">
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="rounded-[3rem] bg-slate-900/40 border border-slate-800/60 p-8 backdrop-blur-md shadow-xl"
            >
              <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
                  <ShieldAlert size={24} />
                </div>
                Common Confusions
              </h3>
              <div className="space-y-4">
                {data.confusionTop5.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-8">No diagnostic patterns yet.</p>
                ) : (
                  data.confusionTop5.map((pair: any) => (
                    <motion.div 
                      key={pair.label}
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between p-5 rounded-[1.5rem] bg-rose-500/5 border border-rose-500/10 group hover:bg-rose-500/10 transition-all"
                    >
                      <p className="text-sm text-rose-200 font-bold group-hover:text-white transition-colors">{pair.label}</p>
                      <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">{pair.count}x</span>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="rounded-[3rem] bg-indigo-900/10 border border-indigo-500/20 p-8 backdrop-blur-md relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-[60px] group-hover:bg-indigo-500/20 transition-all" />
              <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Sparkles size={24} />
                </div>
                Smart Coach
              </h3>
              <div className="space-y-5 relative z-10">
                {data.insights.map((insight: string, i: number) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shadow-sm"
                  >
                    <div className="mt-1 h-6 w-6 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <Lightbulb size={14} className="text-indigo-400" />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-semibold">{insight}</p>
                  </motion.div>
                ))}
              </div>
              <Link href="/study" className="mt-8 w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-[0.2em] text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                Follow Advice <ChevronRight size={16} />
              </Link>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}

function ActionCard({ href, icon, title, desc, color, border, delay }: { href: string; icon: React.ReactNode; title: string; desc: string; color: string; border?: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Link href={href} className={`group relative overflow-hidden rounded-[3rem] bg-gradient-to-br ${color} p-10 shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.97] block h-full ${border ? "border border-slate-700/50" : ""}`}>
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-[80px] group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="w-16 h-16 rounded-[1.5rem] bg-white/15 flex items-center justify-center mb-8 backdrop-blur-xl border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl">
            {icon}
          </div>
          <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{title}</h3>
          <p className="text-white/70 text-sm leading-relaxed max-w-[220px] font-medium">
            {desc}
          </p>
          <div className="mt-auto pt-10 flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-white/90 group-hover:gap-5 transition-all">
            Enter Simulation <ChevronRight size={18} strokeWidth={3} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function StatCard({ label, value, icon, color = "text-indigo-400", delay }: { label: string; value: string | number; icon: React.ReactNode; color?: string; delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5 }}
      className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between h-full"
    >
      <div className={`mb-6 ${color} p-3 bg-white/5 w-fit rounded-2xl border border-white/5`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{label}</p>
        <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
      </div>
    </motion.div>
  );
}
