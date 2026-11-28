import { HEADLINE_SCORE_SUMMARY } from "@/lib/score";
import { loadScreenerDataset, SCREENER_INDEXES, type ScreenerIndexId, type ScreenerRow } from "@/lib/screener";

export const RANKING_PAGES = [
  {
    slug: "sp500",
    indexId: "sp500" as const,
    marketAnchor: "sp500",
    name: "S&P 500",
    title: "Best quality S&P 500 stocks",
    description:
      "S&P 500 companies ranked by AssetScore quality: value, growth, profitability, financial health, and momentum from the daily published dataset. Each row links to that stock analysis.",
    lead:
      `This is the public ranking of S&P 500 companies by AssetScore. ${HEADLINE_SCORE_SUMMARY} Quality uses the annual net profit margin for an operating company. A higher rank describes stronger latest figures. It is not a forecast and it is not a recommendation to buy or sell.`,
  },
  {
    slug: "nasdaq100",
    indexId: "nasdaq100" as const,
    marketAnchor: "nasdaq",
    name: "Nasdaq 100",
    title: "Best quality Nasdaq 100 stocks",
    description:
      "Nasdaq 100 stocks ranked by AssetScore from the same daily published dataset as the S&P 500 ranking and the stock pages.",
    lead:
      "Nasdaq 100 companies in the daily published universe, ordered by AssetScore. The score uses the same pillars as each stock page. This list describes the latest figures. It is not a forecast and it is not a recommendation to buy or sell.",
  },
  {
    slug: "dow-jones",
    indexId: "dow" as const,
    marketAnchor: "dow",
    name: "Dow Jones",
    title: "Best quality Dow Jones stocks",
    description:
      "Dow Jones stocks ranked by AssetScore. Each company links to its stock analysis, methodology, and the ratios behind the score.",
    lead:
      `Dow Jones companies in the daily published universe, ordered by AssetScore. ${HEADLINE_SCORE_SUMMARY} This list is not a forecast and it is not a recommendation to buy or sell.`,
  },
] as const;

export const RANKING_FAQS: Record<RankingSlug, Array<{ question: string; answer: string }>> = {
  sp500: [
    {
      question: "How are the best quality S&P 500 stocks ranked?",
      answer:
        `Companies in the published S&P 500 universe are ordered by AssetScore. ${HEADLINE_SCORE_SUMMARY} Quality is the annual net profit margin for an operating company.`,
    },
    {
      question: "Does a high AssetScore mean the stock will rise?",
      answer:
        "No. The score describes the latest annual figures and the price position in the 52-week range. It is research, not a forecast and not a recommendation to buy or sell.",
    },
    {
      question: "How often does the S&P 500 ranking update?",
      answer:
        "The ranking uses the daily published dataset. The page shows the date of that dataset. A live stock page can show a newer quote than the published ranking.",
    },
  ],
  nasdaq100: [
    {
      question: "How are Nasdaq 100 stocks ranked?",
      answer:
        `Nasdaq 100 companies in the daily published dataset are ordered by the same AssetScore used on stock pages. ${HEADLINE_SCORE_SUMMARY}`,
    },
    {
      question: "Is this the same score as the S&P 500 ranking?",
      answer:
        "Yes. A company that is in both indexes uses the same published score. The lists differ because the membership differs.",
    },
  ],
  "dow-jones": [
    {
      question: "How are Dow Jones stocks ranked?",
      answer:
        "Dow Jones companies in the daily published dataset are ordered by AssetScore. Each row links to that company's stock page.",
    },
    {
      question: "Does a high rank mean the shares are undervalued?",
      answer:
        "No. Value is one pillar, based on the annual price-to-earnings ratio when that pillar applies. The headline rank uses every pillar that has data, after each score is moved slightly toward the middle of that group.",
    },
  ],
};

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

export function ranksForSymbol(symbol: string) {
  const dataset = loadScreenerDataset();
  return RANKING_PAGES.flatMap((page) => {
    const rows = dataset.rows
      .filter((row) => row.indexes.includes(page.indexId))
      .sort((left, right) => right.score - left.score || left.symbol.localeCompare(right.symbol));
    const index = rows.findIndex((row) => row.symbol === symbol);
    if (index < 0) return [];
    return [{ slug: page.slug, name: page.name, rank: index + 1 }];
  });
}

export type RankedRow = ScreenerRow;
