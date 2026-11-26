import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StockView } from "@/components/stock-view";
import { UpgradeNote } from "@/components/upgrade-note";
import { recordConsentedEvent } from "@/lib/analytics";
import { loadAccess, recordStockEvaluation } from "@/lib/billing/access";
import { FREE_EVALUATION_LIMIT_FALLBACK } from "@/lib/billing/plans";
import { buildStockPage, FmpNotFoundError, getFmpSnapshot } from "@/lib/fmp";
import { parseTicker } from "@/lib/stocks";
import { loadViewer } from "@/lib/viewer";

type StockPageProps = {
  params: Promise<{ ticker: string }>;
};

export async function generateMetadata({ params }: StockPageProps): Promise<Metadata> {
  const { ticker: raw } = await params;
  const ticker = parseTicker(raw);
  if (!ticker) return { title: "Stock not found · AssetScore" };

  try {
    const snapshot = await getFmpSnapshot(ticker);
    const title = `${snapshot.companyName} (${snapshot.symbol}) stock analysis`;
    const description = `${snapshot.companyName} stock score, valuation, financial health, and growth. The AssetScore explains the latest reported figures. It is not a forecast of returns.`;
    return {
      title,
      description,
      openGraph: { title, description, url: `https://assetscore.net/stocks/${snapshot.symbol}` },
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

  const [{ user }, access] = await Promise.all([loadViewer(), loadAccess()]);
  if (access.isFree) {
    const gate = await recordStockEvaluation(ticker);
    if (!gate.allowed) {
      const limit = gate.limit ?? FREE_EVALUATION_LIMIT_FALLBACK;
      return (
        <UpgradeNote
          title="You've reached your monthly free analysis limit"
          copy={`You've reached your monthly free analysis limit of ${limit} stock evaluations. Upgrade to Pro for unlimited stock analysis. A stock you already opened this month does not count again.`}
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

  if (user) {
    await recordConsentedEvent("first_stock_evaluation");
    if (access.isFree) await recordConsentedEvent("free_activity");
  }

  return <StockView stock={buildStockPage(snapshot)} showAds={access.shouldDisplayAds} signedIn={Boolean(user)} />;
}
