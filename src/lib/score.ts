import type { PricePoint } from "@/lib/fmp";

export type PillarLabel = "Value" | "Growth" | "Quality" | "Financial Health" | "Momentum";

export type Pillar = {
  label: PillarLabel;
  score: number | null;
  note: string;
  why: string | null;
  omitted?: boolean;
};

export type IndustryGroup = "general" | "bank" | "insurance" | "reit";

export type MethodologyVersion = "1" | "2" | "3";

export const HEADLINE_SCORE_SUMMARY =
  "AssetScore looks at up to five pillars: Value, Growth, Quality, Financial Health, and Momentum. Only pillars with a score are included, and each included pillar has the same weight. Each of those scores is moved 15% of the way toward the middle score of the group. The AssetScore is the rounded average of those adjusted scores. A missing pillar is left out. It is not treated as zero.";

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
  sector?: string | null;
  industry?: string | null;
  statementDate?: string | null;
};

export type ScoreResult = {
  score: number | null;
  band: string | null;
  pillars: Pillar[];
  reasons: string[];
  methodologyVersion: MethodologyVersion;
  industryGroup: IndustryGroup;
  statementDate: string | null;
};

const INDUSTRY_OMITTED: Record<Exclude<IndustryGroup, "general">, Partial<Record<PillarLabel, string>>> = {
  bank: {
    Quality:
      "Quality is not scored for banks. Net profit margin is not comparable for a bank, and return on equity was not in the returned data.",
    "Financial Health":
      "Financial Health is not scored for banks. The current ratio and debt-to-equity are not used, and capital ratios were not in the returned data.",
  },
  insurance: {
    Quality:
      "Quality is not scored for insurers. Net profit margin is not used, and underwriting results were not in the returned data.",
    "Financial Health":
      "Financial Health is not scored for insurers. The current ratio and debt-to-equity are not used, and insurance capital measures were not in the returned data.",
  },
  reit: {
    Value:
      "Value is not scored for real estate investment trusts. Annual price-to-earnings is not used, and funds from operations were not in the returned data.",
    Quality: "Quality is not scored for real estate investment trusts. Net profit margin is not used.",
    "Financial Health":
      "Financial Health is not scored for real estate investment trusts. The current ratio and debt-to-equity are not used.",
  },
};

export function industryGroupFor(sector?: string | null, industry?: string | null): IndustryGroup {
  const industryText = (industry ?? "").toLowerCase();
  const text = `${sector ?? ""} ${industry ?? ""}`.toLowerCase();
  if (/\breit\b|real estate investment trust/.test(text)) return "reit";
  if (industryText.includes("insurance")) return "insurance";
  if (/\bbanks?\b|\bbanking\b|\bthrifts?\b/.test(industryText)) return "bank";
  return "general";
}

export function industryGroupLabel(group: IndustryGroup) {
  if (group === "bank") return "bank";
  if (group === "insurance") return "insurer";
  if (group === "reit") return "real estate investment trust";
  return "operating company";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value: number) {
  return Math.round(clamp(value, 0, 100));
}

