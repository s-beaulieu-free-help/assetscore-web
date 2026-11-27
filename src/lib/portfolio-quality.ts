/**
 * Portfolio Quality methodology version 1.
 *
 * Company Quality Score reuses each holding's existing AssetScore. It does not
 * score a company a second time. Portfolio Construction Score uses only the
 * allocations and sector labels already attached to those holdings.
 *
 * Weights and thresholds live in PORTFOLIO_QUALITY_CONFIG so a later version
 * can change them without rewriting snapshots stored under version "1".
 */

export const PORTFOLIO_METHODOLOGY_VERSION = "1";

export const PORTFOLIO_QUALITY_CONFIG = {
  version: PORTFOLIO_METHODOLOGY_VERSION,
  opsWeights: { company: 0.6, construction: 0.4 },
  constructionWeights: { stock: 0.45, sector: 0.35, sizing: 0.2 },
  coverage: { high: 90, partial: 70 },
  stockConcentration: { floorHoldings: 1, targetHoldings: 12 },
  sectorConcentration: { floorSectors: 1, targetSectors: 8, maxUnclassifiedShare: 0.3 },
  positionSizing: {
    largestPenalties: [
      { above: 20, points: 35 },
      { above: 15, points: 25 },
      { above: 10, points: 15 },
      { above: 5, points: 5 },
    ],
    perHoldingAbove20: 12,
    perHoldingAbove10: 4,
    above20Cap: 30,
    above10Cap: 20,
    top3Start: 50,
    top3Rate: 0.4,
    top3Cap: 20,
    top5Start: 90,
    top5Points: 10,
    minHoldingsForTop5: 6,
  },
  bands: [
    { min: 90, label: "Excellent" },
    { min: 80, label: "Very Good" },
    { min: 70, label: "Good" },
    { min: 60, label: "Fair" },
    { min: 40, label: "Weak" },
    { min: 0, label: "Poor" },
  ],
  staleStatementDays: 540,
} as const;

const PILLARS = ["Value", "Growth", "Quality", "Financial Health", "Momentum"] as const;

export type PillarLabel = (typeof PILLARS)[number];

export type QualityHolding = {
  ticker: string;
  name: string;
  allocation: number;
  score: number | null;
  sector: string | null;
  isEtf: boolean;
  statementDate: string | null;
  pillars: { label: string; score: number | null }[];
};

export type CoverageBand = "high" | "partial" | "insufficient" | "empty";

export type ScoreStatus = "ready" | "partial" | "unavailable";

export type PortfolioInsight = {
  category: "strength" | "concentration" | "weakness" | "change" | "opportunity";
  title: string;
  explanation: string;
};

export type PortfolioAnalysis = {
  methodologyVersion: string;
  holdings: number;
  allocationTotal: number;
  combinedDuplicates: string[];
  positions: { ticker: string; allocation: number }[];
  company: {
    score: number | null;
    status: ScoreStatus;
    coverage: number | null;
    coverageBand: CoverageBand;
    eligibleAllocation: number;
    missing: string[];
    etfs: { ticker: string; allocation: number }[];
    pillars: { label: PillarLabel; score: number | null }[];
    strongest: { ticker: string; score: number; allocation: number }[];
    weakest: { ticker: string; score: number; allocation: number }[];
  };
  construction: {
    score: number | null;
    status: ScoreStatus;
    stock: {
      score: number | null;
      holdings: number;
      hhi: number | null;
      effectiveHoldings: number | null;
      largest: { ticker: string; allocation: number } | null;
      top3: number;
      top5: number;
    };
    sector: {
      score: number | null;
      status: ScoreStatus;
      count: number;
      hhi: number | null;
      effectiveSectors: number | null;
      largest: { sector: string; allocation: number } | null;
      unclassifiedAllocation: number;
      allocations: { sector: string; allocation: number }[];
      missing: string[];
    };
    sizing: {
      score: number | null;
      over10: number;
      over20: number;
    };
  };
  overall: {
    score: number | null;
    status: ScoreStatus;
    band: string | null;
    reason: string | null;
  };
  stale: { ticker: string; statementDate: string }[];
  insights: PortfolioInsight[];
};

