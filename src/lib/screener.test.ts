import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { entitlementFromRow, freeAccess, type SubscriptionRow } from "./billing/entitlement";
import { discoverStocks, matrixPoints, quadrantFor } from "./screener-discovery";
import {
  SCREENER_INDEXES,
  SCREENER_SORTS,
  applyScreener,
  canUseScreener,
  columnsFromSearch,
  datasetFromPublished,
  filtersFromSearch,
  loadScreenerDataset,
  pageScreener,
  searchScreener,
  sortScreener,
  type ScreenerFilters,
  type ScreenerRow,
} from "./screener";

function row(overrides: Partial<ScreenerRow> & Pick<ScreenerRow, "symbol" | "score">): ScreenerRow {
  return {
    name: overrides.symbol,
    band: "Solid",
    indexes: ["sp500"],
    price: 100,
    marketCap: 1_000_000_000,
    pe: 20,
    revenueGrowth: 0.1,
    netMargin: 0.2,
    currentRatio: 1.5,
    debtToEquity: 0.4,
    value: 70,
    growth: 70,
    quality: 70,
    health: 70,
    momentum: 70,
    ...overrides,
  };
}

function filters(overrides: Partial<ScreenerFilters> = {}): ScreenerFilters {
  return filtersFromSearch({ indexes: "sp500,nasdaq100,dow", indexesSet: "1", ...Object.fromEntries(Object.entries(overrides).map(([key, value]) => [key, String(value)])) });
}

const available = new Set<keyof ScreenerRow>(["symbol", "name", "score", "band", "indexes", "pe", "growth", "health", "quality", "momentum", "revenueGrowth", "netMargin", "debtToEquity", "currentRatio", "marketCap", "price", "value"]);