function median(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

export function headlineScore(values: Array<number | null | undefined>) {
  const available = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (available.length === 0) return null;
  if (available.length === 1) return roundScore(available[0]);
  const middle = median(available);
  const adjusted = available.map((score) => score + 0.15 * (middle - score));
  return roundScore(adjusted.reduce((sum, score) => sum + score, 0) / adjusted.length);
}

export function bandFor(score: number) {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Solid";
  if (score >= 60) return "Mixed";
  return "Weak";
}

export function scoreTextClass(score: number) {
  if (score >= 90) return "text-accent-2";
  if (score >= 80) return "text-[#9adf6a]";
  if (score >= 70) return "text-accent";
  if (score >= 60) return "text-[#e2c15a]";
  return "text-[#c47b3a]";
}

export function scoreFillClass(score: number | null) {
  if (score == null) return "bg-white/15";
  if (score >= 90) return "bg-accent-2";
  if (score >= 80) return "bg-[#9adf6a]";
  if (score >= 70) return "bg-accent";
  if (score >= 60) return "bg-[#e2c15a]";
  return "bg-[#c47b3a]";
}

function percent(value: number, digits = 1) {
  const scaled = value * 100;
  const sign = scaled > 0 ? "+" : "";
  return `${sign}${scaled.toFixed(digits)}%`;
}

function number(value: number, digits = 1) {
  return value.toFixed(digits);
}

function valueWhy(score: number, pe: number) {
  if (pe <= 0) {
    return `Earnings are negative, so the multiple of ${number(pe)} cannot support a high value reading. It stays at ${score}.`;
  }
  if (score >= 75) {
    return `At ${number(pe)} times earnings, the price still leaves room. Value is a support at ${score}, not the constraint.`;
  }
  if (score >= 50) {
    return `Paying ${number(pe)} times earnings is a middle reading. Value neither rescues the score nor sinks it, and lands at ${score}.`;
  }
  return `The market is paying ${number(pe)} times earnings. That is the expensive part of the profile, and it holds value down at ${score}.`;
}

function valueScore(pe: number | null): Pillar {
  if (pe == null || !Number.isFinite(pe)) {
    return { label: "Value", score: null, note: "Annual price-to-earnings was not returned.", why: null };
  }
  if (pe <= 0) {
    const score = 12;
    return {
      label: "Value",
      score,
      note: `Annual price-to-earnings is ${number(pe)}. A negative multiple keeps value low.`,
      why: valueWhy(score, pe),
    };
  }
  const score = roundScore(100 - (pe - 8) * 1.6);
  return {
    label: "Value",
    score,
    note: `Annual price-to-earnings is ${number(pe)}. A lower multiple scores higher.`,
    why: valueWhy(score, pe),
  };
}

function growthWhy(score: number, growth: number) {
  const pace = percent(growth);
  if (growth < 0) {
    return `Sales moved the wrong way, ${pace} from last year. That decline is why growth is only ${score}.`;
  }
  if (score >= 90) {
    return `Sales accelerated ${pace} from a year ago, fast enough to push growth to ${score}.`;
  }
  return `The top line grew ${pace} versus last year. That pace is respectable, and growth comes out at ${score}.`;
}

function growthScore(growth: number | null): Pillar {
  if (growth == null || !Number.isFinite(growth)) {
    return { label: "Growth", score: null, note: "Year-over-year revenue growth was not returned.", why: null };
  }
  const score = roundScore(50 + growth * 80);
  return {
    label: "Growth",
    score,
    note: `Revenue growth is ${percent(growth)} year over year.`,
    why: growthWhy(score, growth),
  };
}

function qualityWhy(score: number, margin: number) {
  const kept = percent(margin, 1).replace("+", "");
  if (margin < 0) {
    return `The business lost ${kept.replace("-", "")} of revenue. Profitability is the weak point, so quality is ${score}.`;
  }
  if (score >= 85) {
    return `Roughly ${kept} of revenue is retained as profit. That is a wide margin, and quality reflects it at ${score}.`;
  }
  return `Profit takes ${kept} of revenue. Quality treats that as a ${score}, solid without being exceptional.`;
}

function qualityScore(margin: number | null): Pillar {
  if (margin == null || !Number.isFinite(margin)) {
    return { label: "Quality", score: null, note: "Annual net profit margin was not returned.", why: null };
  }
  const score = roundScore(35 + margin * 140);
  return {
    label: "Quality",
    score,
    note: `Annual net profit margin is ${percent(margin, 1).replace("+", "")}.`,
    why: qualityWhy(score, margin),
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
      why: null,
    };
  }
  const score = Math.round(parts.reduce((sum, value) => sum + value, 0) / parts.length);
  const coverage =
    currentRatio != null && Number.isFinite(currentRatio)
      ? `short-term assets cover liabilities ${number(currentRatio, 2)} times`
      : null;
  const leverage =
    debtToEquity != null && Number.isFinite(debtToEquity)
      ? `debt is ${number(debtToEquity, 2)} times equity`
      : null;
  const picture = [coverage, leverage].filter(Boolean).join(", and ");
  return {
    label: "Financial Health",
    score,
    note: `Latest annual ${bits.join(" and ")}.`,
    why: `The balance sheet reads as follows: ${picture}. Financial health scores ${score} on that mix.`,
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
    const score = roundScore(position * 100);
    const place = Math.round(position * 100);
    const why =
      place >= 70
        ? `The shares are ${place}% of the way up the 52-week span, close to the high. Momentum agrees with that strength at ${score}.`
        : place <= 35
          ? `Most of the past year's range has been given back. The price sits ${place}% of the way up from the low, so momentum is the soft spot at ${score}.`
          : `The price is mid-range for the year, ${place}% of the way from low to high. Momentum is neutral at ${score}.`;
    return {
      label: "Momentum",
      score,
      note: `The price is ${place}% of the way from the 52-week low to the high.`,
      why,
    };
  }

  const earlier = history.length >= 40 ? history[Math.max(0, history.length - 127)] : undefined;
  if (earlier && earlier.price > 0) {
    const change = price / earlier.price - 1;
    const score = roundScore(50 + change * 120);
    return {
      label: "Momentum",
      score,
      note: `The price is ${percent(change)} versus the close on ${earlier.date}.`,
      why: `Compared with the ${earlier.date} close, the shares are ${percent(change)}. That stretch of the chart is what sets momentum at ${score}.`,
    };
  }

  return { label: "Momentum", score: null, note: "A 52-week range was not returned.", why: null };
}

