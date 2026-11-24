import type { PricePoint } from "@/lib/fmp";

export type PillarLabel = "Value" | "Growth" | "Quality" | "Financial Health" | "Momentum";

export type Pillar = {
  label: PillarLabel;
  score: number | null;
  note: string;
};

export type ScoreInput = {
  price: number;
  pe: number | null;
  revenueGrowth: number | null;
  netMargin: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  yearLow: number | null;
  yearHigh: number | null;
  history: PricePoint[];
};

export type ScoreResult = {
  score: number | null;
  band: string | null;
  pillars: Pillar[];
  reasons: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value: number) {
  return Math.round(clamp(value, 0, 100));
}

function bandFor(score: number) {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Solid";
  if (score >= 60) return "Mixed";
  return "Weak";
}

function percent(value: number, digits = 1) {
  const scaled = value * 100;
  const sign = scaled > 0 ? "+" : "";
  return `${sign}${scaled.toFixed(digits)}%`;
}

function number(value: number, digits = 1) {
  return value.toFixed(digits);
}

function valueScore(pe: number | null): Pillar {
  if (pe == null || !Number.isFinite(pe)) {
    return { label: "Value", score: null, note: "Annual price-to-earnings was not returned." };
  }
  if (pe <= 0) {
    return {
      label: "Value",
      score: 12,
      note: `Annual price-to-earnings is ${number(pe)}. A negative multiple keeps value low.`,
    };
  }
  return {
    label: "Value",
    score: roundScore(100 - (pe - 8) * 1.6),
    note: `Annual price-to-earnings is ${number(pe)}. A lower multiple scores higher.`,
  };
}

function growthScore(growth: number | null): Pillar {
  if (growth == null || !Number.isFinite(growth)) {
    return { label: "Growth", score: null, note: "Year-over-year revenue growth was not returned." };
  }
  return {
    label: "Growth",
    score: roundScore(50 + growth * 80),
    note: `Revenue growth is ${percent(growth)} year over year.`,
  };
}

function qualityScore(margin: number | null): Pillar {
  if (margin == null || !Number.isFinite(margin)) {
    return { label: "Quality", score: null, note: "Annual net profit margin was not returned." };
  }
  return {
    label: "Quality",
    score: roundScore(35 + margin * 140),
    note: `Annual net profit margin is ${percent(margin, 1).replace("+", "")}.`,
  };
}

function healthScore(currentRatio: number | null, debtToEquity: number | null): Pillar {
  const parts: number[] = [];
  const bits: string[] = [];
  if (currentRatio != null && Number.isFinite(currentRatio)) {
    parts.push(roundScore(20 + currentRatio * 40));
    bits.push(`current ratio ${number(currentRatio, 2)}`);
  }
  if (debtToEquity != null && Number.isFinite(debtToEquity)) {
    parts.push(roundScore(88 - debtToEquity * 18));
    bits.push(`debt to equity ${number(debtToEquity, 2)}`);
  }
  if (parts.length === 0) {
    return {
      label: "Financial Health",
      score: null,
      note: "Current ratio and debt to equity were not returned.",
    };
  }
  const score = Math.round(parts.reduce((sum, value) => sum + value, 0) / parts.length);
  return {
    label: "Financial Health",
    score,
    note: `Latest annual ${bits.join(" and ")}.`,
  };
}

function momentumScore(input: ScoreInput): Pillar {
  const { price, yearLow, yearHigh, history } = input;
  if (
    yearLow != null &&
    yearHigh != null &&
    Number.isFinite(yearLow) &&
    Number.isFinite(yearHigh) &&
    yearHigh > yearLow
  ) {
    const position = clamp((price - yearLow) / (yearHigh - yearLow), 0, 1);
    return {
      label: "Momentum",
      score: roundScore(position * 100),
      note: `The price is ${Math.round(position * 100)}% of the way from the 52-week low to the high.`,
    };
  }

  const earlier = history.length >= 40 ? history[Math.max(0, history.length - 127)] : undefined;
  if (earlier && earlier.price > 0) {
    const change = price / earlier.price - 1;
    return {
      label: "Momentum",
      score: roundScore(50 + change * 120),
      note: `The price is ${percent(change)} versus the close on ${earlier.date}.`,
    };
  }

  return { label: "Momentum", score: null, note: "A 52-week range was not returned." };
}

export function scoreSnapshot(input: ScoreInput): ScoreResult {
  const pillars = [
    valueScore(input.pe),
    growthScore(input.revenueGrowth),
    qualityScore(input.netMargin),
    healthScore(input.currentRatio, input.debtToEquity),
    momentumScore(input),
  ];
  const scored = pillars.filter((pillar): pillar is Pillar & { score: number } => pillar.score != null);
  if (scored.length === 0) {
    return {
      score: null,
      band: null,
      pillars,
      reasons: ["Financial Modeling Prep did not return the inputs used for a score."],
    };
  }

  const score = Math.round(scored.reduce((sum, pillar) => sum + pillar.score, 0) / scored.length);
  return {
    score,
    band: bandFor(score),
    pillars,
    reasons: [
      ...scored.map((pillar) => `${pillar.label} is ${pillar.score}. ${pillar.note}`),
      `The AssetScore of ${score} is the rounded average of ${scored.map((pillar) => pillar.label.toLowerCase()).join(", ")}.`,
    ],
  };
}