describe("screener v2", () => {
  it("keeps the published universe inside the three indexes and removes duplicate symbols", () => {
    const dataset = loadScreenerDataset();
    const allowed = new Set(SCREENER_INDEXES.map((index) => index.id));
    assert.ok(dataset.rows.length > 100);
    assert.equal(new Set(dataset.rows.map((item) => item.symbol)).size, dataset.rows.length);
    for (const item of dataset.rows) {
      assert.ok(item.indexes.length > 0);
      assert.ok(item.indexes.every((index) => allowed.has(index)));
    }
    const shared = dataset.rows.find((item) => item.indexes.length > 1);
    assert.ok(shared);
  });

  it("filters by one index and by AssetScore, growth, health, quality, and momentum", () => {
    const rows = [
      row({ symbol: "A", score: 90, indexes: ["sp500"], growth: 90, health: 90, quality: 90, momentum: 90 }),
      row({ symbol: "B", score: 40, indexes: ["dow"], growth: 40, health: 40, quality: 40, momentum: 40 }),
    ];
    assert.deepEqual(applyScreener(rows, filters({ indexes: ["dow"] as never }), available).map((item) => item.symbol), ["B"]);
    assert.deepEqual(applyScreener(rows, filters({ scoreMin: 80 }), available).map((item) => item.symbol), ["A"]);
    assert.deepEqual(applyScreener(rows, filters({ growthMin: 80 }), available).map((item) => item.symbol), ["A"]);
    assert.deepEqual(applyScreener(rows, filters({ healthMin: 80 }), available).map((item) => item.symbol), ["A"]);
    assert.deepEqual(applyScreener(rows, filters({ qualityMin: 80 }), available).map((item) => item.symbol), ["A"]);
    assert.deepEqual(applyScreener(rows, filters({ momentumMin: 80 }), available).map((item) => item.symbol), ["A"]);
  });

  it("does not treat a missing valuation as zero and combines filters with AND", () => {
    const rows = [row({ symbol: "MISS", pe: null, score: 90 }), row({ symbol: "CHEAP", pe: 12, score: 90, growth: 40 })];
    assert.deepEqual(applyScreener(rows, filters({ peMax: 15 }), available).map((item) => item.symbol), ["CHEAP"]);
    assert.deepEqual(applyScreener(rows, filters({ peMax: 15, growthMin: 80 }), available).map((item) => item.symbol), []);
  });

  it("sorts in both directions, paginates, and returns an empty page without inventing rows", () => {
    const rows = [row({ symbol: "B", score: 60 }), row({ symbol: "A", score: 90 })];
    assert.deepEqual(sortScreener(rows, "score", "desc").map((item) => item.symbol), ["A", "B"]);
    assert.deepEqual(sortScreener(rows, "score", "asc").map((item) => item.symbol), ["B", "A"]);
    const paged = pageScreener(rows, 2);
    assert.equal(paged.page, 2);
    assert.equal(paged.rows.length, 0);
    assert.equal(paged.total, 2);
    assert.deepEqual(applyScreener([], filters(), available), []);
  });

  it("ignores filter names that are not in the approved list", () => {
    const parsed = filtersFromSearch({ scoreMin: "80", "row.score); drop table": "1", sort: "not-a-column" });
    assert.equal(parsed.scoreMin, 80);
    assert.equal(SCREENER_SORTS.includes("not-a-column" as never), false);
    assert.deepEqual(columnsFromSearch({ cols: "growth,secret,quality" }), ["growth", "quality"]);
  });

  it("gives trial users Pro access and removes it when the trial or subscription has expired", () => {
    const base = {
      user_id: "user",
      plan: "free",
      status: "free",
      trial_started_at: null,
      trial_ends_at: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false,
    } satisfies SubscriptionRow;
    const now = Date.parse("2026-11-27T00:00:00Z");
    const trial = entitlementFromRow({ ...base, plan: "trial", status: "trialing", trial_ends_at: "2026-12-27T00:00:00Z" }, now);
    const expired = entitlementFromRow({ ...base, plan: "free", status: "free", trial_ends_at: "2026-11-01T00:00:00Z" }, now);
    assert.equal(canUseScreener(trial), true);
    assert.equal(canUseScreener(freeAccess()), false);
    assert.equal(canUseScreener(expired), false);
  });

  it("places quality and momentum into quadrants and skips missing scores", () => {
    const rows = [
      row({ symbol: "HH", score: 80, quality: 90, momentum: 90 }),
      row({ symbol: "HL", score: 80, quality: 90, momentum: 40 }),
      row({ symbol: "LH", score: 80, quality: 40, momentum: 90 }),
      row({ symbol: "LL", score: 80, quality: 40, momentum: 40 }),
      row({ symbol: "NA", score: 80, quality: null, momentum: 90 }),
    ];
    assert.equal(quadrantFor(rows[0]), "hh");
    const matrix = matrixPoints(rows);
    assert.equal(matrix.counts.hh, 1);
    assert.equal(matrix.counts.hl, 1);
    assert.equal(matrix.counts.lh, 1);
    assert.equal(matrix.counts.ll, 1);
    assert.equal(matrix.missing, 1);
  });

  it("does not invent an improving-earnings list or a change from one snapshot", () => {
    const rows = [row({ symbol: "A", score: 90, quality: 90, momentum: 40, debtToEquity: 3, netMargin: 0.3 })];
    const found = discoverStocks(rows, [{ symbol: "A", asOf: "2026-11-26", methodologyVersion: "2", growth: 50, health: 50 }]);
    const earnings = found.find((item) => item.id === "improving-earnings");
    const growth = found.find((item) => item.id === "improving-growth");
    assert.equal(earnings?.available, false);
    assert.equal(earnings?.rows.length, 0);
    assert.equal(growth?.available, false);
    const compared = discoverStocks(rows, [
      { symbol: "A", asOf: "2026-11-25", methodologyVersion: "2", growth: 40, health: 40 },
      { symbol: "A", asOf: "2026-11-26", methodologyVersion: "2", growth: 55, health: 40 },
    ]);
    assert.equal(compared.find((item) => item.id === "improving-growth")?.rows[0]?.symbol, "A");
  });

  it("searches by ticker and company without adding a symbol outside the supplied rows", () => {
    const rows = [row({ symbol: "AAPL", score: 70, name: "Apple Inc." }), row({ symbol: "KO", score: 70, name: "Coca-Cola" })];
    assert.deepEqual(searchScreener(rows, "apple").map((item) => item.symbol), ["AAPL"]);
    assert.deepEqual(searchScreener(rows, "ZZZZ"), []);
  });

  it("reads the published file without calling a market-data client", () => {
    const source = readFileSync(new URL("./screener.ts", import.meta.url), "utf8");
    assert.equal(source.includes("financialmodelingprep"), false);
    assert.equal(source.includes("getFmpSnapshot"), false);
    const started = Date.now();
    const dataset = loadScreenerDataset();
    applyScreener(dataset.rows, filters({ scoreMin: 70, qualityMin: 60 }), dataset.available);
    assert.ok(Date.now() - started < 1000);
  });

  it("keeps a stock that appears on two index lists as one row", () => {
    const dataset = datasetFromPublished({
      lists: [
        { id: "sp500", entries: [{ symbol: "MU", name: "Micron", score: 85, band: "Strong" }] },
        { id: "nasdaq100", entries: [{ symbol: "MU", name: "Micron", score: 85, band: "Strong" }] },
      ],
    });
    assert.equal(dataset.rows.length, 1);
    assert.deepEqual(dataset.rows[0]?.indexes, ["sp500", "nasdaq100"]);
    assert.equal(dataset.rows[0]?.pe, null);
  });
});
