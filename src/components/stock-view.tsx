import Link from "next/link";
import { DataSourceStatus, LiveDataBadge, MarketDataSource } from "@/components/market-data-status";
import { PriceChart } from "@/components/price-chart";
import { ScoreGauge } from "@/components/score-gauge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { StockPageData } from "@/lib/fmp";
import { formatChange, formatMoney } from "@/lib/stocks";

function formatDay(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function StockView({ stock }: { stock: StockPageData }) {
  const positive = stock.change >= 0;
  const history = stock.history;
  const closes = history.map((point) => point.price);
  const hasHistory = closes.length >= 2;

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-10 pb-24">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
            <Link href="/" className="transition-colors hover:text-foreground">
              AssetScore
            </Link>
            <span className="px-2 text-white/20">/</span>
            Stocks
          </p>
          <LiveDataBadge live />
        </div>
        <MarketDataSource fetchedAt={stock.fetchedAt} />

        <div className="mt-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{stock.ticker}</h1>
            <p className="mt-2 text-base text-muted">
              {stock.name}
              <span className="px-2 text-white/20">·</span>
              {stock.exchange}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="font-mono text-3xl tracking-[-0.04em] tabular-nums">{formatMoney(stock.price)}</p>
            <p className={`mt-1 font-mono text-sm tabular-nums ${positive ? "text-accent-2" : "text-[#f0a3a8]"}`}>
              {formatChange(stock.change, stock.price)}
            </p>
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-6 text-muted">
          The score is calculated from the latest Financial Modeling Prep quote and annual ratios. It is not a recommendation.
        </p>

        <section className="mt-10 grid items-center gap-4 rounded-2xl border border-line bg-card px-6 py-8 lg:grid-cols-[280px_1fr] lg:px-10">
          <div className="flex justify-center">
            {stock.score == null ? (
              <p className="font-mono text-sm text-muted">Score unavailable</p>
            ) : (
              <ScoreGauge score={stock.score} size={220} />
            )}
          </div>
          <div className="max-w-xl lg:pl-6">
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">AssetScore</p>
            <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
              {stock.score == null
                ? "Not enough inputs for a score."
                : `${stock.score} of 100${stock.band ? `, in the ${stock.band} band` : ""}.`}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              The headline score is the rounded average of Value, Growth, Quality, Financial Health, and Momentum when those inputs are present.
            </p>
          </div>
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Scoring categories">
          {stock.pillars.map((pillar, index) => (
            <article key={pillar.label} className="rounded-2xl border border-line bg-card p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-sm tracking-[-0.01em]">{pillar.label}</h3>
                <span className="font-mono text-lg tabular-nums">{pillar.score ?? "—"}</span>
              </div>
              <div
                className="mt-4 h-1 overflow-hidden rounded-full bg-white/8"
                role={pillar.score == null ? undefined : "meter"}
                aria-label={pillar.label}
                aria-valuemin={pillar.score == null ? undefined : 0}
                aria-valuemax={pillar.score == null ? undefined : 100}
                aria-valuenow={pillar.score ?? undefined}
              >
                <div
                  className="bar-fill h-full rounded-full bg-gradient-to-r from-accent-2 to-accent"
                  style={{ width: `${pillar.score ?? 0}%`, animationDelay: `${index * 70}ms` }}
                />
              </div>
            </article>
          ))}
        </section>

        <section className="mt-14">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Score breakdown</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
            {stock.score == null ? "Where the score would come from." : `Where the ${stock.score} comes from.`}
          </h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-card">
            <ul>
              {stock.pillars.map((pillar, index) => (
                <li key={pillar.label} className="border-b border-line px-5 py-5 last:border-b-0 sm:px-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[15px]">{pillar.label}</h3>
                    <span className="font-mono text-sm text-muted tabular-nums">{pillar.score ?? "—"}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="bar-fill h-full rounded-full bg-gradient-to-r from-accent-2 to-accent"
                      style={{ width: `${pillar.score ?? 0}%`, animationDelay: `${120 + index * 60}ms` }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{pillar.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="rounded-2xl border border-line bg-card p-6 sm:p-8">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Why this score?</p>
            <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">The average, in plain language.</h2>
            <div className="mt-6 space-y-4">
              {stock.reasons.map((reason) => (
                <p key={reason} className="text-sm leading-7 text-muted">
                  {reason}
                </p>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6 sm:p-8">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Key metrics</p>
            <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">The inputs behind the pillars.</h2>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
            {stock.metrics.map((metric) => (
              <div key={metric.label}>
                <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">{metric.label}</dt>
                <dd className="mt-1 font-mono text-lg tracking-tight tabular-nums">{metric.value}</dd>
                <dd className="mt-1 text-xs text-muted">{metric.hint}</dd>
              </div>
            ))}
          </dl>
          </section>
        </div>

        <section className="mt-4 rounded-2xl border border-line bg-card p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Price path</p>
              <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">Closing prices.</h2>
            </div>
            {hasHistory ? (
              <p className="font-mono text-sm text-muted tabular-nums">
                {formatDay(history[0].date)} – {formatDay(history[history.length - 1].date)}
                <span className="px-2 text-white/20">·</span>
                {formatMoney(Math.min(...closes))} – {formatMoney(Math.max(...closes))}
              </p>
            ) : null}
          </div>
          <div className="mt-6">
            {hasHistory ? (
              <PriceChart points={closes} ticker={stock.ticker} />
            ) : (
              <p className="text-sm leading-6 text-muted">
                Price history is unavailable for this symbol.
              </p>
            )}
          </div>
        </section>

        <DataSourceStatus apiConnected lastRefresh tickerLoaded />
      </main>
      <SiteFooter />
    </div>
  );
}
