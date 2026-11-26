import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadAccess } from "@/lib/billing/access";
import { DeletePortfolioButton, PortfolioEditor, type HoldingView } from "@/components/portfolio-editor";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildStockPage, getFmpSnapshot } from "@/lib/fmp";
import { loadViewer } from "@/lib/viewer";

type PortfolioPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Portfolio · AssetScore`, description: `Portfolio ${id}` };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { id } = await params;
  const [{ supabase, user }, access] = await Promise.all([loadViewer(), loadAccess()]);
  if (!supabase) notFound();

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, user_id, name, status")
    .eq("id", id)
    .maybeSingle();
  if (!portfolio) notFound();

  const { data: rows } = await supabase
    .from("portfolio_stocks")
    .select("id, ticker, allocation")
    .eq("portfolio_id", portfolio.id)
    .order("created_at", { ascending: true });

  const holdings: HoldingView[] = await Promise.all(
    (rows ?? []).map(async (row) => {
      try {
        const stock = buildStockPage(await getFmpSnapshot(row.ticker));
        return {
          id: row.id,
          ticker: row.ticker,
          allocation: Number(row.allocation),
          name: stock.name,
          score: stock.score,
          band: stock.band,
          pillars: stock.pillars.map((pillar) => ({ label: pillar.label, score: pillar.score })),
        };
      } catch {
        return {
          id: row.id,
          ticker: row.ticker,
          allocation: Number(row.allocation),
          name: "Market data unavailable",
          score: null,
          band: null,
          pillars: [],
        };
      }
    }),
  );

  const owner = user?.id === portfolio.user_id;

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
          <Link href="/portfolios" className="hover:text-foreground">
            Portfolios
          </Link>
        </p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{portfolio.name}</h1>
        <p className="mt-4 text-sm text-muted">{portfolio.status === "complete" ? "Complete" : "Draft"}</p>
        <PortfolioEditor
          id={portfolio.id}
          name={portfolio.name}
          status={portfolio.status}
          canEdit={owner && access.canUseAdvancedPortfolioAnalysis}
          holdings={holdings}
        />
        {owner ? <DeletePortfolioButton id={portfolio.id} /> : null}
      </main>
      <SiteFooter />
    </div>
  );
}
