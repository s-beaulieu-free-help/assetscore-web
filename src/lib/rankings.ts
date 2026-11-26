import { loadScreenerDataset, SCREENER_INDEXES, type ScreenerIndexId, type ScreenerRow } from "@/lib/screener";

export const RANKING_PAGES = [
  {
    slug: "sp500",
    indexId: "sp500" as const,
    name: "S&P 500",
    title: "Best-rated S&P 500 stocks",
    description:
      "S&P 500 stocks ranked by AssetScore. Scores use the daily published dataset for value, growth, quality, financial health, and momentum.",
  },
  {
    slug: "nasdaq100",
    indexId: "nasdaq100" as const,
    name: "Nasdaq 100",
    title: "Top Nasdaq 100 stocks",
    description:
      "Nasdaq 100 stocks ranked by AssetScore from the same daily scoring run as the stock pages and the Stock Screener.",
  },
  {
    slug: "dow-jones",
    indexId: "dow" as const,
    name: "Dow Jones",
    title: "Dow Jones stock rankings",
    description:
      "Dow Jones stocks ranked by AssetScore. Each score links to that company's stock analysis.",
  },
] as const;

export type RankingSlug = (typeof RANKING_PAGES)[number]["slug"];

export function rankingPage(slug: string) {
  return RANKING_PAGES.find((page) => page.slug === slug) ?? null;
}

export function rankedIndex(indexId: ScreenerIndexId) {
  const dataset = loadScreenerDataset();
  const rows = dataset.rows
    .filter((row) => row.indexes.includes(indexId))
    .sort((left, right) => right.score - left.score || left.symbol.localeCompare(right.symbol));
  return { publishedAt: dataset.publishedAt, rows };
}

export function rankingSymbols() {
  const symbols = new Set<string>();
  for (const index of SCREENER_INDEXES) {
    for (const row of rankedIndex(index.id).rows) symbols.add(row.symbol);
  }
  return [...symbols].sort();
}

export function indexName(id: ScreenerIndexId) {
  return SCREENER_INDEXES.find((index) => index.id === id)?.name ?? id;
}

export type RankedRow = ScreenerRow;
