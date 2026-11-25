import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StockView } from "@/components/stock-view";
import { UpgradeNote } from "@/components/upgrade-note";
import { loadAccess, recordStockEvaluation } from "@/lib/billing/access";
import { FREE_EVALUATION_LIMIT_FALLBACK } from "@/lib/billing/plans";
import { buildStockPage, FmpNotFoundError, getFmpSnapshot } from "@/lib/fmp";
import { parseTicker } from "@/lib/stocks";

type StockPageProps = {
  params: Promise<{ ticker: string }>;
};

export async function generateMetadata({ params }: StockPageProps): Promise<Metadata> {
  const { ticker: raw } = await params;
  const ticker = parseTicker(raw);
  if (!ticker) return { title: "Stock not found · AssetScore" };

  try {
    const snapshot = await getFmpSnapshot(ticker);
    return {
      title: `${snapshot.symbol} · AssetScore`,
      description: `${snapshot.companyName} market data and AssetScore. Score any investment in seconds.`,
    };
  } catch {
    return {
      title: `${ticker} · AssetScore`,
      description: "Score any investment in seconds.",
    };
  }
}

export default async function StockPage({ params }: StockPageProps) {
  const { ticker: raw } = await params;
  const ticker = parseTicker(raw);
  if (!ticker) notFound();

  const access = await loadAccess();
  if (access.isFree) {
    const gate = await recordStockEvaluation(ticker);
    if (!gate.allowed) {
      const limit = gate.limit ?? FREE_EVALUATION_LIMIT_FALLBACK;
      return (
        <UpgradeNote
          title={`${ticker} is outside this month's free evaluations`}
          copy={`The Free plan includes ${limit} stock evaluations each calendar month. Repeat visits to a stock you already opened this month do not count again. Upgrade to keep analyzing without a monthly cap.`}
        />
      );
    }
  }

  let snapshot;
  try {
    snapshot = await getFmpSnapshot(ticker);
  } catch (error) {
    if (!(error instanceof FmpNotFoundError)) throw error;
  }

  if (!snapshot) notFound();

  return <StockView stock={buildStockPage(snapshot)} showAds={access.shouldDisplayAds} />;
}
