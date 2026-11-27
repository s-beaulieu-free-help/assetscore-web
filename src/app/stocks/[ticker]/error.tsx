"use client";

import { MarketDataSource } from "@/components/market-data-status";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeaderBar } from "@/components/site-header-bar";

export default function StockError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const leaked = /apikey|financialmodelingprep\.com|financial modeling prep/i.test(error.message);
  const message = leaked || !error.message ? "Market data could not be loaded." : error.message;
  return (
    <div>
      <SiteHeaderBar name={null} />
      <main className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col justify-center px-6 py-24">
        <MarketDataSource fetchedAt={null} />
        <h1 className="mt-6 max-w-xl text-4xl font-medium tracking-[-0.04em]">
          Market data could not be loaded.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted">{message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex h-11 w-fit items-center rounded-full bg-accent px-5 text-sm font-medium text-ink"
        >
          Try again
        </button>
      </main>
      <SiteFooter />
    </div>
  );
}
