"use client";

import { useEffect, useState, Suspense } from "react";
import { ExamEngine } from "@/components/ExamEngine";
import type { ExamQuestion } from "@/lib/examService";
import { Brain, Play, ShieldAlert, RotateCcw, ArrowLeft, Microscope, Timer, Settings2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const examModes = ["standard", "pressure", "drill"] as const;

type LiveExamMode = (typeof examModes)[number] | null;
type LoadState = "idle" | "loading" | "ready" | "error";

function ExamContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<LiveExamMode>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [examId, setExamId] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(8);
  // Counter instead of boolean: every increment is a new value, so useEffect always re-fires.
  // Fixes the bug where clicking "Try Again" after a failed attempt did nothing because
  // setForceRegen(true) was a no-op when forceRegen was already true.
  const [regenCount, setRegenCount] = useState(0);

  // Initialize from URL params
  useEffect(() => {
    const urlMode = searchParams.get("mode") as LiveExamMode;
    const urlLimit = searchParams.get("limit");

    if (urlMode && examModes.includes(urlMode)) {
      setMode(urlMode);
      if (urlLimit) setLimit(Number(urlLimit));
      setLoadState("loading");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!mode || loadState !== "loading") return undefined;
    const controller = new AbortController();

    async function fetchExam() {
      try {
        const isDrill = mode === "drill" || searchParams.get("drill") === "1";
        const fetchMode = isDrill ? "standard" : mode;
        const category = searchParams.get("category");
        
        let url = `/api/exam/questions?mode=${fetchMode}&limit=${limit}`;
        if (regenCount > 0) url += "&regen=1";
        if (isDrill) url += "&drill=1";
        if (category) url += `&category=${category}`;

        const response = await fetch(url, {
          signal: controller.signal
        });
        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to load exam.");
        }
        const data = await response.json();
        setExamId(data.examId ?? null);
        setQuestions(data.questions ?? []);
        setLoadState("ready");
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unable to generate the exam.");
        setLoadState("error");
      }
    }

    void fetchExam();
    return () => controller.abort();
  }, [mode, limit, loadState, searchParams, regenCount]);

  const startExam = (selectedMode: LiveExamMode) => {
    setMode(selectedMode);
    setRegenCount((c) => c + 1);
    setQuestions([]);
    setExamId(null);
    setError(null);
    setLoadState(selectedMode ? "loading" : "idle");
  };

  const regenerateExam = () => {
    if (!mode) return;
    setRegenCount((c) => c + 1);
    setError(null);
    setLoadState("loading");
  };

  const resetExam = () => {
    setMode(null);
    setQuestions([]);
    setExamId(null);
    setError(null);
    setLoadState("idle");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30 pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        <header className="mb-12">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Exam Simulator
              </h1>
              <p className="mt-4 text-slate-400 text-lg max-w-2xl">
                Student-specific practical sessions with randomized specimen selection and realistic microscope conditions.
              </p>
            </div>
            {mode && (
              <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-sm ${
                mode === "drill" ? "bg-amber-500/10 border-amber-500/20 text-amber-300" :
                mode === "pressure" ? "bg-rose-500/10 border-rose-500/20 text-rose-300" :
                "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
              }`}>
                {mode === "drill" ? <Brain size={24} /> : mode === "pressure" ? <ShieldAlert size={24} /> : <Timer size={24} />}
                <span className="font-bold capitalize">{mode === "drill" ? "Adaptive Drill" : `${mode} Mode`} Active</span>
              </div>
            )}
          </div>
        </header>

        {!mode ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => startExam("standard")}
              className="group p-8 rounded-[3rem] bg-slate-900/50 border border-slate-800 hover:border-indigo-500/30 text-left transition-all hover:shadow-2xl hover:shadow-indigo-500/5 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-all" />
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Play size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                Standard Mode
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Balanced practice with the full curriculum. No time limits, perfect for foundational mastery.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mt-auto">
                Start Session →
              </div>
            </button>

            <button
              onClick={() => startExam("drill")}
              className="group p-8 rounded-[3rem] bg-indigo-500/10 border border-indigo-500/20 hover:border-amber-500/40 text-left transition-all hover:shadow-2xl hover:shadow-amber-500/5 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-amber-500/5 blur-2xl group-hover:bg-amber-500/10 transition-all" />
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                Confusion Drill
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Adaptive practice focusing on your weak areas and confused pairs. 70% priority on mistakes.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mt-auto">
                Target Weakness →
              </div>
            </button>

            <button
              onClick={() => startExam("pressure")}
              className="group p-8 rounded-[3rem] bg-slate-900/50 border border-slate-800 hover:border-rose-500/30 text-left transition-all hover:shadow-2xl hover:shadow-rose-500/5 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-rose-500/5 blur-2xl group-hover:bg-rose-500/10 transition-all" />
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-rose-400 transition-colors">
                Pressure Mode
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Timed simulation with strict university rules. One-time viewing and no back-tracking.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-widest mt-auto">
                Enter Simulation →
              </div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-[300px_1fr] gap-10 animate-in fade-in slide-in-from-left-4 duration-500">
            <aside className="space-y-6">
              <div className="p-6 rounded-[2rem] bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest mb-6">
                  <Settings2 size={14} /> Session Settings
                </h4>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-3 ml-1 uppercase">Questions Count</label>
                    <input aria-label="Questions Count"
                      type="range"
                      min={4}
                      max={20}
                      step={2}
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800 rounded-lg h-1.5"
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-black text-slate-500">
                      <span>4</span>
                      <span className="text-indigo-400 text-sm">{limit}</span>
                      <span>20</span>
                    </div>
                  </div>
                  <button
                    onClick={regenerateExam}
                    disabled={loadState === "loading"}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all disabled:opacity-50"
                  >
                    <RotateCcw size={18} className={loadState === "loading" ? "animate-spin" : ""} />
                    New Random Exam
                  </button>
                  <button
                    onClick={resetExam}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-slate-800 hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 font-bold transition-all"
                  >
                    Exit Session
                  </button>
                </div>
              </div>
            </aside>

            <div className="min-h-[600px] rounded-[3rem] bg-slate-900/30 border border-slate-800/50 p-8 relative overflow-hidden shadow-2xl">
              {loadState === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-[#020617]/50 backdrop-blur-sm z-50">
                  <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-8" />
                  <h3 className="text-2xl font-bold text-white mb-2 italic">Synthesizing Unique Exam...</h3>
                </div>
              )}
              {loadState === "ready" && questions.length > 0 && (
                <ExamEngine questions={questions} mode={mode ?? "standard"} />
              )}
              {loadState === "error" && error && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                  <h3 className="text-xl font-bold text-white mb-2">Generation Failed</h3>
                  <p className="text-slate-400 mb-6">{error}</p>
                  <button onClick={regenerateExam} className="px-6 py-3 bg-slate-800 rounded-xl font-bold hover:bg-slate-700 transition-all">Try Again</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <ExamContent />
    </Suspense>
  );
}
