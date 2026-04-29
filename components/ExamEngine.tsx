"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExamQuestion } from "@/lib/examService";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Microscope, ArrowRight, Lightbulb, AlertCircle, Timer } from "lucide-react";

type ExamEngineProps = {
  questions: ExamQuestion[];
  mode: "standard" | "pressure";
};

type FeedbackPayload = {
  status: "Correct Answer" | "Incorrect Answer";
  errorClassification: "Misidentification error" | "Feature omission error" | "Confusion with similar sample" | "Misinterpretation of variation" | null;
  explanation: string;
};

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ");
}

function isCorrectAnswer(question: ExamQuestion, userAnswer: string): boolean {
  const normalizedUser = normalize(userAnswer);
  if (!normalizedUser) {
    return false;
  }

  const getLevenshteinDistance = (a: string, b: string): number => {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) tmp[i] = [i];
    for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1,
          tmp[i][j - 1] + 1,
          tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return tmp[a.length][b.length];
  };

  const isFuzzyMatch = (s1: string, s2: string) => {
    if (s1.length <= 3) return s1 === s2;
    const distance = getLevenshteinDistance(s1, s2);
    // Extremely lenient: allow 2 errors for short words, 3 for long ones
    const threshold = s1.length > 8 ? 3 : 2;
    return distance <= threshold;
  };

  const checkMatch = (expected: string, actual: string) => {
    const normExp = normalize(expected);
    const normAct = normalize(actual);
    
    if (normExp === normAct) return true;
    
    // Core tokens (ignore words like 'the', 'is', 'a')
    const stopWords = ["the", "is", "a", "an", "of", "with", "and"];
    const expTokens = normExp.split(" ").filter(t => t.length > 2 && !stopWords.includes(t)).sort();
    const actTokens = normAct.split(" ").filter(t => t.length > 2 && !stopWords.includes(t)).sort();
    
    if (expTokens.length === 0) return normExp === normAct;

    // If student types the essential scientific tokens, it's correct
    return expTokens.every(eToken => 
      actTokens.some(aToken => isFuzzyMatch(eToken, aToken))
    );
  };

  if (question.choices.length > 0) {
    return question.acceptedAnswers.some((answer) => normalize(answer) === normalizedUser);
  }

  return question.acceptedAnswers.some((answer) => checkMatch(answer, userAnswer));
}