export type StoredSnapshot = {
  snapshotDate: string;
  ops: number | null;
  cqs: number | null;
  pcs: number | null;
};

function roundScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function scoreBand(score: number | null) {
  if (score == null) return null;
  return PORTFOLIO_QUALITY_CONFIG.bands.find((band) => score >= band.min)?.label ?? "Poor";
}

export function coverageBand(coverage: number | null): CoverageBand {
  if (coverage == null) return "empty";
  if (coverage >= PORTFOLIO_QUALITY_CONFIG.coverage.high) return "high";
  if (coverage >= PORTFOLIO_QUALITY_CONFIG.coverage.partial) return "partial";
  return "insufficient";
}

/** Higher effective holdings score higher. This is not HHI multiplied by 100. */
export function concentrationScore(effective: number | null, floor: number, target: number) {
  if (effective == null || !Number.isFinite(effective)) return null;
  if (target <= floor) return null;
  return roundScore(((effective - floor) / (target - floor)) * 100);
}

export function herfindahl(weights: number[]) {
  if (weights.length === 0) return null;
  return sum(weights.map((weight) => weight * weight));
}

function decimal(allocation: number) {
  return allocation / 100;
}

function combineDuplicates(rows: QualityHolding[]) {
  const grouped = new Map<string, QualityHolding>();
  const duplicates = new Set<string>();
  for (const row of rows) {
    const ticker = row.ticker.toUpperCase();
    const current = grouped.get(ticker);
    if (!current) {
      grouped.set(ticker, { ...row, ticker, pillars: row.pillars.map((pillar) => ({ ...pillar })) });
      continue;
    }
    duplicates.add(ticker);
    current.allocation += row.allocation;
    current.isEtf = current.isEtf || row.isEtf;
    if (current.score == null) current.score = row.score;
    else if (row.score != null && row.score !== current.score) current.score = null;
    if (!current.sector) current.sector = row.sector;
    else if (row.sector && row.sector !== current.sector) current.sector = null;
    if (!current.statementDate) current.statementDate = row.statementDate;
  }
  return { holdings: [...grouped.values()], combinedDuplicates: [...duplicates].sort() };
}

function pillarAverages(holdings: QualityHolding[]) {
  return PILLARS.map((label) => {
    const rows = holdings.flatMap((holding) => {
      if (holding.isEtf) return [];
      const pillar = holding.pillars.find((item) => item.label === label && item.score != null);
      return pillar ? [{ allocation: holding.allocation, score: pillar.score as number }] : [];
    });
    const weight = sum(rows.map((row) => row.allocation));
    if (weight <= 0) return { label, score: null as number | null };
    return { label, score: roundScore(sum(rows.map((row) => row.score * row.allocation)) / weight) };
  });
}

function positionSizingScore(allocations: number[]) {
  const rules = PORTFOLIO_QUALITY_CONFIG.positionSizing;
  const sorted = [...allocations].sort((left, right) => right - left);
  const largest = sorted[0] ?? 0;
  const top3 = sum(sorted.slice(0, 3));
  const top5 = sum(sorted.slice(0, 5));
  const over20 = sorted.filter((allocation) => allocation > 20).length;
  const over10 = sorted.filter((allocation) => allocation > 10).length;
  let score = 100;
  const largestPenalty = rules.largestPenalties.find((item) => largest > item.above);
  if (largestPenalty) score -= largestPenalty.points;
  score -= Math.min(rules.above20Cap, over20 * rules.perHoldingAbove20);
  score -= Math.min(rules.above10Cap, Math.max(0, over10 - over20) * rules.perHoldingAbove10);
  if (top3 > rules.top3Start) score -= Math.min(rules.top3Cap, (top3 - rules.top3Start) * rules.top3Rate);
  if (sorted.length >= rules.minHoldingsForTop5 && top5 > rules.top5Start) score -= rules.top5Points;
  return { score: roundScore(score), over10, over20 };
}

