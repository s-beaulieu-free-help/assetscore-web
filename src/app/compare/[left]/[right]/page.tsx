import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompareView } from "@/components/compare-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildStockPage, FmpNotFoundError, getFmpSnapshot } from "@/lib/fmp";
import { parseTicker } from "@/lib/stocks";

type ComparePageProps = {
  params: Promise<{ left: string; right: string }>;
};

async function loadPair(leftRaw: string, rightRaw: string) {
  const left = parseTicker(leftRaw);
  const right = parseTicker(rightRaw);
  if (!left || !right) return null;
  try {
    const [leftSnapshot, rightSnapshot] = await Promise.all([getFmpSnapshot(left), getFmpSnapshot(right)]);
    return { left: buildStockPage(leftSnapshot), right: buildStockPage(rightSnapshot) };
  } catch (error) {
    if (error instanceof FmpNotFoundError) return null;
    throw error;
  }
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { left, right } = await params;
  const pair = await loadPair(left, right);
  if (!pair) return { title: "Compare · AssetScore" };
  return {
    title: `${pair.left.ticker} vs ${pair.right.ticker} · AssetScore`,
    description: `Compare ${pair.left.name} and ${pair.right.name} on the same AssetScore inputs.`,
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { left, right } = await params;
  const base = parseTicker(left);
  const other = parseTicker(right);
  if (base && other && base === other) {
    return (
      <div>
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
          <h1 className="text-4xl font-medium tracking-[-0.045em]">Choose a different symbol</h1>
          <p className="mt-4 text-sm text-muted">{base} cannot be compared with itself.</p>
          <Link href={`/compare/${base}`} className="mt-6 inline-flex text-sm text-accent">
            Pick another ticker
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const pair = await loadPair(left, right);
  if (!pair) notFound();
  return <CompareView left={pair.left} right={pair.right} />;
}
