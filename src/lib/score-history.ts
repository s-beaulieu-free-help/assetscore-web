import { readFileSync } from "node:fs";
import path from "node:path";
import type { IndustryGroup, MethodologyVersion } from "@/lib/score";

export type ScoreObservation = {
  symbol: string;
  name: string;
  asOf: string;
  methodologyVersion: MethodologyVersion;
  industryGroup: IndustryGroup;
  score: number;
  value: number | null;
  growth: number | null;
  quality: number | null;
  health: number | null;
  momentum: number | null;
};

type HistoryFile = { observations?: ScoreObservation[] };

const historyPath = path.join(process.cwd(), "src", "data", "score-history.json");
let cached: ScoreObservation[] | null = null;

export function loadScoreHistory() {
  if (cached) return cached;
  try {
    const parsed = JSON.parse(readFileSync(historyPath, "utf8")) as HistoryFile;
    cached = Array.isArray(parsed.observations) ? parsed.observations : [];
  } catch {
    cached = [];
  }
  return cached;
}

export function historyForSymbol(symbol: string) {
  return loadScoreHistory()
    .filter((row) => row.symbol === symbol)
    .sort((left, right) => left.asOf.localeCompare(right.asOf) || left.methodologyVersion.localeCompare(right.methodologyVersion));
}

export function sameMethodologyChange(rows: ScoreObservation[]) {
  const versions = [...new Set(rows.map((row) => row.methodologyVersion))];
  return versions.map((version) => {
    const series = rows.filter((row) => row.methodologyVersion === version);
    if (series.length < 2) return { version, from: series[0] ?? null, to: series[series.length - 1] ?? null, change: null as number | null };
    const from = series[0];
    const to = series[series.length - 1];
    return { version, from, to, change: to.score - from.score };
  });
}
