"use client";

import { useEffect, useMemo, useState } from "react";
import type { ExamQuestion } from "@/lib/examService";

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
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function isCorrectAnswer(question: ExamQuestion, userAnswer: string): boolean {
  const normalized = normalize(userAnswer);
  if (!normalized) {
    return false;
  }

  if (question.choices.length > 0) {
    return question.acceptedAnswers.some((answer) => normalize(answer) === normalized);
  }

  return question.acceptedAnswers.some((answer) => normalized.includes(normalize(answer)));
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

  if (questions.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">No questions available</h2>
        <p className="mt-2 text-sm text-slate-600">Seed the database to generate exam questions from sample data.</p>
      </section>
    );
  }

  const answerValue = answers[currentQuestion.id] ?? "";
  const timerValue = timers[currentQuestion.id] ?? currentQuestion.pressureConfig?.timerSeconds ?? 0;
  const hasViewedImage = imageViewed[currentQuestion.id] ?? mode !== "pressure";
  const zoomClass =
    currentQuestion.microscopy?.zoomLevel === 3
      ? "scale-[2]"
      : currentQuestion.microscopy?.zoomLevel === 2
      ? "scale-[1.5]"
      : "scale-100";

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
  }, [mode, currentQuestion.id, currentQuestion.pressureConfig?.timerSeconds, revealed, timers]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmitAnswer = async (timeUp = false) => {
    if (revealed[currentQuestion.id]) {
      return;
    }

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
          timeSpentSeconds:
            mode === "pressure"
              ? (currentQuestion.pressureConfig?.timerSeconds ?? 30) - (timers[currentQuestion.id] ?? currentQuestion.pressureConfig?.timerSeconds ?? 30)
              : undefined,
          userAnswer: candidateAnswer,
          isCorrect: correct,
          correctAnswer: currentQuestion.acceptedAnswers[0] ?? currentQuestion.sample.name,
          chosenSample: currentQuestion.type === "identify_sample" || currentQuestion.type === "compare_samples" || currentQuestion.type === "interpret_partial_slide" || currentQuestion.type === "identify_tissue_type" || currentQuestion.type === "identify_structure" ? candidateAnswer : null,
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
    if (!revealed[currentQuestion.id]) {
      return;
    }

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
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Exam Complete</h2>
        <p className="mt-3 text-lg text-slate-700">
          Score: <span className="font-semibold">{score}</span> / {questions.length}
        </p>
        <p className="mt-1 text-sm text-slate-600">Accuracy: {percentage}%</p>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Question {progress}</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
            {currentQuestion.type === "identify_sample"
              ? "Identify sample"
              : currentQuestion.type === "identify_tissue_type"
              ? "Identify tissue type"
              : currentQuestion.type === "compare_samples"
              ? "Compare specimens"
              : currentQuestion.type === "interpret_partial_slide"
              ? "Interpret partial slide"
              : currentQuestion.type === "identify_structure"
              ? "Identify structure"
              : currentQuestion.type === "describe_features"
              ? "Describe features"
              : "List features"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{currentQuestion.difficulty}</span>
          {mode === "pressure" ? (
            <span className="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-700">Time: {timerValue}s</span>
          ) : null}
        </div>
      </div>

      {hasViewedImage ? (
        <div className="space-y-4">
          <div className="relative rounded-lg border-2 border-slate-300 bg-slate-900 overflow-hidden h-[320px]">
            <img
              src={currentQuestion.image}
              alt="Exam histology view"
              suppressHydrationWarning
              className={`absolute inset-0 h-full w-full object-cover transition duration-200 ${zoomClass}`}
              style={{
                filter: `blur(${currentQuestion.microscopy?.blurPx ?? 0}px) contrast(${currentQuestion.microscopy?.contrast ?? 1})`,
                transform: `rotate(${currentQuestion.microscopy?.rotationDeg ?? 0}deg) scale(${currentQuestion.microscopy?.zoomLevel ?? 1})`,
                objectPosition: currentQuestion.microscopy?.cropRect
                  ? `${-currentQuestion.microscopy.cropRect.x}% ${-currentQuestion.microscopy.cropRect.y}%`
                  : "center",
                zIndex: 10
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
            <div><strong>✓ الصورة واضحة:</strong> تركيز على الهيكل الأساسي</div>
            <div><strong>✓ ليس اللون:</strong> قد تكون الصبغة مختلفة</div>
            <div><strong>✓ الزاوية مهمة:</strong> قد تكون قطعة مائلة</div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setImageViewed((prev) => ({ ...prev, [currentQuestion.id]: true }))}
          suppressHydrationWarning
          className="w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
        >
          🔍 عرض الصورة مرة واحدة فقط / Reveal image once
        </button>
      )}
      <div>
        <div className="space-y-3">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs font-semibold text-amber-900">💡 نصيحة عملية:</p>
            <p className="text-sm text-amber-800 mt-1">ابدأ بالبحث عن الميزات الأساسية الواضحة، ثم انتقل للتفاصيل الدقيقة. لا تخدعك الزوايا الغريبة أو الإضاءة المختلفة - ركّز على البنية الأساسية.</p>
          </div>
          <h3 className="text-xl font-semibold text-slate-900">{currentQuestion.prompt}</h3>
        </div>
      </div>

      {(currentQuestion.type === "identify_sample" ||
        currentQuestion.type === "identify_tissue_type" ||
        currentQuestion.type === "compare_samples" ||
        currentQuestion.type === "interpret_partial_slide" ||
        currentQuestion.type === "identify_structure") ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {currentQuestion.choices.map((choice, index) => {
            const selected = answerValue === choice;
            const label = String.fromCharCode(65 + index);
            return (
              <button
                key={`${choice}-${index}`}
                type="button"
                disabled={revealed[currentQuestion.id]}
                onClick={() => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: choice }))}
                suppressHydrationWarning
                className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                  selected
                    ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
                } disabled:cursor-not-allowed disabled:opacity-75`}
              >
                <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  {label}
                </span>
                {choice}
              </button>
            );
          })}
        </div>
      ) : (
        <textarea
          value={answerValue}
          disabled={revealed[currentQuestion.id]}
          onChange={(event) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: event.target.value }))}
          suppressHydrationWarning
          className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none ring-indigo-200 placeholder:text-slate-400 focus:ring-2"
          placeholder="Type one key feature or description..."
        />
      )}

      {revealed[currentQuestion.id] ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          {feedbackByQuestion[currentQuestion.id] ? (
            <>
              <p
                className={`text-sm font-semibold ${
                  feedbackByQuestion[currentQuestion.id].status === "Correct Answer" ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {feedbackByQuestion[currentQuestion.id].status}
              </p>
              {feedbackByQuestion[currentQuestion.id].errorClassification ? (
                <p className="mt-1 text-xs font-medium text-slate-600">
                  Error Type: {feedbackByQuestion[currentQuestion.id].errorClassification}
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-slate-700">{feedbackByQuestion[currentQuestion.id].explanation}</p>
            </>
          ) : (
            <p className="text-sm text-slate-600">{loadingFeedback ? "Generating AI feedback..." : "Feedback unavailable."}</p>
          )}
        </div>
      ) : null}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => onSubmitAnswer()}
          disabled={(!answerValue.trim() && mode !== "pressure") || !!revealed[currentQuestion.id] || loadingFeedback}
          suppressHydrationWarning
          className="rounded-lg border border-indigo-700 bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
        >
          Check Answer
        </button>
        <button
          type="button"
          onClick={onNextQuestion}
          disabled={!revealed[currentQuestion.id]}
          suppressHydrationWarning
          className="rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {currentIndex === questions.length - 1 ? "Finish Exam" : "Next Question"}
        </button>
      </div>
    </section>
  );
}