export function ExamEngine({ questions, mode }: ExamEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<Record<string, FeedbackPayload>>({});
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [imageViewed, setImageViewed] = useState<Record<string, boolean>>({});

  const currentQuestion = questions[currentIndex];
  const progress = useMemo(() => `${currentIndex + 1} / ${questions.length}`, [currentIndex, questions.length]);

  const answerValue = answers[currentQuestion.id] ?? "";
  const timerValue = timers[currentQuestion.id] ?? currentQuestion.pressureConfig?.timerSeconds ?? 0;
  const hasViewedImage = imageViewed[currentQuestion.id] ?? mode !== "pressure";
  
  const zoomFactor = currentQuestion.microscopy?.zoomLevel ?? 1;

  useEffect(() => {
    if (mode !== "pressure" || revealed[currentQuestion.id]) return;
    const initial = currentQuestion.pressureConfig?.timerSeconds ?? 30;
    if (timers[currentQuestion.id] === undefined) {
      setTimers((prev) => ({ ...prev, [currentQuestion.id]: initial }));
      return;
    }
    if (timers[currentQuestion.id] <= 0) {
      if (!revealed[currentQuestion.id]) {
        void onSubmitAnswer(true);
      }
      return;
    }

    const timeout = setTimeout(() => {
      setTimers((prev) => ({ ...prev, [currentQuestion.id]: Math.max(0, (prev[currentQuestion.id] ?? initial) - 1) }));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [mode, currentQuestion.id, currentQuestion.pressureConfig?.timerSeconds, revealed, timers]);

  const onSubmitAnswer = async (timeUp = false) => {
    if (revealed[currentQuestion.id]) return;

    const candidateAnswer = timeUp ? "" : answerValue.trim();
    const correct = isCorrectAnswer(currentQuestion, candidateAnswer);
    if (correct) {
      setScore((prev) => prev + 1);
    }

    setRevealed((prev) => ({ ...prev, [currentQuestion.id]: true }));
    setLoadingFeedback(true);

    try {
      const response = await fetch("/api/exam/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: currentQuestion.examId,
          questionId: currentQuestion.id,
          sampleId: currentQuestion.sampleId,
          questionType: currentQuestion.type,
          prompt: currentQuestion.prompt,
          variationType: currentQuestion.variationType,
          mode,
          timeSpentSeconds: mode === "pressure" ? (currentQuestion.pressureConfig?.timerSeconds ?? 30) - (timers[currentQuestion.id] ?? 0) : undefined,
          userAnswer: candidateAnswer,
          isCorrect: correct,
          correctAnswer: currentQuestion.acceptedAnswers[0] ?? currentQuestion.sample.name,
          chosenSample: currentQuestion.type === "identify_sample" ? candidateAnswer : null,
          sample: currentQuestion.sample
        })
      });

      if (response.ok) {
        const feedback = (await response.json()) as FeedbackPayload;
        setFeedbackByQuestion((prev) => ({ ...prev, [currentQuestion.id]: feedback }));
      }
    } finally {
      setLoadingFeedback(false);
    }
  };

  const onNextQuestion = () => {
    if (!revealed[currentQuestion.id]) return;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      setFinished(true);
      void fetch("/api/exam/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: currentQuestion.examId })
      });
      return;
    }
    setCurrentIndex(nextIndex);
  };

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.section 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8">
          <CheckCircle2 size={64} className="text-indigo-400" />
        </div>
        <h2 className="text-4xl font-black text-white mb-4">Exam Completed!</h2>
        <div className="flex gap-8 mb-10">
          <div className="text-center">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Total Score</p>
            <p className="text-3xl font-black text-white">{score} / {questions.length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Accuracy</p>
            <p className={`text-3xl font-black ${percentage >= 80 ? "text-emerald-400" : percentage >= 50 ? "text-amber-400" : "text-rose-400"}`}>{percentage}%</p>
          </div>
        </div>
        <Link href="/dashboard" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20">
          Return to Analytics
        </Link>
      </motion.section>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Module {currentIndex + 1}</p>
          <h2 className="text-2xl font-black text-white tracking-tight">Practical Identification</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-xs font-bold text-slate-300">
            {progress}
          </div>
          {mode === "pressure" && (
            <motion.div 
              animate={timerValue <= 5 ? { 
                scale: [1, 1.1, 1],
                backgroundColor: ["rgba(244, 63, 94, 0.1)", "rgba(244, 63, 94, 0.3)", "rgba(244, 63, 94, 0.1)"]
              } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-black ${timerValue <= 5 ? "border-rose-500 text-rose-400" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"}`}
            >
              <Timer size={14} className={timerValue <= 5 ? "animate-spin" : ""} />
              <span className="tabular-nums">{timerValue}s</span>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div className="relative group">
            {!hasViewedImage ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setImageViewed((prev) => ({ ...prev, [currentQuestion.id]: true }))}
                className="w-full h-[400px] rounded-[2.5rem] border-2 border-dashed border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all backdrop-blur-sm"
              >
                <div className="p-6 bg-slate-800 rounded-3xl group-hover:bg-indigo-500/10 transition-colors">
                  <Microscope size={48} />
                </div>
                <p className="text-lg font-bold">Reveal Microscope View</p>
                <p className="text-xs uppercase tracking-widest font-black opacity-50">One-time view only in pressure mode</p>
              </motion.button>
            ) : (
              <div className="relative h-[400px] w-full rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
                <motion.img
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ 
                    scale: zoomFactor * (currentQuestion.microscopy?.cropRect ? 2 : 1), 
                    opacity: 1 
                  }}
                  src={currentQuestion.image}
                  alt="Histology Specimen"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    filter: `blur(${currentQuestion.microscopy?.blurPx ?? 0}px) contrast(${currentQuestion.microscopy?.contrast ?? 1})`,
                    transform: `rotate(${currentQuestion.microscopy?.rotationDeg ?? 0}deg)`,
                    objectPosition: currentQuestion.microscopy?.cropRect
                      ? `${currentQuestion.microscopy.cropRect.x}% ${currentQuestion.microscopy.cropRect.y}%`
                      : "center",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white/80 uppercase tracking-widest">
                    Live Micro-View
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="flex items-center gap-3 mb-4 text-indigo-400">
                  <Lightbulb size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">Clinical Hint</span>
                </div>
                <p className="text-indigo-100/70 text-sm leading-relaxed font-medium">
                  {currentQuestion.prompt}
                </p>
              </div>

              {currentQuestion.choices.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.choices.map((choice, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ x: 10 }}
                      disabled={revealed[currentQuestion.id]}
                      onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: choice }))}
                      className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        answers[currentQuestion.id] === choice 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                        : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                      } disabled:opacity-50`}
                    >
                      <span className="font-bold">{choice}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion.id] === choice ? "border-white bg-white/20" : "border-slate-700"}`}>
                        {answers[currentQuestion.id] === choice && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <textarea
                  disabled={revealed[currentQuestion.id]}
                  value={answers[currentQuestion.id] ?? ""}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                  placeholder="Identify specimen or features..."
                  className="w-full h-32 p-6 rounded-3xl bg-slate-900/50 border border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all resize-none font-medium"
                />
              )}
            </div>

            <div className="space-y-6">
              {revealed[currentQuestion.id] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-8 rounded-[2rem] border h-full flex flex-col ${
                    isCorrectAnswer(currentQuestion, answers[currentQuestion.id] ?? "") 
                    ? "bg-emerald-500/5 border-emerald-500/20" 
                    : "bg-rose-500/5 border-rose-500/20"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    {isCorrectAnswer(currentQuestion, answers[currentQuestion.id] ?? "") ? (
                      <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                        <CheckCircle2 size={24} />
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl">
                        <XCircle size={24} />
                      </div>
                    )}
                    <div>
                      <h4 className="text-lg font-black text-white">
                        {isCorrectAnswer(currentQuestion, answers[currentQuestion.id] ?? "") ? "Excellent!" : "Not quite..."}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Diagnostic Feedback</p>
                    </div>
                  </div>

                  {loadingFeedback ? (
                    <div className="flex flex-col items-center justify-center flex-grow gap-4 text-slate-500">
                      <Loader2 className="animate-spin" />
                      <p className="text-xs font-black uppercase tracking-widest">Analyzing diagnosis...</p>
                    </div>
                  ) : feedbackByQuestion[currentQuestion.id] ? (
                    <div className="space-y-4">
                      {/* Image Section */}
                      <div className="relative group rounded-[2.5rem] overflow-hidden border border-white/10 bg-black shadow-2xl">
                        <img 
                          src={currentQuestion.image} 
                          alt="Exam Specimen" 
                          className="w-full h-[350px] md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{
                            objectPosition: currentQuestion.microscopy?.cropRect
                              ? `${currentQuestion.microscopy.cropRect.x}% ${currentQuestion.microscopy.cropRect.y}%`
                              : "center",
                            transform: currentQuestion.microscopy?.cropRect ? "scale(2)" : "none"
                          }}
                        />
                        
                        {/* Dynamic Pointer for "Identify Part" questions */}
                        {currentQuestion.type === "identify_structure" && (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                          >
                            <div className="relative">
                              <motion.div 
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-16 h-16 bg-rose-500 rounded-full blur-xl"
                              />
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] border-2 border-rose-500" />
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-white/40 rounded-full border-dashed"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent backdrop-blur-sm">
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Microscopic Field | High Magnification</p>
                        </div>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {feedbackByQuestion[currentQuestion.id].explanation}
                      </p>
                      {!isCorrectAnswer(currentQuestion, answers[currentQuestion.id] ?? "") && (
                        <div className="pt-4 border-t border-rose-500/10">
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Expected Answer</p>
                          <p className="text-white font-bold">{currentQuestion.acceptedAnswers[0]}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-slate-500 py-10">
                      <AlertCircle size={20} />
                      <p className="text-sm font-medium italic">Feedback system offline.</p>
                    </div>
                  )}
                </motion.div>
              )}
              
              {!revealed[currentQuestion.id] && (
                <div className="h-full flex flex-col justify-center items-center text-center p-10 border border-dashed border-slate-800 rounded-[2rem] bg-slate-900/20">
                  <AlertCircle size={32} className="text-slate-700 mb-4" />
                  <p className="text-slate-500 font-bold text-sm">Submit your answer to see <br/> diagnostic breakdown.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            {!revealed[currentQuestion.id] ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSubmitAnswer()}
                disabled={!answerValue.trim() && mode !== "pressure"}
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none"
              >
                Verify Diagnosis
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ gap: "2rem" }}
                onClick={onNextQuestion}
                className="px-10 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-4"
              >
                {currentIndex === questions.length - 1 ? "Complete Exam" : "Next Specimen"}
                <ArrowRight size={18} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
