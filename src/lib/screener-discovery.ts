import type { ScreenerRow } from "@/lib/screener";

export const MATRIX_SPLIT = 70;

export type QuadrantId = "hh" | "hl" | "lh" | "ll";

export const QUADRANTS: Array<{ id: QuadrantId; title: string; detail: string }> = [
  { id: "hh", title: "High quality, high momentum", detail: "Quality and Momentum are both 70 or higher." },
  { id: "hl", title: "High quality, low momentum", detail: "Quality is 70 or higher and Momentum is below 70." },
  { id: "lh", title: "Low quality, high momentum", detail: "Quality is below 70 and Momentum is 70 or higher." },
  { id: "ll", title: "Low quality, low momentum", detail: "Quality and Momentum are both below 70." },
];

export type DiscoveryRow = ScreenerRow & { reason: string };

export type DiscoveryCategory = {
  id: string;
  title: string;
  explanation: string;
  available: boolean;
  unavailableReason: string | null;
  rows: DiscoveryRow[];
};

type Observation = {
  symbol: string;
  asOf: string;
  methodologyVersion: string;
  growth: number | null;
  health: number | null;
};

export function quadrantFor(row: Pick<ScreenerRow, "quality" | "momentum">, split = MATRIX_SPLIT): QuadrantId | null {
  if (row.quality == null || row.momentum == null) return null;
  const highQuality = row.quality >= split;
  const highMomentum = row.momentum >= split;
  if (highQuality && highMomentum) return "hh";
  if (highQuality) return "hl";
  if (highMomentum) return "lh";
  return "ll";
}

export function matrixPoints(rows: ScreenerRow[]) {
  const points = rows.flatMap((row) => {
    const quadrant = quadrantFor(row);
    return quadrant ? [{ symbol: row.symbol, name: row.name, quality: row.quality as number, momentum: row.momentum as number, quadrant }] : [];
  });
  const counts = Object.fromEntries(QUADRANTS.map((item) => [item.id, points.filter((point) => point.quadrant === item.id).length])) as Record<QuadrantId, number>;
  return { points, counts, missing: rows.length - points.length };
}

function top(rows: DiscoveryRow[], limit = 8) {
  return rows.slice(0, limit);
}

