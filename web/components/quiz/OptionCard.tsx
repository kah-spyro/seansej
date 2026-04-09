"use client";

import { QuizOption } from "@/types";

interface Props {
  option: QuizOption;
  selected: boolean;
  onClick: () => void;
}

export default function OptionCard({ option, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-5 py-4 rounded-2xl border transition-all duration-150
        flex items-center gap-3 group
        ${
          selected
            ? "bg-white text-gray-900 border-white shadow-lg scale-[1.01]"
            : "bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/30"
        }
      `}
    >
      {option.emoji && (
        <span className="text-xl leading-none shrink-0">{option.emoji}</span>
      )}
      <span className="font-medium">{option.label}</span>
    </button>
  );
}
