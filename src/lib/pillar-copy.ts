import type { PillarLabel } from "@/lib/score";

export const PILLAR_COPY: Record<
  PillarLabel,
  { measures: string; matters: string; indicators: string; high: string; low: string; watch: string }
> = {
  Value: {
    measures: "Value measures how expensive the shares are compared with annual earnings.",
    matters: "A cheaper multiple leaves more of the score for the business itself. An expensive multiple pulls the score down even when the business is strong.",
    indicators: "The indicator is the annual price-to-earnings ratio. A lower multiple scores higher. Negative earnings keep Value low.",
    high: "A high Value score means the annual multiple is modest.",
    low: "A low Value score means the annual multiple is high, or earnings are negative.",
    watch: "Watch the annual price-to-earnings ratio.",
  },
  Growth: {
    measures: "Growth measures how revenue changed from the prior year.",
    matters: "Faster sales growth supports the score. A drop in sales lowers it.",
    indicators: "The indicator is year-over-year revenue growth from the latest annual comparison.",
    high: "A high Growth score means sales rose quickly versus last year.",
    low: "A low Growth score means sales grew slowly or declined.",
    watch: "Watch year-over-year revenue growth.",
  },
  Quality: {
    measures: "Quality measures profitability.",
    matters: "A company that keeps more of each sales dollar as profit scores higher.",
    indicators: "The indicator is the annual net profit margin.",
    high: "A high Quality score means a wide profit margin.",
    low: "A low Quality score means a thin margin, or a loss.",
    watch: "Watch the annual net profit margin.",
  },
  "Financial Health": {
    measures: "Financial Health measures the balance sheet.",
    matters: "Cash that covers near-term bills, and less debt relative to equity, support the score.",
    indicators: "The indicators are the annual current ratio and debt compared with equity. If only one is returned, that one is used.",
    high: "A high Financial Health score means stronger coverage of short-term bills, less debt relative to equity, or both.",
    low: "A low Financial Health score means tighter liquidity, heavier debt, or both.",
    watch: "Watch the annual current ratio and debt compared with equity.",
  },
  Momentum: {
    measures: "Momentum measures the share price, not the financial statements.",
    matters: "It shows whether the latest price is near the high or the low of the past year.",
    indicators:
      "The indicator is the latest price compared with the 52-week low and high. If that range is missing, and enough price history exists, the score uses the change versus an earlier close.",
    high: "A high Momentum score means the price is close to the 52-week high.",
    low: "A low Momentum score means the price is close to the 52-week low.",
    watch: "Watch where the price sits between the 52-week low and high.",
  },
};
