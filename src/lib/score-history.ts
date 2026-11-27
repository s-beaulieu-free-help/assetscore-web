import { readFileSync } from "node:fs";
import path from "node:path";
import type { IndustryGroup, MethodologyVersion } from "@/lib/score";
import { supabaseEnv } from "@/lib/supabase/env";

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

function asGroup(value: string): IndustryGroup | null {
  if (value === "bank" || value === "insurance" || value === "reit" || value === "general") return value;
  return null;
}

function asVersion(value: string): MethodologyVersion | null {
  if (value === "1" || value === "2") return value;
  return null;
}

async function historyFromDatabase(symbol: string): Promise<ScoreObservation[] | null> {
  const env = supabaseEnv();
  if (!env) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const url = new URL(`${env.url}/rest/v1/score_snapshots`);
    url.searchParams.set("select", "symbol,as_of,methodology_version,company_name,industry_group,score,value_score,growth_score,quality_score,health_score,momentum_score");
    url.searchParams.set("symbol", `eq.${symbol}`);
    url.searchParams.set("order", "as_of.asc");
    const response = await fetch(url, {
      headers: { apikey: env.key, Authorization: `Bearer ${env.key}` },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(rows)) return null;
    return rows.flatMap((row) => {
      const version = asVersion(String(row.methodology_version ?? ""));
      const industryGroup = asGroup(String(row.industry_group ?? ""));
      const score = Number(row.score);
      if (!version || !industryGroup || !Number.isFinite(score)) return [];
      const numberOrNull = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);
      return [{
        symbol: String(row.symbol ?? symbol),
        name: typeof row.company_name === "string" ? row.company_name : symbol,
        asOf: String(row.as_of ?? ""),
        methodologyVersion: version,
        industryGroup,
        score,
        value: numberOrNull(row.value_score),
        growth: numberOrNull(row.growth_score),
        quality: numberOrNull(row.quality_score),
        health: numberOrNull(row.health_score),
        momentum: numberOrNull(row.momentum_score),
      }];
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function historyForSymbolResolved(symbol: string) {
  const local = historyForSymbol(symbol);
  const remote = await historyFromDatabase(symbol);
  if (!remote || remote.length === 0) return local;
  const merged = new Map<string, ScoreObservation>();
  for (const row of local) merged.set(`${row.asOf}|${row.methodologyVersion}`, row);
  for (const row of remote) merged.set(`${row.asOf}|${row.methodologyVersion}`, row);
  return [...merged.values()].sort(
    (left, right) => left.asOf.localeCompare(right.asOf) || left.methodologyVersion.localeCompare(right.methodologyVersion),
  );
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