export function scoreChanges(observations: Observation[]) {
  const groups = new Map<string, Observation[]>();
  for (const row of observations) {
    const key = `${row.symbol}|${row.methodologyVersion}`;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  const changes = new Map<string, { growth: number | null; health: number | null }>();
  for (const [key, list] of groups) {
    const ordered = [...list].sort((left, right) => left.asOf.localeCompare(right.asOf));
    if (ordered.length < 2) continue;
    const previous = ordered[ordered.length - 2];
    const current = ordered[ordered.length - 1];
    const delta = (next: number | null, prior: number | null) => (next == null || prior == null ? null : next - prior);
    changes.set(key.slice(0, key.indexOf("|")), { growth: delta(current.growth, previous.growth), health: delta(current.health, previous.health) });
  }
  return changes;
}

export function discoverStocks(rows: ScreenerRow[], observations: Observation[] = []): DiscoveryCategory[] {
  const changes = scoreChanges(observations);
  const comparable = changes.size > 0;
  const byScore = [...rows].sort((left, right) => right.score - left.score || left.symbol.localeCompare(right.symbol));
  const improving = (field: "growth" | "health") =>
    rows.flatMap((row) => {
      const change = changes.get(row.symbol)?.[field];
      if (change == null || change <= 0) return [];
      return [{ ...row, reason: `${field === "growth" ? "Growth" : "Financial Health"} is ${change} point${change === 1 ? "" : "s"} higher than the previous same-methodology snapshot.` }];
    });

  return [
    {
      id: "highest",
      title: "Highest-rated stocks",
      explanation: "These are the highest overall AssetScores in the published dataset.",
      available: true,
      unavailableReason: null,
      rows: top(byScore.map((row) => ({ ...row, reason: `AssetScore ${row.score}, ${row.band}.` }))),
    },
    {
      id: "improving-growth",
      title: "Improving Growth scores",
      explanation: "Growth is higher than the previous published snapshot that uses the same scoring methodology.",
      available: comparable,
      unavailableReason: comparable ? null : "Only one published snapshot is stored for the current methodology, so a Growth change cannot be calculated.",
      rows: top(improving("growth").sort((left, right) => (changes.get(right.symbol)?.growth ?? 0) - (changes.get(left.symbol)?.growth ?? 0))),
    },
    {
      id: "improving-health",
      title: "Improving Financial Health scores",
      explanation: "Financial Health is higher than the previous published snapshot that uses the same scoring methodology.",
      available: comparable,
      unavailableReason: comparable ? null : "Only one published snapshot is stored for the current methodology, so a Financial Health change cannot be calculated.",
      rows: top(improving("health").sort((left, right) => (changes.get(right.symbol)?.health ?? 0) - (changes.get(left.symbol)?.health ?? 0))),
    },
    {
      id: "profitable",
      title: "Strong profitability",
      explanation: "Quality is at least 80 and the annual net margin is present.",
      available: true,
      unavailableReason: null,
      rows: top(
        rows
          .filter((row) => row.quality != null && row.quality >= 80 && row.netMargin != null)
          .sort((left, right) => (right.quality ?? 0) - (left.quality ?? 0))
          .map((row) => ({ ...row, reason: `Quality ${row.quality}. Annual net margin ${((row.netMargin ?? 0) * 100).toFixed(1)}%.` })),
      ),
    },
    {
      id: "quality-fading-momentum",
      title: "High AssetScore, weaker momentum",
      explanation: "The overall AssetScore is at least 75 and Momentum is below 50.",
      available: true,
      unavailableReason: null,
      rows: top(
        rows
          .filter((row) => row.score >= 75 && row.momentum != null && row.momentum < 50)
          .sort((left, right) => left.momentum! - right.momentum!)
          .map((row) => ({ ...row, reason: `AssetScore ${row.score}. Momentum ${row.momentum}.` })),
      ),
    },
    {
      id: "high-debt",
      title: "Higher debt to equity",
      explanation: "Debt to equity is at least 2 in the published annual figures. This is a screening threshold, not a judgment that the debt is unsuitable.",
      available: true,
      unavailableReason: null,
      rows: top(
        rows
          .filter((row) => row.debtToEquity != null && row.debtToEquity >= 2)
          .sort((left, right) => (right.debtToEquity ?? 0) - (left.debtToEquity ?? 0))
          .map((row) => ({ ...row, reason: `Debt to equity ${(row.debtToEquity ?? 0).toFixed(2)}.` })),
      ),
    },
    {
      id: "improving-earnings",
      title: "Improving earnings growth",
      explanation: "This comparison needs earnings growth in the published dataset.",
      available: false,
      unavailableReason: "Earnings growth is not stored in the daily dataset, so this discovery category is not shown as a result list.",
      rows: [],
    },
    {
      id: "quality-momentum-gap",
      title: "Quality and Momentum differ",
      explanation: "The existing Quality score and Momentum score differ by at least 30 points.",
      available: true,
      unavailableReason: null,
      rows: top(
        rows
          .flatMap((row) => {
            if (row.quality == null || row.momentum == null) return [];
            const gap = Math.abs(row.quality - row.momentum);
            if (gap < 30) return [];
            return [{ ...row, reason: `Quality ${row.quality} and Momentum ${row.momentum} differ by ${gap} points.` }];
          })
          .sort((left, right) => Math.abs((right.quality ?? 0) - (right.momentum ?? 0)) - Math.abs((left.quality ?? 0) - (left.momentum ?? 0))),
      ),
    },
  ];
}
