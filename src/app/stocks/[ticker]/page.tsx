import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StockView } from "@/components/stock-view";
import { UpgradeNote } from "@/components/upgrade-note";
import { recordConsentedEvent, recordDailyCount } from "@/lib/analytics";
import { loadAccess, recordStockEvaluation } from "@/lib/billing/access";
import { FREE_EVALUATION_LIMIT_FALLBACK } from "@/lib/billing/plans";
import { buildStockPage, FmpNotFoundError, getFmpSnapshot } from "@/lib/fmp";
import { ranksForSymbol } from "@/lib/rankings";
import { historyForSymbol } from "@/lib/score-history";
import { shareMetadata } from "@/lib/seo";
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
    const stock = buildStockPage(snapshot);
    const title = `${stock.name} (${stock.ticker}) Stock Analysis & AssetScore | AssetScore`;
    const description =
      stock.score == null
        ? `${stock.name} (${stock.ticker}) stock analysis: value, growth, quality, financial health, and momentum. A score is omitted when the required figures are missing. Research, not a forecast.`
        : `${stock.name} (${stock.ticker}) AssetScore is ${stock.score} (${stock.band}). See value, growth, quality, financial health, and momentum from the latest annual figures and quote. Research, not a forecast.`;
    return shareMetadata({ title, description, path: `/stocks/${stock.ticker}` });
  } catch {
    return shareMetadata({
      title: `${ticker} · AssetScore`,
      description: `AssetScore research for ${ticker}: the 0–100 score, five pillars, and the latest reported figures.`,
      path: `/stocks/${ticker}`,
    });
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

  return (
    <StockView
      stock={buildStockPage(snapshot)}
      ranks={ranksForSymbol(snapshot.symbol)}
      scoreHistory={historyForSymbol(snapshot.symbol)}
      showAds={access.shouldDisplayAds}
      signedIn={Boolean(user)}
    />
  );
}