function topCombined(allocations: number[], count: number) {
  return sum([...allocations].sort((left, right) => right - left).slice(0, count));
}

function staleHoldings(holdings: QualityHolding[], today = new Date()) {
  const limit = PORTFOLIO_QUALITY_CONFIG.staleStatementDays * 24 * 60 * 60 * 1000;
  return holdings.flatMap((holding) => {
    if (!holding.statementDate) return [];
    const parsed = new Date(`${holding.statementDate}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime()) || today.getTime() - parsed.getTime() < limit) return [];
    return [{ ticker: holding.ticker, statementDate: holding.statementDate }];
  });
}

export function buildInsights(
  analysis: Omit<PortfolioAnalysis, "insights">,
  previous: StoredSnapshot | null,
): PortfolioInsight[] {
  const insights: PortfolioInsight[] = [];
  const quality = analysis.company.pillars.filter((pillar) => pillar.score != null && pillar.score >= 75);
  if (analysis.company.score != null && analysis.company.score >= 75 && quality.length >= 2) {
    const names = quality.map((pillar) => pillar.label.toLowerCase()).slice(0, 3).join(" and ");
    insights.push({
      category: "strength",
      title: `Company quality is supported by ${names}.`,
      explanation: `The allocation-weighted AssetScore is ${analysis.company.score}. ${quality.map((pillar) => `${pillar.label} averages ${pillar.score}`).join(". ")}.`,
    });
  }
  const largestSector = analysis.construction.sector.largest;
  if (largestSector && largestSector.allocation >= 40) {
    insights.push({
      category: "concentration",
      title: `${largestSector.sector} is ${largestSector.allocation.toFixed(0)}% of the portfolio.`,
      explanation: `That is the largest classified sector. Sector concentration uses the holdings that have a sector label and is scored ${analysis.construction.sector.score ?? "as unavailable"}.`,
    });
  }
  const largest = analysis.construction.stock.largest;
  if (largest && (largest.allocation > 20 || analysis.construction.stock.top3 >= 60)) {
    insights.push({
      category: "opportunity",
      title: "The portfolio depends on its largest holdings.",
      explanation: `${largest.ticker} is ${largest.allocation.toFixed(1)}%. The three largest holdings are ${analysis.construction.stock.top3.toFixed(1)}% combined. The top five are ${analysis.construction.stock.top5.toFixed(1)}%.`,
    });
  }
  const weakHealth = analysis.company.weakest.filter((holding) => holding.score < 60);
  if (weakHealth.length > 0) {
    const allocation = sum(weakHealth.map((holding) => holding.allocation));
    insights.push({
      category: "weakness",
      title: `${weakHealth.length} holding${weakHealth.length === 1 ? "" : "s"} score below 60.`,
      explanation: `${weakHealth.map((holding) => `${holding.ticker} at ${holding.score}`).join(", ")} represent ${allocation.toFixed(1)}% of the entered allocations. Financial Health is one of the existing AssetScore pillars, not a separate debt score.`,
    });
  }
  if (previous?.cqs != null && analysis.company.score != null && previous.cqs !== analysis.company.score) {
    const change = analysis.company.score - previous.cqs;
    insights.push({
      category: "change",
      title: `Company Quality is ${Math.abs(change)} point${Math.abs(change) === 1 ? "" : "s"} ${change > 0 ? "higher" : "lower"} than the ${previous.snapshotDate} snapshot.`,
      explanation: `The stored Company Quality Score on ${previous.snapshotDate} was ${previous.cqs}. Today's calculation is ${analysis.company.score}. Older snapshots are not recalculated.`,
    });
  }
  if (analysis.company.coverageBand === "insufficient") {
    insights.push({
      category: "weakness",
      title: "Company Quality does not have enough scored holdings.",
      explanation: `Valid AssetScores cover ${analysis.company.coverage?.toFixed(1) ?? 0}% of the entered allocations. Below ${PORTFOLIO_QUALITY_CONFIG.coverage.partial}% the Company Quality Score is withheld.`,
    });
  }
  if (analysis.company.etfs.length > 0) {
    insights.push({
      category: "opportunity",
      title: "ETF allocations are excluded from company quality.",
      explanation: `${analysis.company.etfs.map((etf) => `${etf.ticker} ${etf.allocation.toFixed(1)}%`).join(", ")}. No company score or sector is invented for an ETF.`,
    });
  }
  const order = { weakness: 0, concentration: 1, opportunity: 2, change: 3, strength: 4 };
  return insights.sort((left, right) => order[left.category] - order[right.category]).slice(0, 5);
}

