"use client";

import { useLayoutEffect, useState } from "react";
import { scoreTextClass } from "@/lib/score";

type ScoreGaugeProps = {
  score: number;
  size?: number;
  id?: string;
};

export function ScoreGauge({ score, size = 168, id }: ScoreGaugeProps) {
  const [shown, setShown] = useState(score);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(score);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 1100);
      const eased = 1 - (1 - progress) ** 3;
      setShown(Math.round(score * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    setShown(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);
  const stroke = size >= 220 ? 10 : 7;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - score / 100);
  const gradientId = `score-gauge-${String(id ?? size).replace(/[^A-Za-z0-9_-]/g, "-")}`;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`AssetScore ${score} out of 100`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(244,245,247,0.08)"
          strokeWidth={stroke}
        />
        <circle
          className="gauge-arc"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{
            strokeDasharray: circ,
            strokeDashoffset: offset,
            ["--gauge-circ" as string]: circ,
            ["--gauge-offset" as string]: offset,
          }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4fd6ae" />
            <stop offset="100%" stopColor="#d7f25c" />
          </linearGradient>
        </defs>
      </svg>
      <div className="pointer-events-none absolute text-center">
        <p
          className={`font-mono leading-none font-medium tracking-[-0.06em] tabular-nums ${scoreTextClass(score)} ${size >= 220 ? "text-6xl" : size <= 110 ? "text-3xl" : "text-[2.75rem]"}`}
        >
          <span aria-hidden>{shown}</span>
        </p>
        <p className="mt-1.5 text-[10px] tracking-[0.18em] text-muted uppercase">
          of 100
        </p>
      </div>
    </div>
  );
}
