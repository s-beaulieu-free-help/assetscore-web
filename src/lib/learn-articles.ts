export type LearnArticle = {
  slug: string;
  title: string;
  description: string;
  kicker: string;
  paragraphs: string[];
  related: Array<{ href: string; label: string }>;
};

export const LEARN_ARTICLES: LearnArticle[] = [
  {
    slug: "price-to-earnings-ratio",
    title: "Price-to-earnings ratio and stock valuation",
    description:
      "How AssetScore turns the annual price-to-earnings ratio into the Value pillar, and what a high or low multiple means on a stock page.",
    kicker: "Valuation",
    paragraphs: [
      "The price-to-earnings ratio is the share price divided by annual earnings. AssetScore uses the annual ratio returned for the latest statement period. A lower positive multiple scores higher on Value. Negative earnings keep Value low, because the multiple cannot support a high valuation reading.",
      "Value is one equal pillar in the headline AssetScore when it has data. A cheap multiple can lift the average, and an expensive multiple can pull it down, even when growth or profitability is strong. The ratio does not include dividends, and it is not a forecast of the share price.",
      "Banks and insurers use this annual ratio. Real estate investment trusts do not, because funds from operations were not in the returned data. On those pages Value is left out of the average. It is not replaced with zero.",
    ],
    related: [
      { href: "/methodology", label: "Full methodology" },
      { href: "/topics/sp500-value", label: "S&P 500 stocks by Value" },
      { href: "/rankings/sp500", label: "S&P 500 ranking" },
    ],
  },
  {
    slug: "revenue-growth",
    title: "How revenue growth is scored",
    description:
      "AssetScore Growth uses year-over-year revenue growth from the latest annual comparison. Faster sales growth scores higher.",
    kicker: "Growth",
    paragraphs: [
      "Growth measures how revenue changed from the prior year. The input is year-over-year revenue growth from the latest annual comparison. Faster growth scores higher. A decline scores lower.",
      "Growth has the same weight as every other pillar that has data. A company can rank well on growth and still score lower overall if the shares are expensive, the margin is thin, or the price is near the 52-week low.",
      "The figure describes a past reporting period. It does not say whether next year's sales will rise. Read it next to Quality and Value before treating the headline score as a single story.",
    ],
    related: [
      { href: "/methodology", label: "Full methodology" },
      { href: "/topics/sp500-growth", label: "S&P 500 stocks by Growth" },
      { href: "/learn/profit-margin-and-quality", label: "Profit margin and quality" },
    ],
  },
  {
    slug: "profit-margin-and-quality",
    title: "Profit margin and company quality",
    description:
      "How AssetScore measures company quality from the annual net profit margin, and why a wide margin is only one pillar of the score.",
    kicker: "Quality",
    paragraphs: [
      "Quality on an operating company is the annual net profit margin: the share of revenue kept as profit. A wider margin scores higher. A loss scores lower.",
      "A high Quality score means the latest annual margin is wide. It does not mean every other part of the business is strong. Value, Growth, Financial Health, and Momentum still count equally when they have data.",
      "Banks, insurers, and real estate investment trusts do not use net profit margin, because that ratio does not describe those businesses in the data AssetScore stores. Quality is omitted for them and left out of the average.",
    ],
    related: [
      { href: "/methodology", label: "Full methodology" },
      { href: "/topics/sp500-quality", label: "Highest quality S&P 500 stocks" },
      { href: "/rankings/sp500", label: "Best quality S&P 500 ranking" },
    ],
  },
  {
    slug: "current-ratio-and-debt",
    title: "Current ratio, debt, and financial health",
    description:
      "Financial Health combines the annual current ratio and debt compared with equity. See how each figure moves the pillar.",
    kicker: "Financial health",
    paragraphs: [
      "Financial Health looks at the balance sheet. The annual current ratio asks how comfortably short-term assets cover short-term bills. Debt compared with equity asks how much debt the company carries relative to equity.",
      "A higher current ratio raises that part of the score. More debt relative to equity lowers the other part. When both figures exist, the pillar is their average. When only one exists, that one is the pillar.",
      "Banks and insurers do not use these two ratios. Real estate investment trusts do not either. The omitted pillar is excluded from the headline score. Capital ratios, underwriting results, and funds from operations are not in the stored data.",
    ],
    related: [
      { href: "/methodology", label: "Full methodology" },
      { href: "/topics/sp500-financial-health", label: "S&P 500 stocks by Financial Health" },
      { href: "/coverage", label: "What AssetScore covers" },
    ],
  },
  {
    slug: "reading-the-assetscore",
    title: "How to read an AssetScore",
    description:
      "The headline AssetScore is the rounded average of the pillars that have data. Each included pillar has equal weight.",
    kicker: "The score",
    paragraphs: [
      "Five pillars can be scored from 0 to 100: Value, Growth, Quality, Financial Health, and Momentum. The headline number is the rounded average of the pillars that have data. Each included pillar has equal weight. A missing pillar is left out. It is not scored as zero.",
      "Bands group that average: 90–100 Exceptional, 80–89 Strong, 70–79 Solid, 60–69 Mixed, and 0–59 Weak. A Strong score can still hide a weak pillar. The stock page names the strongest and softest readings for that company.",
      "Momentum uses the latest price between the 52-week low and high. The other pillars use the latest annual figures. Those periods can differ. The result describes the latest inputs. It is not a prediction and it is not investment advice.",
    ],
    related: [
      { href: "/methodology", label: "Full methodology" },
      { href: "/rankings/sp500", label: "S&P 500 ranking" },
      { href: "/reports", label: "Sample reports" },
    ],
  },
];

export function learnArticle(slug: string) {
  return LEARN_ARTICLES.find((article) => article.slug === slug) ?? null;
}
