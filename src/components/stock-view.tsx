import Link from "next/link";
import { PromotionSlot } from "@/components/promotion-slot";
import { FavoriteControl } from "@/components/favorite-control";
import { LiveDataBadge, MarketDataSource } from "@/components/market-data-status";
import { PriceChart } from "@/components/price-chart";
import { ScoreGauge } from "@/components/score-gauge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StockReviews } from "@/components/stock-reviews";
import type { StockPageData } from "@/lib/fmp";
import { PILLAR_COPY } from "@/lib/pillar-copy";
import { scoreStory } from "@/lib/score-story";
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

export function StockView({
  stock,
  showAds = false,
  signedIn = false,
}: {
  stock: StockPageData;
  showAds?: boolean;
  signedIn?: boolean;
}) {
  const positive = stock.change >= 0;
  const history = stock.history;
  const closes = history.map((point) => point.price);
  const hasHistory = closes.length >= 2;
  const story = scoreStory(stock.pillars);

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

        <div className="mt-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{stock.name}</h1>
            <p className="mt-2 text-base text-muted">
              {stock.ticker}
              <span className="px-2 text-white/20">·</span>
              {stock.exchange}
            </p>
            <FavoriteControl ticker={stock.ticker} />
          </div>
          <div className="sm:text-right">
            <Link
              href={`/compare/${stock.ticker}`}
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink transition hover:brightness-110"
            >
              Compare
            </Link>
            <p className="mt-4 font-mono text-3xl tracking-[-0.04em] tabular-nums">{formatMoney(stock.price)}</p>
            <p className={`mt-1 font-mono text-sm tabular-nums ${positive ? "text-accent-2" : "text-[#f0a3a8]"}`}>
              {formatChange(stock.change, stock.price)}
            </p>
            <p className="mt-1 text-xs text-muted">Price in US dollars</p>
          </div>
        </div>

        <MarketDataSource fetchedAt={stock.fetchedAt} />
        <p className="mt-3 max-w-2xl text-xs leading-5 text-muted">
          Ratios and revenue growth use the latest annual figures. The price and 52-week range use the latest quote.
          Those periods can differ. Amounts are in US dollars. A dash means the figure was not returned, not that it is
          zero.
        </p>

        <section className="mt-10 grid items-center gap-6 rounded-2xl border border-line bg-card px-6 py-8 lg:grid-cols-[240px_1fr] lg:px-10">
          <div className="flex justify-center">
            {stock.score == null ? (
              <p className="font-mono text-sm text-muted">Score unavailable</p>
            ) : (
              <ScoreGauge score={stock.score} size={220} id={`${stock.ticker}-score`} />
            )}
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">AssetScore</p>
            <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
              {stock.score == null ? "Not enough inputs for a score." : `${stock.score} of 100`}
            </h2>
            {stock.band ? <p className="mt-2 text-lg text-foreground">{stock.band}</p> : null}
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
              The score is the rounded average of Value, Growth, Quality, Financial Health, and Momentum when those
              inputs are present. It describes the latest figures. It does not predict future returns.
            </p>
            <Link href="/methodology" className="mt-4 inline-flex text-sm text-foreground hover:text-accent">
              How this score is calculated
            </Link>
          </div>
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Scoring categories">
          {stock.pillars.map((pillar) => (
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
                <div className="h-full rounded-full bg-accent" style={{ width: `${pillar.score ?? 0}%` }} />
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">{pillar.note}</p>
            </article>
          ))}
        </section>

        <section className="mt-10">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Score explanation</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">What&apos;s driving this score?</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{story.summary}</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-line bg-card p-5">
              <h3 className="text-lg font-medium">Strengths</h3>
              {story.strengths.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-muted">None of the available pillars reached 70, where the Solid band begins.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {story.strengths.map((pillar) => (
                    <li key={pillar.label} className="text-sm leading-6 text-muted">
                      <span className="text-foreground">{`${pillar.label} ${pillar.score}.`}</span>{" "}
                      {pillar.why}
                    </li>
                  ))}
                </ul>
              )}
            </article>
            <article className="rounded-2xl border border-line bg-card p-5">
              <h3 className="text-lg font-medium">Weaknesses</h3>
              {story.weaknesses.length === 0 ? (
                <p className="mt-3 text-sm leading-6 text-muted">None of the available pillars scored below 60, where the Weak band begins.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {story.weaknesses.map((pillar) => (
                    <li key={pillar.label} className="text-sm leading-6 text-muted">
                      <span className="text-foreground">{`${pillar.label} ${pillar.score}.`}</span>{" "}
                      {pillar.why}
                    </li>
                  ))}
                </ul>
              )}
            </article>
            <article className="rounded-2xl border border-line bg-card p-5">
              <h3 className="text-lg font-medium">What to monitor</h3>
              <ul className="mt-3 space-y-3">
                {story.monitor.map((item) => (
                  <li key={item.label} className="text-sm leading-6 text-muted">
                    <span className="text-foreground">{item.label}.</span> {item.detail}
                  </li>
                ))}
              </ul>
            </article>
          </div>
          {story.between.length > 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted">
              In between: {story.between.map((pillar) => `${pillar.label} ${pillar.score}`).join(", ")}.
            </p>
          ) : null}
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          {stock.pillars.map((pillar) => {
            const copy = PILLAR_COPY[pillar.label];
            return (
              <article key={pillar.label} className="rounded-2xl border border-line bg-card p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-xl font-medium tracking-[-0.03em]">{pillar.label}</h2>
                  <span className="font-mono text-lg tabular-nums">{pillar.score ?? "—"}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{copy.measures}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{copy.matters}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{copy.indicators}</p>
                <p className="mt-3 text-sm leading-6 text-foreground">{pillar.note}</p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {copy.high} {copy.low}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-10 rounded-2xl border border-line bg-card p-6 sm:p-8">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Reported figures</p>
          <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">The inputs behind the pillars.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Market cap, price, and the 52-week range are from the latest quote, in US dollars. Revenue is the latest
            annual total. A dash means that figure was unavailable.
          </p>
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
              <PriceChart points={history} ticker={stock.ticker} />
            ) : (
              <p className="text-sm leading-6 text-muted">Price history is unavailable for this symbol.</p>
            )}
          </div>
        </section>

        {signedIn ? null : (
          <section className="mt-8 rounded-2xl border border-line bg-card px-6 py-6">
            <h2 className="text-xl font-medium tracking-[-0.03em]">Evaluate more stocks</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Want to evaluate more stocks? Create your free AssetScore account and explore the full platform for 30
              days. No credit card is required, and the trial does not charge you when it ends.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/register?next=${encodeURIComponent(`/stocks/${stock.ticker}`)}`}
                className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink transition hover:brightness-110"
              >
                Create a free account
              </Link>
              <Link
                href={`/compare/${stock.ticker}`}
                className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm"
              >
                Compare {stock.ticker} with another company
              </Link>
            </div>
          </section>
        )}

        <PromotionSlot placement="stock" enabled={showAds} />
        <StockReviews ticker={stock.ticker} />
      </main>
      <SiteFooter />
    </div>
  );
}
