import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { ScoreObservation } from "../src/lib/score-history";

type Published = {
  publishedAt?: string;
  universe?: Array<{
    symbol?: string;
    name?: string;
    score?: number;
    value?: number | null;
    growth?: number | null;
    quality?: number | null;
    health?: number | null;
    momentum?: number | null;
  }>;
};

const historyPath = path.join(process.cwd(), "src", "data", "score-history.json");

function finiteScore(value: number | null | undefined) {
  return value != null && Number.isFinite(value) ? Math.round(value) : null;
}

async function main() {
  const published = JSON.parse(readFileSync(path.join(process.cwd(), "src", "data", "top-rated.json"), "utf8")) as Published;
  const publishedAt = Date.parse(published.publishedAt ?? "");
  if (!Number.isFinite(publishedAt)) throw new Error("The published dataset has no timestamp.");
  const asOf = new Date(publishedAt).toISOString().slice(0, 10);
  let existing: ScoreObservation[] = [];
  try {
    existing = (JSON.parse(readFileSync(historyPath, "utf8")) as { observations?: ScoreObservation[] }).observations ?? [];
  } catch {
    existing = [];
  }
  const seen = new Set(existing.map((row) => `${row.symbol}|${row.asOf}|${row.methodologyVersion}`));
  const added: ScoreObservation[] = [];
  for (const row of published.universe ?? []) {
    if (!row.symbol || row.score == null || !Number.isFinite(row.score)) continue;
    const observation: ScoreObservation = {
      symbol: row.symbol,
      name: row.name?.trim() || row.symbol,
      asOf,
      methodologyVersion: "1",
      industryGroup: "general",
      score: Math.round(row.score),
      value: finiteScore(row.value),
      growth: finiteScore(row.growth),
      quality: finiteScore(row.quality),
      health: finiteScore(row.health),
      momentum: finiteScore(row.momentum),
    };
    const key = `${observation.symbol}|${observation.asOf}|${observation.methodologyVersion}`;
    if (seen.has(key)) continue;
    seen.add(key);
    added.push(observation);
  }
  const observations = [...existing, ...added].sort(
    (left, right) => left.asOf.localeCompare(right.asOf) || left.symbol.localeCompare(right.symbol),
  );
  await writeFile(historyPath, `${JSON.stringify({ observations }, null, 2)}\n`);
  console.log(`Recorded ${added.length} methodology 1 observations for ${asOf}. Total ${observations.length}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "History record failed.");
  process.exit(1);
});
