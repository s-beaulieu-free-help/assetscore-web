import { FREE_EVALUATION_LIMIT_FALLBACK, PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { HEADLINE_SCORE_SUMMARY } from "@/lib/score";

export const homeFaqs = [
  {
    question: "How is the AssetScore calculated?",
    answer:
      `${HEADLINE_SCORE_SUMMARY} Value comes from the annual price-to-earnings ratio. Growth comes from the change in revenue from the prior year. Quality comes from the net profit margin. Financial health combines the current ratio and debt compared with equity. Momentum comes from where the price sits between the 52-week low and high. The result is informational and is not a buy or sell recommendation.`,
  },
  {
    question: "Where does AssetScore get its financial data?",
    answer:
      "A score is built from the latest quote and the latest annual ratios and income figures. The quote supplies the price and the 52-week range. The annual statements supply earnings, revenue growth, profit margin, and the balance-sheet ratios.",
  },
  {
    question: "How frequently is financial information updated?",
    answer:
      "The quote is refreshed about every five minutes. The stock page shows when that data was fetched, in US Eastern time.",
  },
  {
    question: "Which stock markets are supported?",
    answer:
      "Stock search, comparison, favorites, and portfolios are for US-listed tickers. Enter a symbol such as AAPL, MSFT, or NVDA.",
  },
  {
    question: "Does a higher score mean a stock is a better investment?",
    answer:
      "No. A higher score means the available pillars average higher. It does not predict a return, and AssetScore does not provide investment advice.",
  },
  {
    question: "What happens after my 30-day free trial?",
    answer: `The trial ends without a charge. The account moves to the Free plan: ${FREE_EVALUATION_LIMIT_FALLBACK} stock evaluations per calendar month, the same stock scores, and AssetScore ads. New portfolios, comparisons, favorites, reviews, and the Stock Screener require Pro. Portfolios, favorites, and reviews you already saved stay in the account. Pro is ${PRO_MONTHLY_PRICE.label} only if you choose a paid plan.`,
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "There is nothing to cancel during the trial, because no card is charged. If you later choose Pro, you can manage or cancel that subscription from the account billing portal. A canceled paid plan keeps access until the end of the period already paid.",
  },
  {
    question: "Can I use AssetScore without subscribing?",
    answer:
      "Yes. You can open stock scores without an account. Creating an account is free. After you confirm your email, 30 days include unlimited stock evaluations, the Stock Screener, new portfolios, and stock comparisons. After that trial, the Free plan still lets you evaluate a limited number of stocks each month.",
  },
];

export function HomeFaq() {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Questions</p>
        <h2 className="mt-4 max-w-xl text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] sm:text-4xl">
          Before you create an account
        </h2>
        <div className="mt-10 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {homeFaqs.map((item) => (
            <details key={item.question} className="group px-5 py-5 sm:px-6">
              <summary className="cursor-pointer text-[15px] font-medium tracking-[-0.02em]">
                {item.question}
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
