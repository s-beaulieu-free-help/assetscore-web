import { entitlementFromRow, type SubscriptionRow } from "../src/lib/billing/entitlement";
import {
  applyScreener,
  canUseScreener,
  datasetFromPublished,
  filtersFromSearch,
  loadScreenerDataset,
  pageScreener,
  presetAvailable,
  SCREENER_PRESETS,
  type ScreenerRow,
} from "../src/lib/screener";

function row(partial: Partial<SubscriptionRow>): SubscriptionRow {
  return {
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
    ...partial,
  };
}

const now = Date.parse("2026-11-25T00:00:00Z");
const future = new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString();
const past = new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString();

const trial = entitlementFromRow(row({ plan: "trial", status: "trialing", trial_ends_at: future }), now);
const monthly = entitlementFromRow(row({ plan: "pro_monthly", status: "active", current_period_end: future }), now);
const annual = entitlementFromRow(row({ plan: "pro_annual", status: "active", current_period_end: future }), now);
const free = entitlementFromRow(row({ plan: "free", status: "free" }), now);
const expiredTrial = entitlementFromRow(row({ plan: "free", status: "free", trial_ends_at: past }), now);
const expiredPaid = entitlementFromRow(
  row({ plan: "pro_monthly", status: "active", current_period_end: past, trial_ends_at: past }),
  now,
);

if (!canUseScreener(trial) || !canUseScreener(monthly) || !canUseScreener(annual)) {
  throw new Error("Trial and active Pro plans should open the screener.");
}
if (canUseScreener(free) || canUseScreener(expiredTrial) || canUseScreener(expiredPaid)) {
  throw new Error("Free, expired trial, and expired paid plans should not open the screener.");
}

const sample: ScreenerRow[] = [
  {
    symbol: "MU",
    name: "Micron",
    score: 85,
    band: "Strong",
    indexes: ["sp500", "nasdaq100"],
    price: null,
    marketCap: null,
    pe: null,
    revenueGrowth: null,
    netMargin: null,
    currentRatio: null,
    debtToEquity: null,
    value: null,
    growth: null,
    quality: null,
    health: null,
    momentum: null,
  },
  {
    symbol: "LOW",
    name: "Low Score",
    score: 40,
    band: "Weak",
    indexes: ["dow"],
    price: null,
    marketCap: null,
    pe: null,
    revenueGrowth: null,
    netMargin: null,
    currentRatio: null,
    debtToEquity: null,
    value: null,
    growth: null,
    quality: null,
    health: null,
    momentum: null,
  },
];

const available = new Set<keyof ScreenerRow>(["symbol", "name", "score", "band", "indexes"]);
const high = applyScreener(sample, filtersFromSearch({ preset: "high-overall" }, "high-overall"), available);
if (high.length !== 1 || high[0]?.symbol !== "MU") throw new Error("Overall score filter failed.");
const deduped = datasetFromPublished({
  lists: [
    { id: "sp500", entries: [{ symbol: "MU", name: "Micron", score: 85, band: "Strong" }] },
    { id: "nasdaq100", entries: [{ symbol: "MU", name: "Micron", score: 85, band: "Strong" }] },
  ],
});
const micron = deduped.rows.find((item) => item.symbol === "MU");
if (!micron || micron.indexes.length !== 2) throw new Error("A stock in two indexes should appear once.");
if (deduped.available.has("pe") || micron.pe === 0) throw new Error("Missing metrics must stay unavailable.");
const highPreset = SCREENER_PRESETS.find((preset) => preset.id === "high-overall");
const qualityPreset = SCREENER_PRESETS.find((preset) => preset.id === "high-quality");
if (!highPreset || !qualityPreset) throw new Error("Presets missing.");
if (!presetAvailable(highPreset, available) || presetAvailable(qualityPreset, available)) {
  throw new Error("Only presets backed by stored fields should be available.");
}
const paged = pageScreener(sample, 1);
if (paged.rows.length !== 2) throw new Error("Pagination should return the filtered page.");

const published = loadScreenerDataset();
const liveMicron = published.rows.find((item) => item.symbol === "MU");
if (!liveMicron || liveMicron.score !== 85 || liveMicron.indexes.length < 2) {
  throw new Error("The published Top Rated snapshot should feed the screener without a new data pull.");
}

console.log("screener checks passed");