export function presentPortfolio(analysis: PortfolioAnalysis, advanced: boolean) {
  if (advanced) return analysis;
  return {
    ...analysis,
    insights: analysis.insights.slice(0, 1),
    company: {
      ...analysis.company,
      pillars: [],
      strongest: [],
      weakest: [],
    },
    construction: {
      ...analysis.construction,
      sector: { ...analysis.construction.sector, allocations: [] },
    },
  };
}

export function analyzePortfolio(rows: QualityHolding[], previous: StoredSnapshot | null = null, today = new Date()): PortfolioAnalysis {
  const { holdings, combinedDuplicates } = combineDuplicates(rows.filter((row) => row.allocation > 0));
  const allocationTotal = sum(holdings.map((holding) => holding.allocation));
  const companies = holdings.filter((holding) => !holding.isEtf);
  const eligible = companies.filter((holding) => holding.score != null);
  const eligibleAllocation = sum(eligible.map((holding) => holding.allocation));
  const coverage = allocationTotal > 0 ? (eligibleAllocation / allocationTotal) * 100 : null;
  const band = coverageBand(coverage);
  const companyRaw =
    eligibleAllocation > 0 ? sum(eligible.map((holding) => (holding.score as number) * holding.allocation)) / eligibleAllocation : null;
  const companyReady = companyRaw != null && (band === "high" || band === "partial");
  const companyScore = companyReady ? roundScore(companyRaw as number) : null;
  const ranked = [...eligible].sort((left, right) => (right.score as number) - (left.score as number) || left.ticker.localeCompare(right.ticker));
  const missing = companies.filter((holding) => holding.score == null).map((holding) => holding.ticker);
  const etfs = holdings.filter((holding) => holding.isEtf).map((holding) => ({ ticker: holding.ticker, allocation: holding.allocation }));

  const weights = holdings.map((holding) => decimal(holding.allocation));
  const hhi = holdings.length > 0 ? herfindahl(weights) : null;
  const effectiveHoldings = hhi != null && hhi > 0 ? 1 / hhi : null;
  const stockScore =
    holdings.length === 0
      ? null
      : concentrationScore(
          effectiveHoldings,
          PORTFOLIO_QUALITY_CONFIG.stockConcentration.floorHoldings,
          PORTFOLIO_QUALITY_CONFIG.stockConcentration.targetHoldings,
        );
  const allocations = holdings.map((holding) => holding.allocation);
  const largestHolding = [...holdings].sort((left, right) => right.allocation - left.allocation || left.ticker.localeCompare(right.ticker))[0] ?? null;

  const classified = companies.filter((holding) => holding.sector);
  const unclassifiedAllocation = sum(holdings.filter((holding) => holding.isEtf || !holding.sector).map((holding) => holding.allocation));
  const sectorMap = new Map<string, number>();
  for (const holding of classified) {
    sectorMap.set(holding.sector as string, (sectorMap.get(holding.sector as string) ?? 0) + holding.allocation);
  }
  const sectorAllocations = [...sectorMap.entries()]
    .map(([sector, allocation]) => ({ sector, allocation }))
    .sort((left, right) => right.allocation - left.allocation || left.sector.localeCompare(right.sector));
  const unclassifiedShare = allocationTotal > 0 ? unclassifiedAllocation / allocationTotal : 1;
  const sectorReady = holdings.length > 0 && unclassifiedShare <= PORTFOLIO_QUALITY_CONFIG.sectorConcentration.maxUnclassifiedShare && sectorAllocations.length > 0;
  const sectorWeights = sectorReady ? sectorAllocations.map((item) => item.allocation / sum(sectorAllocations.map((entry) => entry.allocation))) : [];
  const sectorHhi = sectorReady ? herfindahl(sectorWeights) : null;
  const effectiveSectors = sectorHhi != null && sectorHhi > 0 ? 1 / sectorHhi : null;
  const sectorScore = sectorReady
    ? concentrationScore(
        effectiveSectors,
        PORTFOLIO_QUALITY_CONFIG.sectorConcentration.floorSectors,
        PORTFOLIO_QUALITY_CONFIG.sectorConcentration.targetSectors,
      )
    : null;
  const sizing = holdings.length === 0 ? { score: null, over10: 0, over20: 0 } : positionSizingScore(allocations);
  const constructionReady = stockScore != null && sectorScore != null && sizing.score != null;
  const constructionScore = constructionReady
    ? roundScore(
        stockScore * PORTFOLIO_QUALITY_CONFIG.constructionWeights.stock +
          (sectorScore as number) * PORTFOLIO_QUALITY_CONFIG.constructionWeights.sector +
          (sizing.score as number) * PORTFOLIO_QUALITY_CONFIG.constructionWeights.sizing,
      )
    : null;
  const overallScore =
    companyScore != null && constructionScore != null
      ? roundScore(companyScore * PORTFOLIO_QUALITY_CONFIG.opsWeights.company + constructionScore * PORTFOLIO_QUALITY_CONFIG.opsWeights.construction)
      : null;
  let overallReason: string | null = null;
  if (holdings.length === 0) overallReason = "Add at least one holding to calculate a portfolio score.";
  else if (companyScore == null) overallReason = "Company Quality is withheld because scored holdings cover less than 70% of the portfolio.";
  else if (constructionScore == null) overallReason = "Portfolio Construction is withheld because sector labels are missing for too much of the portfolio.";

  const analysis: Omit<PortfolioAnalysis, "insights"> = {
    methodologyVersion: PORTFOLIO_METHODOLOGY_VERSION,
    holdings: holdings.length,
    allocationTotal,
    combinedDuplicates,
    positions: [...holdings]
      .sort((left, right) => right.allocation - left.allocation || left.ticker.localeCompare(right.ticker))
      .map((holding) => ({ ticker: holding.ticker, allocation: holding.allocation })),
    company: {
      score: companyScore,
      status: companyScore == null ? "unavailable" : band === "partial" ? "partial" : "ready",
      coverage,
      coverageBand: band,
      eligibleAllocation,
      missing,
      etfs,
      pillars: pillarAverages(companies),
      strongest: ranked.slice(0, 3).map((holding) => ({ ticker: holding.ticker, score: holding.score as number, allocation: holding.allocation })),
      weakest: [...ranked].reverse().slice(0, 3).map((holding) => ({ ticker: holding.ticker, score: holding.score as number, allocation: holding.allocation })),
    },
    construction: {
      score: constructionScore,
      status: constructionScore == null ? "unavailable" : "ready",
      stock: {
        score: stockScore,
        holdings: holdings.length,
        hhi,
        effectiveHoldings,
        largest: largestHolding ? { ticker: largestHolding.ticker, allocation: largestHolding.allocation } : null,
        top3: topCombined(allocations, 3),
        top5: topCombined(allocations, 5),
      },
      sector: {
        score: sectorScore,
        status: sectorScore == null ? "unavailable" : "ready",
        count: sectorAllocations.length,
        hhi: sectorHhi,
        effectiveSectors,
        largest: sectorAllocations[0] ?? null,
        unclassifiedAllocation,
        allocations: sectorAllocations,
        missing: holdings.filter((holding) => !holding.isEtf && !holding.sector).map((holding) => holding.ticker),
      },
      sizing: sizing,
    },
    overall: {
      score: overallScore,
      status: overallScore == null ? "unavailable" : companyScore != null && band === "partial" ? "partial" : "ready",
      band: scoreBand(overallScore),
      reason: overallScore == null ? overallReason : null,
    },
    stale: staleHoldings(companies, today),
  };
  return { ...analysis, insights: buildInsights(analysis, previous) };
}
