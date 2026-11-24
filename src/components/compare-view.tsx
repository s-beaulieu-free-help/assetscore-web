import Link from "next/link";
import { PriceChart } from "@/components/price-chart";
import { ScoreGauge } from "@/components/score-gauge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { StockPageData } from "@/lib/fmp";
import { formatChange, formatMoney } from "@/lib/stocks";

function formatUpdated(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(new Date(iso));
}

function StockColumn({ stock }: { stock: StockPageData }) {
  const positive = stock.change >= 0;
  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <Link href={`/stocks/${stock.ticker}`} className="text-3xl font-medium tracking-[-0.04em] hover:text-accent">
        {stock.ticker}
      </Link>
      <p className="mt-1 text-sm text-muted">
        {stock.name}
        <span className="px-2 text-white/20">·</span>
        {stock.exchange}
      </p>
      <p className="mt-4 font-mono text-2xl tabular-nums">{formatMoney(stock.price)}</p>
      <p className={`mt-1 font-mono text-sm tabular-nums ${positive ? "text-accent-2" : "text-[#f0a3a8]"}`}>
        {formatChange(stock.change, stock.price)}
      </p>
      <p className="mt-3 text-xs text-muted">
        Last Updated: <time dateTime={stock.fetchedAt}>{formatUpdated(stock.fetchedAt)}</time>
      </p>
      <div className="mt-6 flex items-center gap-4">
        {stock.score == null ? (
          <p className="font-mono text-sm text-muted">Score unavailable</p>
        ) : (
          <ScoreGauge score={stock.score} size={132} id={stock.ticker} />
        )}
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">AssetScore</p>
          <p className="mt-2 text-xl font-medium tracking-[-0.03em]">
            {stock.score == null ? "—" : stock.score}
            {stock.band ? <span className="ml-2 text-base text-muted">{stock.band}</span> : null}
          </p>
        </div>
      </div>
    </div>
  );
}

function better(left: number | null, right: number | null, side: "left" | "right") {
  if (left == null || right == null || left === right) return false;
  return side === "left" ? left > right : right > left;
}

export function CompareView({ left, right }: { left: StockPageData; right: StockPageData }) {
  const pair = [left, right];

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-10 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
          <Link href="/" className="transition-colors hover:text-foreground">
            AssetScore
          </Link>
          <span className="px-2 text-white/20">/</span>
          <Link href={`/stocks/${left.ticker}`} className="transition-colors hover:text-foreground">
            {left.ticker}
          </Link>
          <span className="px-2 text-white/20">/</span>
          Compare
        </p>
        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
            {left.ticker}
            <span className="px-3 text-muted">vs</span>
            {right.ticker}
          </h1>
          <Link
            href={`/compare/${left.ticker}`}
            className="inline-flex h-11 w-fit items-center rounded-full border border-line px-5 text-sm font-medium transition hover:bg-white/5"
          >
            Change symbol
          </Link>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Both sides use the same quote, annual ratios, and score as the stock page. This is not a recommendation.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <StockColumn stock={left} />
          <StockColumn stock={right} />
        </div>

        <section className="mt-4 rounded-2xl border border-line bg-card p-5 sm:p-6">
          <h2 className="text-lg font-medium tracking-[-0.03em]">Pillars</h2>
          <div className="mt-5 space-y-5">
            {left.pillars.map((pillar, index) => {
              const other = right.pillars[index];
              return (
                <div key={pillar.label}>
                  <p className="text-sm">{pillar.label}</p>
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    {[pillar, other].map((item, side) => {
                      const ahead = better(pillar.score, other?.score ?? null, side === 0 ? "left" : "right");
                      return (
                        <div key={item.label + side}>
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                              {side === 0 ? left.ticker : right.ticker}
                            </span>
                            <span className={`font-mono text-sm tabular-nums ${ahead ? "text-accent" : "text-muted"}`}>
                              {item.score ?? "—"}
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-accent-2 to-accent"
                              style={{ width: `${item.score ?? 0}%` }}
                            />
                          </div>
                          <p className="mt-2 text-xs leading-5 text-muted">{item.note}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-line bg-card">
          <h2 className="px-5 pt-5 text-lg font-medium tracking-[-0.03em] sm:px-6">Key metrics</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left">
              <thead>
                <tr className="border-b border-line font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                  <th className="px-5 py-3 font-normal sm:px-6">Metric</th>
                  <th className="px-5 py-3 font-normal sm:px-6">{left.ticker}</th>
                  <th className="px-5 py-3 font-normal sm:px-6">{right.ticker}</th>
                </tr>
              </thead>
              <tbody>
                {left.metrics.map((metric, index) => (
                  <tr key={metric.label} className="border-b border-line last:border-b-0">
                    <th className="px-5 py-4 text-sm font-normal text-muted sm:px-6">
                      {metric.label}
                      <span className="mt-1 block text-xs">{metric.hint}</span>
                    </th>
                    <td className="px-5 py-4 font-mono text-sm tabular-nums sm:px-6">{metric.value}</td>
                    <td className="px-5 py-4 font-mono text-sm tabular-nums sm:px-6">{right.metrics[index]?.value ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          {pair.map((stock) => (
            <article key={stock.ticker} className="rounded-2xl border border-line bg-card p-5 sm:p-6">
              <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Why this score?</p>
              <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">{stock.ticker}</h2>
              <div className="mt-4 space-y-3">
                {stock.reasons.map((reason) => (
                  <p key={reason} className="text-sm leading-6 text-muted">
                    {reason}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2">
          {pair.map((stock) => (
            <article key={stock.ticker} className="rounded-2xl border border-line bg-card p-5 sm:p-6">
              <h2 className="text-lg font-medium tracking-[-0.03em]">{stock.ticker} closing prices</h2>
              <div className="mt-4">
                {stock.history.length >= 2 ? (
                  <PriceChart points={stock.history} ticker={stock.ticker} />
                ) : (
                  <p className="text-sm text-muted">Price history is unavailable for this symbol.</p>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
