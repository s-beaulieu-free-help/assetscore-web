import { rankedIndex, type RankedRow } from "@/lib/rankings";
import type { ScreenerIndexId } from "@/lib/screener";

export type TopicPillar = "value" | "growth" | "quality" | "health";

export type TopicPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  indexId: ScreenerIndexId;
  pillar: TopicPillar;
  pillarLabel: string;
  intro: string;
  article: { href: string; label: string };
  rankingHref: string;
};

export const TOPIC_PAGES: TopicPage[] = [
  {
    slug: "sp500-quality",
    title: "Highest quality S&P 500 stocks",
    description:
      "S&P 500 companies with the highest AssetScore Quality reading, based on annual net profit margin. Each row links to that company's stock analysis.",
    h1: "Highest quality S&P 500 stocks",
    indexId: "sp500",
    pillar: "quality",
    pillarLabel: "Quality",
    intro:
      "Quality is the annual net profit margin for an operating company. This page lists S&P 500 names from the daily published dataset with the highest Quality scores. A wide margin is one pillar. The full S&P 500 ranking orders companies by the overall AssetScore.",
    article: { href: "/learn/profit-margin-and-quality", label: "How profit margin becomes Quality" },
    rankingHref: "/rankings/sp500",
  },
  {
    slug: "sp500-value",
    title: "S&P 500 stocks ranked by valuation",
    description:
      "S&P 500 companies with the strongest AssetScore Value reading, from the annual price-to-earnings ratio. Research from the daily published dataset.",
    h1: "S&P 500 stocks by valuation",
    indexId: "sp500",
    pillar: "value",
    pillarLabel: "Value",
    intro:
      "Value uses the annual price-to-earnings ratio. A lower positive multiple scores higher. These S&P 500 companies have the highest Value scores in the daily dataset. The overall ranking uses the same AssetScore as the stock page: available pillar scores are moved slightly toward their middle, then averaged.",
    article: { href: "/learn/price-to-earnings-ratio", label: "How the price-to-earnings ratio is scored" },
    rankingHref: "/rankings/sp500",
  },
  {
    slug: "sp500-growth",
    title: "S&P 500 stocks ranked by revenue growth",
    description:
      "S&P 500 companies with the highest AssetScore Growth reading, from year-over-year revenue growth in the daily published dataset.",
    h1: "S&P 500 stocks by revenue growth",
    indexId: "sp500",
    pillar: "growth",
    pillarLabel: "Growth",
    intro:
      "Growth is year-over-year revenue growth from the latest annual comparison. This list shows S&P 500 companies with the highest Growth scores. Faster sales growth raises that pillar. It does not by itself set the headline AssetScore.",
    article: { href: "/learn/revenue-growth", label: "How revenue growth is scored" },
    rankingHref: "/rankings/sp500",
  },
  {
    slug: "sp500-financial-health",
    title: "S&P 500 stocks ranked by financial health",
    description:
      "S&P 500 companies with the highest AssetScore Financial Health reading, from the annual current ratio and debt compared with equity.",
    h1: "S&P 500 stocks by financial health",
    indexId: "sp500",
    pillar: "health",
    pillarLabel: "Financial Health",
    intro:
      "Financial Health combines the annual current ratio and debt compared with equity when those figures exist. These S&P 500 companies have the highest Financial Health scores in the daily dataset. Banks, insurers, and real estate investment trusts leave this pillar out.",
    article: { href: "/learn/current-ratio-and-debt", label: "Current ratio, debt, and financial health" },
    rankingHref: "/rankings/sp500",
  },
];

export function topicPage(slug: string) {
  return TOPIC_PAGES.find((topic) => topic.slug === slug) ?? null;
}

export function topicRows(topic: TopicPage, limit = 15): { publishedAt: string | null; rows: RankedRow[] } {
  const { publishedAt, rows } = rankedIndex(topic.indexId);
  const ranked = rows
    .filter((row) => row[topic.pillar] != null)
    .sort((left, right) => (right[topic.pillar] ?? 0) - (left[topic.pillar] ?? 0) || right.score - left.score || left.symbol.localeCompare(right.symbol))
    .slice(0, limit);
  return { publishedAt, rows: ranked };
}
