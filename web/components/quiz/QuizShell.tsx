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

export default function QuizShell() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<PartialAnswers>({});

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const isMulti = question.multiSelect === true;

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
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    if (!isLast) {
      setTimeout(() => go(1), 180);
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
    // Q9 exclusions — empty array is valid (skip)
    if (!(question.id in answers)) {
      setAnswers((prev) => ({ ...prev, [question.id]: [] }));
    }
    const final = { ...answers };
    if (!(question.id in final)) {
      (final as Record<string, unknown>)[question.id] = [];
    }
    router.push(`/results?q=${encodeURIComponent(JSON.stringify(final))}`);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-10 pb-6 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-semibold tracking-tight">🎬 Movie Match</span>
        </div>
        <ProgressBar current={step + 1} total={QUESTIONS.length} />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center px-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={SLIDE}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="w-full"
          >
            <h2 className="text-2xl font-bold mb-8 leading-snug">
              {question.question}
            </h2>

            <div className="flex flex-col gap-3">
              {question.options.map((opt) => (
                <OptionCard
                  key={opt.value}
                  option={opt}
                  selected={selectedValues.includes(opt.value)}
                  onClick={() =>
                    isMulti ? toggleMulti(opt.value) : selectSingle(opt.value)
                  }
                />
              ))}
            </div>

            {/* Multi-select actions */}
            {isMulti && (
              <div className="mt-8 flex gap-3">
                <button
                  onClick={confirm}
                  className="flex-1 py-3.5 rounded-2xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition"
                >
                  {selectedValues.length > 0
                    ? `Confirm (${selectedValues.length} selected)`
                    : "Skip — no exclusions"}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back button */}
      {step > 0 && (
        <div className="px-6 pb-10 max-w-lg mx-auto w-full">
          <button
            onClick={() => go(-1)}
            className="text-sm text-gray-400 hover:text-white transition flex items-center gap-1"
          >
            ← Go back
          </button>
        </div>
      )}
    </div>
  );
}
