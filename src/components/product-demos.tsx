import Link from "next/link";
import { ScoreGauge } from "@/components/score-gauge";
import type { StockPageData } from "@/lib/fmp";
import { allocationTotal, weightedPortfolioScore } from "@/lib/portfolio-score";

export type ExampleHolding = {
  ticker: string;
  name: string;
  score: number | null;
  band: string | null;
  allocation: number;
  pillars: { label: string; score: number | null }[];
};

function PillarRow({ label, score }: { label: string; score: number | null }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[13px]">{label}</span>
        <span className="font-mono text-[13px] text-muted tabular-nums">{score ?? "—"}</span>
      </div>
      <div
        className="h-1 overflow-hidden rounded-full bg-white/8"
        role={score == null ? undefined : "meter"}
        aria-label={label}
        aria-valuemin={score == null ? undefined : 0}
        aria-valuemax={score == null ? undefined : 100}
        aria-valuenow={score ?? undefined}
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${score ?? 0}%` }} />
      </div>
    </div>
  );
}

function StockDemo({ stock }: { stock: StockPageData }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {stock.score == null ? (
          <p className="font-mono text-sm text-muted">Score unavailable</p>
        ) : (
          <ScoreGauge score={stock.score} size={148} id={`home-${stock.ticker}`} />
        )}
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
            {stock.ticker}
            <span className="px-2 text-white/20">·</span>
            {stock.exchange}
          </p>
          <h3 className="mt-2 text-2xl font-medium tracking-[-0.03em]">
            <Link href={`/stocks/${stock.ticker}`} className="hover:text-accent">
              {stock.name}
            </Link>
          </h3>
          <p className="mt-2 text-sm text-muted">
            {stock.score == null ? "Score unavailable" : `${stock.score} of 100`}
            {stock.band ? ` · ${stock.band}` : ""}
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {stock.pillars.map((pillar) => (
          <PillarRow key={pillar.label} label={pillar.label} score={pillar.score} />
        ))}
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
        {stock.metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">{metric.label}</dt>
            <dd className="mt-1 font-mono text-sm tabular-nums">{metric.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 space-y-3">
        {stock.reasons.slice(0, 3).map((reason) => (
          <p key={reason} className="text-sm leading-6 text-muted">
            {reason}
          </p>
        ))}
      </div>
      <Link href={`/stocks/${stock.ticker}`} className="mt-6 inline-flex text-sm text-foreground hover:text-accent">
        Open the full {stock.ticker} analysis
      </Link>
    </div>
  );
}

function CompareDemo({ left, right }: { left: StockPageData; right: StockPageData }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {[left, right].map((stock) => (
          <div key={stock.ticker}>
            <div className="flex items-center gap-4">
              {stock.score == null ? null : <ScoreGauge score={stock.score} size={96} id={`compare-${stock.ticker}`} />}
              <div>
                <Link href={`/stocks/${stock.ticker}`} className="text-xl font-medium tracking-[-0.03em] hover:text-accent">
                  {stock.ticker}
                </Link>
                <p className="mt-1 text-sm text-muted">{stock.name}</p>
                <p className="mt-1 font-mono text-sm tabular-nums">
                  {stock.score ?? "—"}
                  {stock.band ? <span className="ml-2 text-muted">{stock.band}</span> : null}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {stock.pillars.map((pillar) => (
                <PillarRow key={pillar.label} label={pillar.label} score={pillar.score} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <Link
        href={`/compare/${left.ticker}/${right.ticker}`}
        className="mt-6 inline-flex text-sm text-foreground hover:text-accent"
      >
        Open the full {left.ticker} and {right.ticker} comparison
      </Link>
    </div>
  );
}

export function ProductDemos({
  example,
  left,
  right,
  holdings,
}: {
  example: StockPageData | null;
  left: StockPageData | null;
  right: StockPageData | null;
  holdings: ExampleHolding[];
}) {
  const weighted = weightedPortfolioScore(holdings);
  const total = allocationTotal(holdings.map((holding) => holding.allocation));
  const remaining = Math.max(0, Math.round((100 - total) * 10000) / 10000);
  return (
    <div>
      <section id="evaluate" className="scroll-mt-24 border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Stock analysis</p>
          <h2 className="mt-4 max-w-xl text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] sm:text-4xl">
            Understand the quality of every stock.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
            A stock page shows the overall AssetScore, the five pillars, the financial inputs, and a plain-language
            account of what is supporting the score and what is holding it back.
          </p>
          <div className="mt-10">
            {example ? (
              <StockDemo stock={example} />
            ) : (
              <p className="text-sm leading-6 text-muted">
                The live example could not be loaded. You can still{" "}
                <Link href="/stocks/NVDA" className="text-foreground hover:text-accent">
                  open a stock analysis
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </section>

      <section id="portfolio" className="scroll-mt-24 border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Portfolio analysis</p>
          <h2 className="mt-4 max-w-xl text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] sm:text-4xl">
            See the bigger picture.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
            Registered users add the stocks they own and give each one a percentage of the portfolio. The portfolio
            score is the allocation-weighted average of those AssetScores. This example is four live scores, weighted
            15%, 25%, 40%, and 20%: a healthcare company, a consumer staple, an energy company, and an industrial. Their
            bands and pillar scores show how the same 0–100 scale treats a stronger business and a weaker cyclical one.
          </p>
          <div className="mt-10 rounded-2xl border border-line bg-card p-5 sm:p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {weighted.score == null ? (
                <p className="font-mono text-sm text-muted">Score incomplete</p>
              ) : (
                <ScoreGauge score={weighted.score} size={148} id="home-portfolio" />
              )}
              <div>
                <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Portfolio score</p>
                <h3 className="mt-3 text-2xl font-medium tracking-[-0.03em]">
                  {weighted.score == null ? "Incomplete" : `${weighted.score} of 100`}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                  {weighted.reason ??
                    "The score is the allocation-weighted average of each stock's AssetScore. It uses the same stock scores as the stock pages."}
                </p>
              </div>
            </div>
            <p className="mt-6 font-mono text-sm text-muted tabular-nums">
              {holdings.length} stocks · Total allocation {total.toFixed(2)}% · Remaining {remaining.toFixed(2)}%
            </p>
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {holdings.map((holding) => (
                <li key={holding.ticker} className="py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Link href={`/stocks/${holding.ticker}`} className="text-lg font-medium hover:text-accent">
                        {holding.ticker}
                      </Link>
                      <p className="mt-1 text-sm text-muted">{holding.name}</p>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <p className="font-mono text-sm tabular-nums">
                        {holding.score == null ? "Score unavailable" : `${holding.score} ${holding.band ?? ""}`.trim()}
                      </p>
                      <p className="font-mono text-sm tabular-nums">{holding.allocation.toFixed(2)}%</p>
                    </div>
                  </div>
                  {holding.pillars.length > 0 ? (
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
                      {holding.pillars.map((pillar) => (
                        <div key={pillar.label}>
                          <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">{pillar.label}</dt>
                          <dd className="mt-1 font-mono text-sm tabular-nums">{pillar.score ?? "—"}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                </li>
              ))}
            </ul>
            <Link href="/register" className="mt-2 inline-flex text-sm text-foreground hover:text-accent">
              Create a free account to build a portfolio
            </Link>
          </div>
        </div>
      </section>

      <section id="compare" className="scroll-mt-24 border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Stock comparison</p>
          <h2 className="mt-4 max-w-xl text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] sm:text-4xl">
            Compare companies with confidence.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
            Put two US-listed companies side by side and read the same five pillars for each: valuation, growth,
            profitability, financial health, and momentum. The comparison uses the same scores as the individual stock
            pages.
          </p>
          <div className="mt-10">
            {left && right ? (
              <CompareDemo left={left} right={right} />
            ) : (
              <p className="text-sm leading-6 text-muted">
                The live comparison could not be loaded. You can still{" "}
                <Link href="/compare/AAPL" className="text-foreground hover:text-accent">
                  start a comparison
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
