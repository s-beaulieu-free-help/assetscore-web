import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompareForm } from "@/components/compare-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FmpNotFoundError, getFmpSnapshot } from "@/lib/fmp";
import { parseTicker } from "@/lib/stocks";

type ComparePickProps = {
  params: Promise<{ left: string }>;
};

export async function generateMetadata({ params }: ComparePickProps): Promise<Metadata> {
  const ticker = parseTicker((await params).left);
  return { title: ticker ? `Compare ${ticker} · AssetScore` : "Compare · AssetScore" };
}

export default async function ComparePickPage({ params }: ComparePickProps) {
  const ticker = parseTicker((await params).left);
  if (!ticker) notFound();

  try {
    await getFmpSnapshot(ticker);
  } catch (error) {
    if (error instanceof FmpNotFoundError) notFound();
    throw error;
  }

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Compare</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{ticker}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
          Choose a second symbol. The comparison uses the same price, score, pillars, and fundamentals as each stock page.
        </p>
        <CompareForm ticker={ticker} />
      </main>
      <SiteFooter />
    </div>
  );
}
