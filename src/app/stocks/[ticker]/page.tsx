import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StockView } from "@/components/stock-view";
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

  let snapshot;
  try {
    snapshot = await getFmpSnapshot(ticker);
  } catch (error) {
    if (!(error instanceof FmpNotFoundError)) throw error;
  }

  if (!snapshot) notFound();

  return <StockView stock={buildStockPage(snapshot)} />;
}
