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
