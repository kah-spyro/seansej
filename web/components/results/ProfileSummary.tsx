"use client";

import { QuizAnswers } from "@/types";
import { QUESTIONS } from "@/lib/questions";

interface Props {
  answers: QuizAnswers;
}

export default function ProfileSummary({ answers }: Props) {
  return (
    <div className="glass-card border border-outline-variant/15 rounded-2xl p-6">
      <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-5">
        Your Movie Profile
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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
              return opt?.label ?? v;
            })
            .join(", ");

          return (
            <div key={q.id}>
              <p className="text-xs text-on-surface-variant/60 mb-0.5 truncate">
                {q.label}
              </p>
              <p className="text-sm text-on-surface font-medium">
                {labels || "—"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
