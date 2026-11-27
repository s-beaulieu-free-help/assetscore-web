import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { PORTFOLIO_METHODOLOGY_VERSION, type PortfolioAnalysis } from "@/lib/portfolio-quality";

export function canRecordSnapshot(viewerId: string | null | undefined, ownerId: string) {
  return Boolean(viewerId) && viewerId === ownerId;
}

export async function recordPortfolioSnapshot(viewerId: string | null | undefined, ownerId: string, portfolioId: string, analysis: PortfolioAnalysis) {
  if (!canRecordSnapshot(viewerId, ownerId) || analysis.holdings === 0) return false;
  const admin = createSupabaseAdmin();
  if (!admin) return false;
  const snapshotDate = new Date().toISOString().slice(0, 10);
  const { error } = await admin.from("portfolio_analysis_snapshots").upsert(
    {
      portfolio_id: portfolioId,
      snapshot_date: snapshotDate,
      methodology_version: PORTFOLIO_METHODOLOGY_VERSION,
      ops: analysis.overall.score,
      cqs: analysis.company.score,
      pcs: analysis.construction.score,
      coverage: analysis.company.coverage,
      company_status: analysis.company.status,
      construction_status: analysis.construction.status,
      overall_status: analysis.overall.status,
      dimensions: analysis.company.pillars,
      sectors: analysis.construction.sector.allocations,
      largest: {
        holding: analysis.construction.stock.largest,
        sector: analysis.construction.sector.largest,
        top3: analysis.construction.stock.top3,
        top5: analysis.construction.stock.top5,
      },
      detail: {
        coverageBand: analysis.company.coverageBand,
        stockScore: analysis.construction.stock.score,
        sectorScore: analysis.construction.sector.score,
        sizingScore: analysis.construction.sizing.score,
        hhi: analysis.construction.stock.hhi,
        effectiveHoldings: analysis.construction.stock.effectiveHoldings,
        effectiveSectors: analysis.construction.sector.effectiveSectors,
        unclassifiedAllocation: analysis.construction.sector.unclassifiedAllocation,
        allocationTotal: analysis.allocationTotal,
        missingScores: analysis.company.missing,
        missingSectors: analysis.construction.sector.missing,
        etfs: analysis.company.etfs,
      },
    },
    { onConflict: "portfolio_id,snapshot_date,methodology_version" },
  );
  return !error;
}
