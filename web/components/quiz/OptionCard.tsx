"use client";

import { useEffect, useState } from "react";
import { QuizOption } from "@/types";

function useBgImage(bgImages?: string[]): string | undefined {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (bgImages && bgImages.length > 1) {
      setIdx(Math.floor(Math.random() * bgImages.length));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return bgImages?.[idx];
}

interface Props {
  option: QuizOption;
  selected: boolean;
  onClick: () => void;
  /** Multi-select (Q9 exclusions) layout */
  isMulti?: boolean;
  /** Platform picker layout (Q8) */
  isPlatform?: boolean;
}

/** Q1–Q7: editorial card — icon in circle at top, subtitle slides up on hover */
function EditorialCard({ option, selected, onClick }: Omit<Props, "isMulti" | "isPlatform">) {
  const bgImage = useBgImage(option.bgImages);
  return (
    <button
      onClick={onClick}
      className={[
        "group relative rounded-2xl overflow-hidden glass-card border text-left glow-hover flex flex-col p-8 transition-all duration-500",
        option.cardClass ?? "",
        selected
          ? "border-primary/60 shadow-[0_0_40px_rgba(93,54,229,0.25)]"
          : "border-outline-variant/15 hover:border-primary/40",
      ].join(" ")}
    >
      {/* Background image */}
      {bgImage && (
        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImage}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col">
        {/* Icon in circle */}
        <div className="w-12 h-12 bg-primary-container/30 rounded-full flex items-center justify-center mb-6 border border-primary/20 shrink-0">
          <span className="material-symbols-outlined text-primary text-2xl">
            {option.icon}
          </span>
        </div>

        <h3
          className={[
            "text-2xl font-headline font-bold tracking-tight transition-colors",
            selected ? "text-primary" : "text-on-surface group-hover:text-primary",
          ].join(" ")}
        >
          {option.label}
        </h3>

        {option.sub && (
          <p className="text-on-surface-variant text-sm mt-2 leading-snug opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            {option.sub}
          </p>
        )}
      </div>

      {/* Selected check */}
      {selected && (
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full persona-gradient flex items-center justify-center">
          <span
            className="material-symbols-outlined text-on-primary text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check
          </span>
        </div>
      )}
    </button>
  );
}

/** Q9: exclusion card — bg image, icon at bottom, radio circle at top-right */
function ExclusionCard({ option, selected, onClick }: Omit<Props, "isMulti" | "isPlatform">) {
  const bgImage = useBgImage(option.bgImages);
  return (
    <div
      onClick={onClick}
      role="button"
      className={[
        "group relative overflow-hidden rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-all duration-300 cursor-pointer border",
        option.cardClass ?? "",
        selected ? "border-primary/50" : "border-outline-variant/10",
      ].join(" ")}
      style={{ minHeight: "180px" }}
    >
      {/* Background image */}
      {bgImage && (
        <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImage}
            alt=""
            className="w-full h-full object-cover grayscale"
          />
        </div>
      )}

      {/* Content — bottom-aligned */}
      <div className="relative p-8 h-full flex flex-col justify-end">
        <span
          className={[
            "material-symbols-outlined text-4xl mb-4 transition-colors",
            selected ? "text-primary" : "text-on-surface-variant group-hover:text-primary",
          ].join(" ")}
        >
          {option.icon}
        </span>
        <h3 className="text-2xl font-headline font-bold text-on-surface">
          {option.label}
        </h3>
      </div>

      {/* Radio circle */}
      <div
        className={[
          "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          selected ? "border-primary" : "border-outline-variant group-hover:border-primary",
        ].join(" ")}
      >
        <div
          className={[
            "w-3 h-3 bg-primary rounded-full transition-transform",
            selected ? "scale-100" : "scale-0",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

/** Q8: platform card — centered icon + name, grayscale → color on hover */
function PlatformCard({ option, selected, onClick }: Omit<Props, "isMulti" | "isPlatform">) {
  return (
    <button
      onClick={onClick}
      className={[
        "group relative flex flex-col items-center justify-center p-8 rounded-2xl glass-card border transition-all duration-300 active:scale-[0.98]",
        option.cardClass ?? "aspect-square",
        selected
          ? "border-primary/60 shadow-[0_0_30px_rgba(93,54,229,0.2)]"
          : "border-outline-variant/10 hover:border-primary/40",
      ].join(" ")}
    >
      <span
        className={[
          "material-symbols-outlined text-5xl mb-4 transition-colors",
          selected ? "text-primary" : "text-on-surface-variant group-hover:text-primary",
        ].join(" ")}
        style={{ fontSize: "3rem" }}
      >
        {option.icon}
      </span>
      <span
        className={[
          "font-headline font-bold text-sm uppercase tracking-wider transition-colors",
          selected ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface",
        ].join(" ")}
      >
        {option.label}
      </span>
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full persona-gradient flex items-center justify-center">
          <span
            className="material-symbols-outlined text-on-primary"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: "12px" }}
          >
            check
          </span>
        </div>
      )}
    </button>
  );
}

export default function OptionCard({ option, selected, onClick, isMulti, isPlatform }: Props) {
  if (isMulti) return <ExclusionCard option={option} selected={selected} onClick={onClick} />;
  if (isPlatform) return <PlatformCard option={option} selected={selected} onClick={onClick} />;
  return <EditorialCard option={option} selected={selected} onClick={onClick} />;
}
