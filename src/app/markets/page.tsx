import type { Metadata } from "next";
import Link from "next/link";
import { CenterHashTarget } from "@/components/center-hash-target";
import { PriceChart } from "@/components/price-chart";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatFetchedAt } from "@/components/market-data-status";
import { getIndexSeries, type IndexSeries } from "@/lib/fmp";
import { formatChange, formatMoney } from "@/lib/stocks";
import { shareMetadata } from "@/lib/seo";
import { loadViewer } from "@/lib/viewer";

export const metadata: Metadata = shareMetadata({
  title: "Markets · AssetScore",
  description: "US index levels for signed-in accounts. Public stock rankings and company scores stay on the ranking pages.",
  path: "/markets",
  robots: { index: false, follow: true },
});

const INDEXES = [
  { symbol: "^GSPC", label: "SP500", anchor: "sp500" },
  { symbol: "^DJI", label: "Dow Jones", anchor: "dow" },
  { symbol: "^IXIC", label: "Nasdaq", anchor: "nasdaq" },
  { symbol: "^RUT", label: "Russell", anchor: "russell" },
] as const;

async function loadIndex(symbol: string): Promise<IndexSeries | null> {
  try {
    return await getIndexSeries(symbol);
  } catch {
    return null;
  }
}

export default async function MarketsPage() {
  const { user } = await loadViewer();
  const series = user
    ? await Promise.all(INDEXES.map(async (index) => ({ index, data: await loadIndex(index.symbol) })))
    : [];
  const updatedAt = latestUpdate(series);

  return (
    <div>
      <SiteHeader />
      <CenterHashTarget />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Indexes</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Markets</h1>
        {user ? (
          <>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
              Latest levels and closing prices for the major indexes. Prices come from the same market data as the stock pages.
            </p>
            {updatedAt ? (
              <p className="mt-3 text-xs text-muted">
                Last updated:{" "}
                <time className="font-mono text-foreground/85" dateTime={updatedAt}>
                  {formatFetchedAt(updatedAt)}
                </time>
              </p>
            ) : null}
            <div className="mt-10 space-y-6">
              {series.map(({ index, data }) => {
                const positive = (data?.change ?? 0) >= 0;
                return (
                  <section id={index.anchor} key={index.symbol} className="scroll-mt-28 rounded-2xl border border-line bg-card px-5 py-6 sm:px-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                      <div>
                        <h2 className="text-2xl font-medium tracking-[-0.03em]">{index.label}</h2>
                        <p className="mt-1 text-sm text-muted">{data?.name ?? index.symbol}</p>
                      </div>
                      {data ? (
                        <div className="sm:text-right">
                          <p className="font-mono text-2xl tracking-[-0.04em] tabular-nums">{formatMoney(data.price)}</p>
                          <p className={`mt-1 font-mono text-sm tabular-nums ${positive ? "text-accent-2" : "text-[#f0a3a8]"}`}>
                            {formatChange(data.change, data.price)}
                          </p>
                          <p className="mt-2 text-xs text-muted">
                            Last updated:{" "}
                            <time className="font-mono text-foreground/85" dateTime={data.fetchedAt}>
                              {formatFetchedAt(data.fetchedAt)}
                            </time>
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted">This index could not be loaded.</p>
                      )}
                    </div>
                    {data && data.history.length > 1 ? (
                      <div className="mt-6">
                        <PriceChart points={data.history} ticker={index.symbol} />
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          </>
        ) : (
          <p className="mt-6 max-w-xl text-sm leading-6 text-muted">
            Market charts are available after you{" "}
            <Link href="/login" className="text-foreground hover:text-accent">
              log in
            </Link>
            .
          </p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function latestUpdate(series: Array<{ data: IndexSeries | null }>) {
  const times = series.flatMap((item) => (item.data ? [item.data.fetchedAt] : []));
  return times.sort().at(-1) ?? null;
}
