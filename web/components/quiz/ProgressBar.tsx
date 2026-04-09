"use client";

interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
      <div
        className="h-full bg-tertiary rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          boxShadow: "0 0 10px #ffb68b",
        }}
      />
    </div>
  );
}