export function scoreSnapshot(input: ScoreInput): ScoreResult {
  const industryGroup = industryGroupFor(input.sector, input.industry);
  const omissions = industryGroup === "general" ? {} : INDUSTRY_OMITTED[industryGroup];
  const pillars = [
    valueScore(input.pe),
    growthScore(input.revenueGrowth),
    qualityScore(input.netMargin),
    healthScore(input.currentRatio, input.debtToEquity),
    momentumScore(input),
  ].map((pillar) => {
    const note = omissions[pillar.label];
    if (!note) return pillar;
    return { label: pillar.label, score: null, note, why: null, omitted: true };
  });
  const scored = pillars.filter((pillar): pillar is Pillar & { score: number } => pillar.score != null);
  if (scored.length === 0) {
    return {
      score: null,
      band: null,
      pillars,
      reasons: ["The inputs used for a score were not returned."],
      methodologyVersion: "3",
      industryGroup,
      statementDate: input.statementDate ?? null,
    };
  }

  const score = headlineScore(scored.map((pillar) => pillar.score));
  if (score == null) {
    return {
      score: null,
      band: null,
      pillars,
      reasons: ["The inputs used for a score were not returned."],
      methodologyVersion: "3",
      industryGroup,
      statementDate: input.statementDate ?? null,
    };
  }
  const band = bandFor(score);
  const strongest = [...scored].sort((left, right) => right.score - left.score)[0];
  const softest = [...scored].sort((left, right) => left.score - right.score)[0];
  const closing =
    strongest.label === softest.label
      ? `The pillars sit close together. The AssetScore is ${score}, which is the ${band} band.`
      : `${strongest.label} carries the result at ${strongest.score}. ${softest.label} is the drag at ${softest.score}. The AssetScore is ${score}, ${band}.`;
  return {
    score,
    band,
    pillars,
    reasons: [...scored.flatMap((pillar) => (pillar.why ? [pillar.why] : [])), closing],
    methodologyVersion: "3",
    industryGroup,
    statementDate: input.statementDate ?? null,
  };
}
