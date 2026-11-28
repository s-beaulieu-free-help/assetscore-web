import Link from "next/link";
import { ScoreGauge } from "@/components/score-gauge";
import type { StockPageData } from "@/lib/fmp";
import { analyzePortfolio } from "@/lib/portfolio-quality";
import { scoreTextClass } from "@/lib/score";

export type ExampleHolding = {
  ticker: string;
  name: string;
  score: number | null;
  band: string | null;
  allocation: number;
  sector: string | null;
  isEtf: boolean;
  pillars: { label: string; score: number | null }[];
};

function PillarRow({ label, score }: { label: string; score: number | null }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[13px]">{label}</span>
        <span className={`font-mono text-[13px] tabular-nums ${score == null ? "text-muted" : scoreTextClass(score)}`}>{score ?? "—"}</span>
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

export function PortfolioPreview({ holdings }: { holdings: ExampleHolding[] }) {
  const analysis = analyzePortfolio(
    holdings.map((holding) => ({
      ticker: holding.ticker,
      name: holding.name,
      allocation: holding.allocation,
      score: holding.score,
      sector: holding.sector,
      isEtf: holding.isEtf,
      statementDate: null,
      pillars: holding.pillars,
    })),
  );
  const scores = [
    ["Overall", analysis.overall.score, analysis.overall.band],
    ["Company quality", analysis.company.score, analysis.company.status === "partial" ? "Partial coverage" : null],
    ["Construction", analysis.construction.score, null],
  ] as const;

  return (
    <section id="portfolio" className="scroll-mt-24 border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Analyze</p>
        <h2 className="mt-4 max-w-xl text-[2rem] leading-[1.05] font-medium tracking-[-0.04em] sm:text-5xl">
          See the bigger picture.
        </h2>
        <div className="mt-4 max-w-2xl space-y-3 text-sm leading-6 text-muted">
          <p>
            <strong className="font-medium text-foreground">Company Quality</strong> measures the weighted quality of
            your holdings. <strong className="font-medium text-foreground">Portfolio Construction</strong> evaluates
            diversification across companies and sectors. <strong className="font-medium text-foreground">Overall Score</strong>{" "}
            combines both: 60% quality and 40% construction.
          </p>
          <p>
            Example: Four companies across healthcare, consumer staples, energy, and industrials, weighted 15%, 25%,
            40%, and 20%, using live AssetScores.
          </p>
        </div>
        <div className="mt-10 rounded-2xl border border-line bg-card p-5 sm:p-6">
          <div className="grid gap-8 sm:grid-cols-3">
            {scores.map(([label, score, note]) => (
              <div key={label} className="flex flex-col items-center text-center">
                {typeof score === "number" ? (
                  <ScoreGauge score={score} size={132} id={`home-portfolio-${label}`} />
                ) : (
                  <p className="grid h-[132px] place-items-center text-sm text-muted">Unavailable</p>
                )}
                <p className="mt-3 text-sm font-medium">{label}</p>
                {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-muted">
            {analysis.holdings} holdings · Allocation {analysis.allocationTotal.toFixed(0)}% · Score coverage{" "}
            {analysis.company.coverage == null ? "—" : `${analysis.company.coverage.toFixed(0)}%`}
            {analysis.construction.stock.largest
              ? ` · Largest holding ${analysis.construction.stock.largest.ticker} ${analysis.construction.stock.largest.allocation.toFixed(0)}%`
              : ""}
          </p>
          {analysis.overall.reason ? <p className="mt-3 text-sm leading-6 text-muted">{analysis.overall.reason}</p> : null}
          <ul className="mt-4 divide-y divide-line border-t border-line">
            {holdings.map((holding) => (
              <li key={holding.ticker} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/stocks/${holding.ticker}`} className="text-lg font-medium hover:text-accent">
                    {holding.ticker}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {holding.name}
                    {holding.sector ? ` · ${holding.sector}` : ""}
                  </p>
                </div>
                <div className="flex items-baseline gap-4">
                  <p className="font-mono text-sm tabular-nums">
                    {holding.score == null ? (
                      "Score unavailable"
                    ) : (
                      <>
                        <span className={scoreTextClass(holding.score)}>{holding.score}</span>
                        {holding.band ? <span className="text-muted"> {holding.band}</span> : null}
                      </>
                    )}
                  </p>
                  <p className="font-mono text-sm tabular-nums">{holding.allocation.toFixed(0)}%</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/register" className="mt-2 inline-flex text-sm text-foreground hover:text-accent">
            Create a free account to build a portfolio
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ProductDemos({
  example,
  left,
  right,
  part = "all",
}: {
  example: StockPageData | null;
  left: StockPageData | null;
  right: StockPageData | null;
  part?: "all" | "evaluate" | "compare";
}) {
  return (
    <div>
      {part === "compare" ? null : (
        <section id="evaluate" className="scroll-mt-24 border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Evaluate</p>
            <h2 className="mt-4 max-w-xl text-[2rem] leading-[1.05] font-medium tracking-[-0.04em] sm:text-5xl">
              Understand the quality of every stock.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
              A stock page shows the overall AssetScore, the five pillars, the financial inputs, and a plain-language
              account of what is supporting the score and what is holding it back. This demonstration uses the same
              NVDA score as the stock page.
            </p>
            <div className="mt-10">
              {example ? (
                <StockDemo stock={example} />
              ) : (
                <p className="text-sm leading-6 text-muted">
                  The example could not be loaded. You can still{" "}
                  <Link href="/stocks/NVDA" className="text-foreground hover:text-accent">
                    open a stock analysis
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {part === "evaluate" ? null : (
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
                The comparison example could not be loaded. You can still{" "}
                <Link href="/compare/AAPL" className="text-foreground hover:text-accent">
                  start a comparison
                </Link>
                .
              </p>
            )}
          </div>
        </div>
        </section>
      )}
    </div>
  );
}
