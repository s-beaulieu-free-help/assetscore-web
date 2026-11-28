import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadAccess } from "@/lib/billing/access";
import { CompareForm } from "@/components/compare-form";
import { UpgradeNote } from "@/components/upgrade-note";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FmpNotFoundError, getFmpSnapshot } from "@/lib/fmp";
import { shareMetadata } from "@/lib/seo";
import { parseTicker } from "@/lib/stocks";

type ComparePickProps = {
  params: Promise<{ left: string }>;
};

export async function generateMetadata({ params }: ComparePickProps): Promise<Metadata> {
  const ticker = parseTicker((await params).left);
  const title = ticker ? `Compare ${ticker} stock fundamentals · AssetScore` : "Compare stocks · AssetScore";
  const description = ticker
    ? `Compare ${ticker} with another company using the same AssetScore, pillar scores, and reported figures.`
    : "Compare two companies on the same AssetScore fundamentals.";
  return shareMetadata({
    title,
    description,
    path: ticker ? `/compare/${ticker}` : "/compare",
  });
}

export default async function ComparePickPage({ params }: ComparePickProps) {
  const access = await loadAccess();
  if (access.isFree) {
    return (
      <UpgradeNote
        title="Compare companies side by side"
        copy="Stock comparison is included with the 30-day Pro trial and with Pro. Individual stock pages stay open on the Free plan."
      />
    );
  }
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
