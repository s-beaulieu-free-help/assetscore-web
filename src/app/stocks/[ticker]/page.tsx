import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StockView } from "@/components/stock-view";
import { UpgradeNote } from "@/components/upgrade-note";
import { recordConsentedEvent, recordDailyCount } from "@/lib/analytics";
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
    const title = `${snapshot.companyName} Stock Analysis & Financial Health Score | AssetScore`;
    const description = `Explore ${snapshot.companyName} (${snapshot.symbol}) AssetScore, financial health, profitability, growth, and valuation. See the company's financial strengths and weaknesses. This is research, not a forecast.`;
    const path = `/stocks/${snapshot.symbol}`;
    return {
      title,
      description,
      alternates: { canonical: path },
      openGraph: { title, description, url: `https://assetscore.net${path}`, type: "website" },
      twitter: { card: "summary", title, description },
    };
  } catch {
    return {
      title: `${ticker} · AssetScore`,
      description: "Stock analysis and scoring for individual investors.",
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
          copy={`You've reached your monthly free analysis limit of ${limit} stock evaluations. Pro includes unlimited stock evaluations, the Stock Screener, new portfolios, and stock comparisons. A stock you already opened this month does not count again.`}
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

  await recordDailyCount("stock_page_view");
  if (user) {
    await recordConsentedEvent("first_stock_evaluation");
    if (access.isFree) await recordConsentedEvent("free_activity");
  }

  return <StockView stock={buildStockPage(snapshot)} showAds={access.shouldDisplayAds} signedIn={Boolean(user)} />;
}
