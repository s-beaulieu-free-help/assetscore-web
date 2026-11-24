import Link from "next/link";
import { DataSourceStatus, LiveDataBadge, MarketDataSource } from "@/components/market-data-status";
import { PriceChart } from "@/components/price-chart";
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

        <section className="mt-10 rounded-2xl border border-line bg-card p-6 sm:p-8">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Key metrics</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">Market data for {stock.ticker}.</h2>
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
