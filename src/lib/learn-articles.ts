export type LearnArticle = {
  slug: string;
  title: string;
  description: string;
  kicker: string;
  kind: "score" | "finance";
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
    kind: "score",
    paragraphs: [
      "The price-to-earnings ratio is the share price divided by annual earnings. AssetScore uses the annual ratio returned for the latest statement period. A lower positive multiple scores higher on Value. Negative earnings keep Value low, because the multiple cannot support a high valuation reading.",
      "Value is one equal pillar in the headline AssetScore when it has data. A cheap multiple can lift the average, and an expensive multiple can pull it down, even when growth or profitability is strong. The ratio does not include dividends, and it is not a forecast of the share price.",
      "Banks and insurers use this annual ratio. Real estate investment trusts do not, because funds from operations were not in the returned data. On those pages Value is left out of the AssetScore. It is not replaced with zero.",
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
    kind: "score",
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
    kind: "score",
    paragraphs: [
      "Quality on an operating company is the annual net profit margin: the share of revenue kept as profit. A wider margin scores higher. A loss scores lower.",
      "A high Quality score means the latest annual margin is wide. It does not mean every other part of the business is strong. Value, Growth, Financial Health, and Momentum still count equally when they have data.",
      "Banks, insurers, and real estate investment trusts do not use net profit margin, because that ratio does not describe those businesses in the data AssetScore stores. Quality is omitted for them and left out of the AssetScore.",
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
    kind: "score",
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
      "The headline AssetScore uses the pillars that have data, moves each one 15% of the way toward their median, and rounds the average. Each included pillar has equal weight.",
    kicker: "The score",
    kind: "score",
    paragraphs: [
      "Five pillars can be scored from 0 to 100: Value, Growth, Quality, Financial Health, and Momentum. The headline number uses only the pillars that have data. Their median is calculated, each available score moves 15% of the way toward that median, and the AssetScore is the rounded average of those adjusted scores. Each included pillar has equal weight. A missing pillar is left out. It is not scored as zero. One available pillar is used as it is.",
      "Bands group that average: 90–100 Exceptional, 80–89 Strong, 70–79 Solid, 60–69 Mixed, and 0–59 Weak. A Strong score can still hide a weak pillar. The stock page names the strongest and softest readings for that company.",
      "Momentum uses the latest price between the 52-week low and high. The other pillars use the latest annual figures. Those periods can differ. The result describes the latest inputs. It is not a prediction and it is not investment advice.",
    ],
    related: [
      { href: "/methodology", label: "Full methodology" },
      { href: "/rankings/sp500", label: "S&P 500 ranking" },
      { href: "/reports", label: "Sample reports" },
    ],
  },
  {
    slug: "what-is-a-stock",
    title: "What a stock represents",
    description:
      "A share is a slice of ownership in a company. Learn what that ownership includes, and what a market price does not tell you.",
    kicker: "Stocks",
    kind: "finance",
    paragraphs: [
      "A common share is a unit of ownership in a company. Buying a share does not put the company's cash in your account. It gives you a claim on the business as an owner, alongside every other shareholder. Some companies pay part of their profits as dividends. Others keep the profits in the business. A share price can rise or fall either way.",
      "The price is what buyers and sellers agreed to most recently. It is not the company's revenue, and it is not an appraisal of every asset on the balance sheet. Two companies can trade at similar prices per share and be completely different sizes, because one has far more shares outstanding. Market value is the price times the number of shares, not the price alone.",
      "Public companies that list in the United States publish financial statements. Those statements are the raw material behind an AssetScore: valuation, growth, profitability, the balance sheet, and where the price sits in its 52-week range. The score describes those latest figures. It does not say whether the next buyer will pay more.",
      "Owning a share also means you can lose money. The company can earn less, the industry can shrink, or investors can decide the shares are worth less than they paid. A score, a ranking, or a screener result is a reading of published data. It is not a recommendation to buy, sell, or hold.",
    ],
    related: [
      { href: "/learn/revenue-earnings-and-the-balance-sheet", label: "Revenue, earnings, and the balance sheet" },
      { href: "/coverage", label: "What AssetScore covers" },
      { href: "/methodology", label: "How the score is calculated" },
    ],
  },
  {
    slug: "revenue-earnings-and-the-balance-sheet",
    title: "Revenue, earnings, and the balance sheet",
    description:
      "Revenue, profit, and the balance sheet answer different questions. See how each one shows up in an AssetScore without treating any one figure as the whole story.",
    kicker: "Financial statements",
    kind: "finance",
    paragraphs: [
      "Revenue is what the company sold during the period. Earnings, or net income, are what remained after the costs of running the business, interest, and taxes. A company can grow sales and still lose money. Another can have flat sales and a wide profit margin. Looking at only one of those numbers hides the other.",
      "The balance sheet is a snapshot, not a year of activity. It lists what the company owns, what it owes, and the equity left for owners. Short-term assets compared with short-term bills is one way to read near-term flexibility. Debt compared with equity is one way to read how much of the business is financed by borrowing. Neither figure says whether the products will sell next year.",
      "AssetScore keeps those ideas in separate pillars. Growth uses year-over-year revenue. Quality uses the annual net profit margin for operating companies. Financial Health uses the current ratio and debt compared with equity when those inputs exist. Value uses the annual price-to-earnings ratio. A missing input is left out of the AssetScore. It is not filled in with zero.",
      "Banks, insurers, and real estate investment trusts are not scored with the same operating-company ratios, because those ratios do not describe those businesses in the stored data. Their omitted pillars stay omitted. The stock page shows the pillars that were actually calculated.",
    ],
    related: [
      { href: "/learn/revenue-growth", label: "How revenue growth is scored" },
      { href: "/learn/profit-margin-and-quality", label: "Profit margin and quality" },
      { href: "/learn/current-ratio-and-debt", label: "Current ratio and debt" },
    ],
  },
  {
    slug: "comparing-companies",
    title: "How to compare two companies",
    description:
      "A useful comparison uses the same measures on both companies. Here is what to line up, and what a higher score does not decide for you.",
    kicker: "Research",
    kind: "finance",
    paragraphs: [
      "Comparing a share price with another share price rarely helps. A $20 share and a $200 share can belong to companies of similar size, or to companies that have nothing in common. Compare the businesses: how fast revenue grew, how much of each sales dollar became profit, how the balance sheet is financed, and how expensive the shares are relative to earnings.",
      "Sector matters. A software company and an oil producer can both be profitable and still look nothing alike on growth, margins, and debt. A higher number on one ratio is not automatically better once the business model changes. Read the comparison as a set of differences, not as a winner.",
      "AssetScore uses the same pillars and the same headline calculation on both sides of a stock comparison when the data exists. Each included pillar has equal weight after the scores move slightly toward their middle. One company can lead on Value and trail on Growth. The page is there so you can see that split. It does not pick which company you should own.",
      "A comparison is only as current as the latest stored figures. Annual statements and a 52-week price range describe different windows of time. If a pillar is missing for one company, that pillar is left out of its average. It is not treated as a failing grade.",
    ],
    related: [
      { href: "/learn/reading-the-assetscore", label: "How to read an AssetScore" },
      { href: "/methodology", label: "Full methodology" },
      { href: "/rankings/sp500", label: "S&P 500 ranking" },
    ],
  },
  {
    slug: "portfolio-diversification",
    title: "Diversification across companies and sectors",
    description:
      "Owning several companies is not the same as being diversified. Concentration in one holding or one sector still dominates the result.",
    kicker: "Portfolios",
    kind: "finance",
    paragraphs: [
      "Diversification means the outcome of the whole portfolio does not depend on a single company, a single sector, or a single bet. Five software companies can all fall together if that industry falls. Four companies in healthcare, consumer staples, energy, and industrials can still be concentrated if one of them is most of the money.",
      "Position size is the share of the portfolio in one holding. A 40% position moves the result more than a 15% position, even when the smaller holding has the stronger business. Sector size is the same idea applied to a group. Spreading the count of tickers without spreading the money does not spread the risk.",
      "On an AssetScore portfolio, Company Quality is the allocation-weighted average of the AssetScores that exist. A holding without a score is left out of that average. Coverage is the scored allocation divided by the allocation you entered. Below 70% coverage, Company Quality is withheld rather than guessed.",
      "Portfolio Construction looks at how the holdings are spread across companies and sectors. The Overall Score is 60% Company Quality and 40% Portfolio Construction, and only when both parts exist. A high-quality portfolio can still score lower overall if it is concentrated. None of these readings is a forecast, and none is advice to buy or sell.",
    ],
    related: [
      { href: "/learn/what-is-a-stock", label: "What a stock represents" },
      { href: "/learn/what-is-the-sp500", label: "What the S&P 500 represents" },
      { href: "/methodology", label: "Full methodology" },
    ],
  },
  {
    slug: "what-is-the-sp500",
    title: "What the S&P 500 represents",
    description:
      "The S&P 500 is a list of large US-listed companies, not a promise of returns. See how AssetScore ranks that list without inventing a market forecast.",
    kicker: "Indexes",
    kind: "finance",
    paragraphs: [
      "The S&P 500 is a widely followed list of large companies listed in the United States. It is not the whole stock market. Smaller companies, many foreign listings, bonds, and funds sit outside it. Membership also changes. A company can be added or removed as the index provider updates the list.",
      "An index level is not an AssetScore. The index level is a market measure built from share prices. An AssetScore is a 0–100 reading of one company's latest financial inputs and price range. A company can be in the index and still land anywhere on that scale.",
      "AssetScore publishes a daily ranking of S&P 500 companies that are in the stored universe, ordered by the same score used on the stock page. Separate topic pages order that universe by one pillar, such as Value or Financial Health. A company missing a pillar is omitted from that pillar's ordering. It is not given a zero.",
      "Nasdaq 100 and Dow Jones lists are published the same way. A place near the top means the latest inputs scored higher than the companies below it. It does not mean the shares will outperform, and it does not mean the index itself will rise.",
    ],
    related: [
      { href: "/rankings/sp500", label: "S&P 500 ranking" },
      { href: "/topics", label: "S&P 500 lists by pillar" },
      { href: "/learn/how-a-stock-screener-works", label: "How a stock screener works" },
    ],
  },
  {
    slug: "how-a-stock-screener-works",
    title: "How a stock screener works",
    description:
      "A screener filters a known list of companies. It does not search the entire market, and a passing row is not a recommendation.",
    kicker: "Research",
    kind: "finance",
    paragraphs: [
      "A stock screener starts with a defined universe and keeps the rows that match the criteria you set. It is a filter, not a research department. If a company is outside the universe, no combination of filters will surface it. If a field is missing, that company cannot honestly pass a test on that field.",
      "The AssetScore screener uses the daily published dataset for the S&P 500, Nasdaq 100, and Dow Jones lists. You can limit the list by index, by the headline AssetScore, and by the five pillars. You can also filter published figures such as the price-to-earnings ratio, revenue growth, net margin, debt to equity, current ratio, market cap, and price. The interactive screener is included with the 30-day Pro trial and with Pro.",
      "The Quality versus Momentum view plots companies that have both of those pillars. The split on each axis is 70. A company missing Quality or Momentum is not plotted, and it is not placed at zero. Price on the table is a market quote. It is not colored as a score.",
      "A row that passes your filters has met those filters. It has not been selected as a portfolio. Read the stock page before treating a screen as a shortlist, and remember that scores describe the latest stored figures. They are not forecasts and they are not advice to buy or sell.",
    ],
    related: [
      { href: "/screener", label: "Stock Screener" },
      { href: "/learn/reading-the-assetscore", label: "How to read an AssetScore" },
      { href: "/pricing", label: "Pro and the 30-day trial" },
    ],
  },
];

export function learnArticle(slug: string) {
  return LEARN_ARTICLES.find((article) => article.slug === slug) ?? null;
}
