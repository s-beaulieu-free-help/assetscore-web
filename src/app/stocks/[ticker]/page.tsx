import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StockView } from "@/components/stock-view";
import { getStock, parseTicker } from "@/lib/stocks";

type StockPageProps = {
  params: Promise<{ ticker: string }>;
};

export async function generateMetadata({ params }: StockPageProps): Promise<Metadata> {
  const { ticker: raw } = await params;
  const ticker = parseTicker(raw);
  const stock = ticker ? getStock(ticker) : null;

  if (!stock) {
    return { title: "Stock not found · AssetScore" };
  }

  return {
    title: `${stock.ticker} · AssetScore`,
    description: `${stock.name} has an illustrative AssetScore of ${stock.score}. Score any investment in seconds.`,
  };
}

export default async function StockPage({ params }: StockPageProps) {
  const { ticker: raw } = await params;
  const stock = getStock(raw);

  if (!stock) notFound();

  return <StockView stock={stock} />;
}
