export type WeightedScore = {
  score: number | null;
  incomplete: boolean;
  reason: string | null;
};

export function allocationUnits(allocation: number) {
  return Math.round(allocation * 10000);
}

export function allocationTotal(allocations: number[]) {
  return allocations.reduce((sum, allocation) => sum + allocationUnits(allocation), 0) / 10000;
}

export function weightedPortfolioScore(rows: { score: number | null; allocation: number }[]): WeightedScore {
  if (rows.length === 0) {
    return {
      score: null,
      incomplete: true,
      reason: "Add at least one stock to calculate a portfolio score.",
    };
  }
  if (rows.some((row) => row.score == null)) {
    return {
      score: null,
      incomplete: true,
      reason: "The portfolio score is incomplete because one or more stock scores are unavailable.",
    };
  }
  const totalUnits = rows.reduce((sum, row) => sum + allocationUnits(row.allocation), 0);
  if (totalUnits !== 1_000_000) {
    return {
      score: null,
      incomplete: true,
      reason: "The portfolio score is incomplete until the allocations total 100%.",
    };
  }
  const raw = rows.reduce((sum, row) => sum + (row.score as number) * row.allocation, 0) / 100;
  return { score: Math.round(raw), incomplete: false, reason: null };
}

export type PortfolioHolding = {
  ticker: string;
  allocation: number;
  score: number | null;
  pillars: { label: string; score: number | null }[];
};

const PILLAR_LABELS = ["Value", "Growth", "Quality", "Financial Health", "Momentum"];

export function portfolioObservations(holdings: PortfolioHolding[]) {
  const scored = holdings.filter((holding): holding is PortfolioHolding & { score: number } => holding.score != null);
  const strongest = [...scored].sort((left, right) => right.score - left.score || left.ticker.localeCompare(right.ticker))[0] ?? null;
  const weakest = [...scored].sort((left, right) => left.score - right.score || left.ticker.localeCompare(right.ticker))[0] ?? null;
  const largest = [...holdings].sort((left, right) => right.allocation - left.allocation || left.ticker.localeCompare(right.ticker))[0] ?? null;
  const averages = PILLAR_LABELS.map((label) => {
    const rows = holdings.flatMap((holding) => {
      const pillar = holding.pillars.find((item) => item.label === label && item.score != null);
      return pillar ? [{ allocation: holding.allocation, score: pillar.score as number }] : [];
    });
    if (rows.length === 0) return { label, score: null as number | null };
    const weight = rows.reduce((sum, row) => sum + row.allocation, 0);
    if (weight <= 0) return { label, score: null as number | null };
    return { label, score: Math.round(rows.reduce((sum, row) => sum + row.score * row.allocation, 0) / weight) };
  });
  const notes: string[] = [];
  if (largest && largest.allocation >= 40) {
    notes.push(`${largest.ticker} is ${largest.allocation.toFixed(0)}% of the portfolio, so its score moves the average more than a smaller holding.`);
  }
  if (strongest && weakest && strongest.ticker !== weakest.ticker) {
    notes.push(`${strongest.ticker} has the highest AssetScore at ${strongest.score}. ${weakest.ticker} has the lowest at ${weakest.score}.`);
  }
  const softest = [...averages].filter((item) => item.score != null).sort((left, right) => (left.score ?? 0) - (right.score ?? 0))[0];
  if (softest?.score != null && softest.score < 60) {
    notes.push(`The allocation-weighted ${softest.label} average is ${softest.score}, the softest pillar in this mix.`);
  }
  return { averages, strongest, weakest, largest, notes };
}
