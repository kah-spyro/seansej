"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { QUESTIONS } from "@/lib/questions";
import { QuizAnswers } from "@/types";
import ProgressBar from "./ProgressBar";
import OptionCard from "./OptionCard";

type PartialAnswers = Partial<QuizAnswers>;

const SLIDE = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const QUIZ_BGS = ["/images/hero-1.jpg", "/images/quiz-bg.jpg"];

export default function QuizShell() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<PartialAnswers>({});
  const [quizBg] = useState(() => QUIZ_BGS[Math.floor(Math.random() * QUIZ_BGS.length)]);

  const question = QUESTIONS[step];
  const stepNum = step + 1;
  const totalSteps = QUESTIONS.length;
  const isLast = step === totalSteps - 1;
  const isMulti = question.multiSelect === true;
  const isPlatform = false;

  const currentValue = answers[question.id];
  const selectedValues: string[] = isMulti
    ? ((currentValue as string[]) ?? [])
    : currentValue
    ? [currentValue as string]
    : [];

  function go(dir: 1 | -1) {
    setDirection(dir);
    setStep((s) => s + dir);
  }

  function selectSingle(value: string) {
    const updated = { ...answers, [question.id]: value };
    setAnswers(updated);
    if (!isLast) {
      setTimeout(() => go(1), 200);
    } else {
      setTimeout(() => {
        router.push(`/results?q=${encodeURIComponent(JSON.stringify(updated))}`);
      }, 200);
    }
  }

  function toggleMulti(value: string) {
    setAnswers((prev) => {
      const curr = (prev[question.id] as string[]) ?? [];
      const next = curr.includes(value)
        ? curr.filter((v) => v !== value)
        : [...curr, value];
      return { ...prev, [question.id]: next };
    });
  }

  function confirm() {
    const final = { ...answers };
    if (!(question.id in final)) {
      (final as Record<string, unknown>)[question.id] = [];
    }
    router.push(`/results?q=${encodeURIComponent(JSON.stringify(final))}`);
  }

  const curationScore = Math.round(40 + (step / totalSteps) * 55);

  return (
    <main className="pt-24 min-h-screen flex flex-col relative overflow-hidden">
      {/* Fixed cinematic background */}
      <div className="fixed inset-0 -z-10 opacity-40 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={quizBg}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 noir-gradient" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 w-full flex-grow flex flex-col">
        {/* Question header */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="mb-12"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0 mr-6">
                <span className="text-primary font-headline font-bold text-sm tracking-widest uppercase block mb-2">
                  Step {String(stepNum).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
                </span>
                <h1
                  className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface"
                  dangerouslySetInnerHTML={{ __html: question.question }}
                />
              </div>
              {question.quote && (
                <p className="hidden md:block text-right text-on-surface-variant text-sm max-w-xs italic leading-relaxed shrink-0">
                  {question.quote}
                </p>
              )}
            </div>
            <ProgressBar current={stepNum} total={totalSteps} />
          </motion.div>
        </AnimatePresence>

        {/* Options grid */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className={`grid gap-6 flex-grow mb-8 ${question.gridClass ?? "grid-cols-1 md:grid-cols-2"}`}
          >
            {question.options.map((opt) => (
              <OptionCard
                key={opt.value}
                option={opt}
                selected={selectedValues.includes(opt.value)}
                isMulti={isMulti}
                isPlatform={isPlatform}
                onClick={() =>
                  isMulti ? toggleMulti(opt.value) : selectSingle(opt.value)
                }
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        {isMulti ? (
          /* Q9 multi-select footer */
          <div className="mt-auto flex flex-col md:flex-row items-center justify-between gap-6 border-t border-outline-variant/10 pt-8">
            <p className="text-on-surface-variant text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">info</span>
              Selected genres will be filtered out of your curator results.
            </p>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                onClick={confirm}
                className="flex-1 md:flex-none px-8 py-4 rounded-xl text-primary font-headline font-bold bg-surface-variant/20 hover:bg-surface-variant/40 transition-all border border-outline-variant/15 active:scale-95"
              >
                Skip
              </button>
              <button
                onClick={confirm}
                className="flex-1 md:flex-none px-12 py-4 rounded-xl text-on-primary font-headline font-bold bg-gradient-to-br from-primary to-primary-container hover:shadow-[0_0_30px_rgba(202,190,255,0.5)] transition-all active:scale-95"
                style={{ boxShadow: "0 0 20px rgba(202,190,255,0.3)" }}
              >
                Confirm
              </button>
            </div>
          </div>
        ) : (
          /* Single-select footer */
          <div className="flex justify-between items-center mt-auto py-8">
            <button
              onClick={() => go(-1)}
              className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors px-6 py-3 rounded-full hover:bg-surface-container"
              style={{ visibility: step === 0 ? "hidden" : "visible" }}
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span className="font-headline font-bold uppercase tracking-widest text-sm">
                Go Back
              </span>
            </button>
            <span className="text-on-surface-variant text-xs">
              {isPlatform ? "Pick one to continue" : "Pick one to continue"}
            </span>
          </div>
        )}
      </div>

      {/* Fixed Curation Match badge (bottom-left) */}
      <div className="fixed bottom-6 left-6 hidden lg:flex items-center gap-4 p-4 rounded-full bg-surface-container/70 backdrop-blur-xl border border-outline-variant/15">
        <div className="w-12 h-12 rounded-full flex items-center justify-center relative">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
            <circle
              className="text-surface-container-highest"
              cx="24"
              cy="24"
              r="20"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="4"
            />
            <circle
              className="text-primary"
              cx="24"
              cy="24"
              r="20"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - curationScore / 100)}`}
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-on-surface">
            {curationScore}%
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-on-surface">Curation Match</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
            Profile Optimized
          </p>
        </div>
      </div>
    </main>
  );
}
