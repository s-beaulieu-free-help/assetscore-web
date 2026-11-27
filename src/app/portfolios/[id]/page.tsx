import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { recordDailyCount } from "@/lib/analytics";
import { loadAccess } from "@/lib/billing/access";
import { DeletePortfolioButton, PortfolioEditor, type HoldingView } from "@/components/portfolio-editor";
import { PortfolioQualityView, type PortfolioHistoryPoint } from "@/components/portfolio-quality-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buildStockPage, getFmpSnapshot } from "@/lib/fmp";
import { analyzePortfolio, PORTFOLIO_METHODOLOGY_VERSION, presentPortfolio } from "@/lib/portfolio-quality";
import { recordPortfolioSnapshot } from "@/lib/portfolio-snapshots";
import { loadViewer } from "@/lib/viewer";

type PortfolioPageProps = {
  params: Promise<{ id: string }>;
};

type SnapshotRow = {
  snapshot_date: string;
  ops: number | null;
  cqs: number | null;
  pcs: number | null;
  coverage: number | null;
  sectors: { sector: string; allocation: number }[] | null;
  dimensions: { label: string; score: number | null }[] | null;
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Portfolio analysis · AssetScore", robots: { index: false, follow: false } };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { id } = await params;
  await recordDailyCount("portfolio_page_view");
  const [{ supabase, user }, access] = await Promise.all([loadViewer(), loadAccess()]);
  if (!supabase) notFound();

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, user_id, name, status")
    .eq("id", id)
    .maybeSingle();
  if (!portfolio) notFound();

  const [{ data: rows }, snapshotResult] = await Promise.all([
    supabase.from("portfolio_stocks").select("id, ticker, allocation").eq("portfolio_id", portfolio.id).order("created_at", { ascending: true }),
    supabase
      .from("portfolio_analysis_snapshots")
      .select("snapshot_date, ops, cqs, pcs, coverage, sectors, dimensions")
      .eq("portfolio_id", portfolio.id)
      .eq("methodology_version", PORTFOLIO_METHODOLOGY_VERSION)
      .order("snapshot_date", { ascending: true }),
  ]);

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
          sector: stock.sector,
          isEtf: stock.isEtf,
          statementDate: stock.statementDate,
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
          sector: null,
          isEtf: false,
          statementDate: null,
        };
      }
    }),
  );

  const stored = snapshotResult.error ? [] : ((snapshotResult.data ?? []) as SnapshotRow[]);
  const today = new Date().toISOString().slice(0, 10);
  const previousRow = [...stored].reverse().find((row) => row.snapshot_date < today);
  const analysis = analyzePortfolio(
    holdings.map((holding) => ({
      ticker: holding.ticker,
      name: holding.name,
      allocation: holding.allocation,
      score: holding.score,
      sector: holding.sector,
      isEtf: holding.isEtf,
      statementDate: holding.statementDate,
      pillars: holding.pillars,
    })),
    previousRow ? { snapshotDate: previousRow.snapshot_date, ops: previousRow.ops, cqs: previousRow.cqs, pcs: previousRow.pcs } : null,
  );
  const owner = user?.id === portfolio.user_id;
  const todayRow = stored.find((row) => row.snapshot_date === today);
  const unchanged =
    todayRow != null &&
    todayRow.ops === analysis.overall.score &&
    todayRow.cqs === analysis.company.score &&
    todayRow.pcs === analysis.construction.score &&
    (todayRow.coverage == null ? analysis.company.coverage == null : Math.abs(Number(todayRow.coverage) - (analysis.company.coverage ?? Number.NaN)) < 0.05);
  const recorded = owner && !unchanged ? await recordPortfolioSnapshot(user?.id, portfolio.user_id, portfolio.id, analysis) : false;
  const advanced = owner && access.canUseAdvancedPortfolioAnalysis;
  const visible = presentPortfolio(analysis, advanced);
  const history: PortfolioHistoryPoint[] = advanced
    ? stored.map((row) => ({
        snapshotDate: row.snapshot_date,
        ops: row.ops,
        cqs: row.cqs,
        pcs: row.pcs,
        coverage: row.coverage == null ? null : Number(row.coverage),
        sectors: Array.isArray(row.sectors) ? row.sectors : [],
        dimensions: Array.isArray(row.dimensions) ? row.dimensions : [],
      }))
    : [];
  if (recorded) {
    const fresh: PortfolioHistoryPoint = {
      snapshotDate: today,
      ops: analysis.overall.score,
      cqs: analysis.company.score,
      pcs: analysis.construction.score,
      coverage: analysis.company.coverage,
      sectors: analysis.construction.sector.allocations,
      dimensions: analysis.company.pillars,
    };
    const existing = history.findIndex((point) => point.snapshotDate === today);
    if (existing >= 0) history[existing] = fresh;
    else history.push(fresh);
  }

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
        <PortfolioQualityView analysis={visible} advanced={advanced} history={history} />
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
