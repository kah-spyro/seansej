"use client";

import { QuizAnswers } from "@/types";
import { QUESTIONS } from "@/lib/questions";

interface Props {
  answers: QuizAnswers;
}

export default function ProfileSummary({ answers }: Props) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Your Movie Profile
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {QUESTIONS.map((q) => {
          const raw = answers[q.id];
          const values: string[] = Array.isArray(raw)
            ? (raw as string[])
            : raw
            ? [raw as string]
            : [];

          const labels = values
            .map((v) => {
              const opt = q.options.find((o) => o.value === v);
              return opt ? `${opt.emoji ?? ""} ${opt.label}`.trim() : v;
            })
            .join(", ");

          return (
            <div key={q.id}>
              <p className="text-xs text-gray-500 mb-0.5 truncate">
                {q.question}
              </p>
              <p className="text-sm text-white font-medium">
                {labels || "—"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
