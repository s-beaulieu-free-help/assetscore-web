import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzePortfolio, concentrationScore, herfindahl, presentPortfolio, type QualityHolding } from "./portfolio-quality";
import { canRecordSnapshot } from "./portfolio-snapshots";

function holding(overrides: Partial<QualityHolding> & Pick<QualityHolding, "ticker" | "allocation">): QualityHolding {
  return {
    name: overrides.ticker,
    score: 80,
    sector: "Technology",
    isEtf: false,
    statementDate: "2025-12-31",
    pillars: [
      { label: "Value", score: 70 },
      { label: "Growth", score: 80 },
      { label: "Quality", score: 75 },
      { label: "Financial Health", score: 85 },
      { label: "Momentum", score: 60 },
    ],
    ...overrides,
  };
}

describe("portfolio quality", () => {
  it("scores one fully allocated holding as concentrated", () => {
    const result = analyzePortfolio([holding({ ticker: "AAPL", allocation: 100, score: 90, sector: "Technology" })]);
    assert.equal(result.construction.stock.hhi, 1);
    assert.equal(result.construction.stock.effectiveHoldings, 1);
    assert.equal(result.construction.stock.score, 0);
    assert.equal(result.company.score, 90);
    assert.ok((result.construction.sizing.score ?? 100) < 50);
  });

  it("treats ten equal holdings as HHI 0.10 and 10 effective holdings", () => {
    const rows = Array.from({ length: 10 }, (_, index) =>
      holding({ ticker: `S${index}`, allocation: 10, sector: `Sector ${index}`, score: 80 }),
    );
    const result = analyzePortfolio(rows);
    assert.ok(Math.abs((result.construction.stock.hhi ?? 0) - 0.1) < 1e-10);
    assert.ok(Math.abs((result.construction.stock.effectiveHoldings ?? 0) - 10) < 1e-10);
    assert.equal(result.construction.stock.score, concentrationScore(10, 1, 12));
    assert.equal(result.company.coverage, 100);
    assert.equal(result.overall.score != null, true);
  });

  it("lowers the stock score when a few holdings dominate", () => {
    const spread = analyzePortfolio(Array.from({ length: 10 }, (_, index) => holding({ ticker: `S${index}`, allocation: 10, sector: `Sector ${index}` })));
    const concentrated = analyzePortfolio([
      holding({ ticker: "A", allocation: 70 }),
      holding({ ticker: "B", allocation: 20 }),
      holding({ ticker: "C", allocation: 10 }),
    ]);
    assert.ok((concentrated.construction.stock.score ?? 0) < (spread.construction.stock.score ?? 0));
    assert.equal(concentrated.construction.stock.top3, 100);
  });

  it("scores two equal sectors at HHI 0.50", () => {
    const rows = [
      holding({ ticker: "A", allocation: 25, sector: "Technology" }),
      holding({ ticker: "B", allocation: 25, sector: "Technology" }),
      holding({ ticker: "C", allocation: 25, sector: "Health Care" }),
      holding({ ticker: "D", allocation: 25, sector: "Health Care" }),
    ];
    const result = analyzePortfolio(rows);
    assert.ok(Math.abs((result.construction.sector.hhi ?? 0) - 0.5) < 1e-10);
    assert.ok(Math.abs((result.construction.sector.effectiveSectors ?? 0) - 2) < 1e-10);
  });

  it("lowers the sector score when one sector holds most of the portfolio", () => {
    const balanced = analyzePortfolio([
      holding({ ticker: "A", allocation: 50, sector: "Technology" }),
      holding({ ticker: "B", allocation: 50, sector: "Health Care" }),
    ]);
    const tilted = analyzePortfolio([
      holding({ ticker: "A", allocation: 80, sector: "Technology" }),
      holding({ ticker: "B", allocation: 20, sector: "Health Care" }),
    ]);
    assert.ok((tilted.construction.sector.score ?? 0) < (balanced.construction.sector.score ?? 0));
  });

  it("withholds company quality when too many scores are missing", () => {
    const result = analyzePortfolio([
      holding({ ticker: "A", allocation: 40, score: 90 }),
      holding({ ticker: "B", allocation: 60, score: null }),
    ]);
    assert.equal(result.company.score, null);
    assert.equal(result.company.coverageBand, "insufficient");
    assert.deepEqual(result.company.missing, ["B"]);
    assert.equal(result.overall.score, null);
  });

  it("withholds the sector score instead of inventing a sector", () => {
    const result = analyzePortfolio([
      holding({ ticker: "A", allocation: 40, sector: "Technology" }),
      holding({ ticker: "B", allocation: 60, sector: null }),
    ]);
    assert.equal(result.construction.sector.score, null);
    assert.deepEqual(result.construction.sector.missing, ["B"]);
    assert.equal(result.construction.score, null);
    assert.equal(result.overall.score, null);
  });

  it("keeps ETFs in concentration and out of company quality", () => {
    const result = analyzePortfolio([
      holding({ ticker: "SPY", allocation: 40, isEtf: true, score: null, sector: null }),
      holding({ ticker: "AAPL", allocation: 60, score: 88, sector: "Technology" }),
    ]);
    assert.equal(result.company.score, null);
    assert.equal(result.company.coverage, 60);
    assert.deepEqual(result.company.etfs, [{ ticker: "SPY", allocation: 40 }]);
    assert.equal(result.construction.stock.holdings, 2);
    assert.equal(result.construction.sector.missing.length, 0);
  });

  it("combines duplicate tickers before scoring", () => {
    const result = analyzePortfolio([
      holding({ ticker: "aapl", allocation: 40, score: 90, sector: "Technology" }),
      holding({ ticker: "AAPL", allocation: 60, score: 90, sector: "Technology" }),
    ]);
    assert.deepEqual(result.combinedDuplicates, ["AAPL"]);
    assert.equal(result.holdings, 1);
    assert.equal(result.construction.stock.hhi, 1);
    assert.equal(result.company.score, 90);
  });

  it("does not require allocations to total 100 and does not fill the gap", () => {
    const result = analyzePortfolio([
      holding({ ticker: "A", allocation: 40, score: 80, sector: "Technology" }),
      holding({ ticker: "B", allocation: 30, score: 70, sector: "Health Care" }),
      holding({ ticker: "C", allocation: 25, score: 60, sector: "Energy" }),
    ]);
    assert.equal(result.allocationTotal, 95);
    assert.equal(result.company.coverage, 100);
    assert.equal(result.company.score, Math.round((40 * 80 + 30 * 70 + 25 * 60) / 95));
  });

  it("accepts allocations above 100 without inventing a cap", () => {
    const result = analyzePortfolio([
      holding({ ticker: "A", allocation: 60, sector: "Technology" }),
      holding({ ticker: "B", allocation: 60, sector: "Health Care" }),
    ]);
    assert.equal(result.allocationTotal, 120);
    assert.ok((result.construction.stock.hhi ?? 0) > 0.5);
  });

  it("returns an empty assessment for no holdings", () => {
    const result = analyzePortfolio([]);
    assert.equal(result.holdings, 0);
    assert.equal(result.overall.score, null);
    assert.equal(result.company.score, null);
    assert.equal(result.construction.score, null);
  });

  it("lists a delisted holding as missing instead of scoring it zero", () => {
    const result = analyzePortfolio([
      holding({ ticker: "GONE", allocation: 100, score: null, sector: null, name: "Market data unavailable" }),
    ]);
    assert.equal(result.company.score, null);
    assert.deepEqual(result.company.missing, ["GONE"]);
    assert.ok(result.insights.some((insight) => insight.title.includes("enough scored holdings")));
  });

  it("flags a stale statement date without changing the stock score", () => {
    const result = analyzePortfolio(
      [holding({ ticker: "OLD", allocation: 100, score: 77, statementDate: "2020-01-01", sector: "Energy" })],
      null,
      new Date("2026-11-27T00:00:00Z"),
    );
    assert.equal(result.company.score, 77);
    assert.deepEqual(result.stale, [{ ticker: "OLD", statementDate: "2020-01-01" }]);
  });

  it("recalculates when an allocation changes", () => {
    const before = analyzePortfolio([
      holding({ ticker: "A", allocation: 50, score: 90, sector: "Technology" }),
      holding({ ticker: "B", allocation: 50, score: 50, sector: "Health Care" }),
    ]);
    const after = analyzePortfolio([
      holding({ ticker: "A", allocation: 80, score: 90, sector: "Technology" }),
      holding({ ticker: "B", allocation: 20, score: 50, sector: "Health Care" }),
    ]);
    assert.notEqual(before.company.score, after.company.score);
    assert.equal(after.company.score, Math.round((80 * 90 + 20 * 50) / 100));
  });

  it("drops a removed holding from the average", () => {
    const result = analyzePortfolio([holding({ ticker: "A", allocation: 100, score: 64, sector: "Energy" })]);
    assert.equal(result.holdings, 1);
    assert.equal(result.company.score, 64);
  });

  it("keeps the 60/40 blend only when both components exist", () => {
    const ready = analyzePortfolio(
      Array.from({ length: 8 }, (_, index) => holding({ ticker: `S${index}`, allocation: 12.5, score: 80, sector: `Sector ${index}` })),
    );
    assert.equal(ready.overall.score, Math.round((ready.company.score ?? 0) * 0.6 + (ready.construction.score ?? 0) * 0.4));
    const blocked = analyzePortfolio([holding({ ticker: "A", allocation: 100, score: null, sector: null })]);
    assert.equal(blocked.overall.score, null);
  });

  it("compares company quality with a stored snapshot", () => {
    const result = analyzePortfolio(
      [holding({ ticker: "A", allocation: 100, score: 84, sector: "Technology" })],
      { snapshotDate: "2026-11-01", ops: 70, cqs: 80, pcs: 55 },
    );
    assert.ok(result.insights.some((insight) => insight.category === "change" && insight.title.includes("4 points higher")));
  });

  it("does not use HHI times 100 as the concentration score", () => {
    const hhi = herfindahl(Array.from({ length: 10 }, () => 0.1));
    assert.ok(Math.abs((hhi ?? 0) - 0.1) < 1e-10);
    assert.notEqual(concentrationScore(1 / (hhi as number), 1, 12), 10);
  });

  it("keeps a full analysis when Pro access remains and a preview when it does not", () => {
    const result = analyzePortfolio([
      holding({ ticker: "A", allocation: 50, score: 90, sector: "Technology" }),
      holding({ ticker: "B", allocation: 50, score: 40, sector: "Health Care" }),
    ]);
    const free = presentPortfolio(result, false);
    assert.equal(free.company.score, result.company.score);
    assert.equal(free.company.pillars.length, 0);
    assert.equal(free.insights.length <= 1, true);
    assert.equal(presentPortfolio(result, true).company.pillars.length, result.company.pillars.length);
  });

  it("does not include another portfolio's stored snapshot in a comparison", () => {
    const own = analyzePortfolio([holding({ ticker: "A", allocation: 100, score: 70, sector: "Energy" })]);
    const compared = analyzePortfolio([holding({ ticker: "A", allocation: 100, score: 70, sector: "Energy" })], null);
    assert.equal(compared.insights.some((insight) => insight.category === "change"), false);
    assert.equal(own.company.score, compared.company.score);
    assert.equal(canRecordSnapshot("user-a", "user-b"), false);
    assert.equal(canRecordSnapshot(null, "user-a"), false);
    assert.equal(canRecordSnapshot("user-a", "user-a"), true);
  });
});
