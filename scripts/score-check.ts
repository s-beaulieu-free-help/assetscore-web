import { industryGroupFor, scoreSnapshot, type ScoreInput } from "../src/lib/score";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const base: ScoreInput = {
  price: 50,
  pe: 15,
  revenueGrowth: 0.1,
  netMargin: 0.2,
  currentRatio: 1.5,
  debtToEquity: 0.4,
  yearLow: 40,
  yearHigh: 60,
  history: [],
};

function pillar(input: ScoreInput, label: string) {
  return scoreSnapshot(input).pillars.find((item) => item.label === label);
}

const general = scoreSnapshot({ ...base, sector: "Technology", industry: "Software" });
assert(general.industryGroup === "general", "technology stays on the operating-company path");
assert(general.methodologyVersion === "2", "live scores use methodology 2");
assert(general.score != null && general.score >= 0 && general.score <= 100, "overall stays inside 0–100");
assert(pillar(base, "Value")?.score === Math.round(100 - (15 - 8) * 1.6), "value formula unchanged");
assert(pillar(base, "Growth")?.score === Math.round(50 + 0.1 * 80), "growth formula unchanged");
assert(pillar(base, "Quality")?.score === Math.round(35 + 0.2 * 140), "quality formula unchanged");
const healthParts = [Math.round(20 + 1.5 * 40), Math.round(88 - 0.4 * 18)];
assert(pillar(base, "Financial Health")?.score === Math.round((healthParts[0] + healthParts[1]) / 2), "health formula unchanged");
assert(pillar(base, "Momentum")?.score === 50, "momentum is the position in the 52-week range");

const expensive = scoreSnapshot({ ...base, pe: 500 });
assert(pillar({ ...base, pe: 500 }, "Value")?.score === 0, "extreme price-to-earnings clamps at 0");
assert(expensive.score != null && expensive.score <= 100, "extreme inputs stay inside 0–100");

const missing = scoreSnapshot({ ...base, pe: null, sector: "Consumer Defensive", industry: "Beverages" });
assert(pillar({ ...base, pe: null }, "Value")?.score == null, "missing price-to-earnings is omitted");
assert(missing.score != null, "a missing pillar does not erase the other scores");

const bankInput = { ...base, sector: "Financial Services", industry: "Banks - Diversified" };
const bank = scoreSnapshot(bankInput);
assert(industryGroupFor(bankInput.sector, bankInput.industry) === "bank", "bank industry is recognized");
assert(pillar(bankInput, "Quality")?.omitted === true && pillar(bankInput, "Quality")?.score == null, "banks do not use net margin");
assert(pillar(bankInput, "Financial Health")?.score == null, "banks do not use the current ratio or debt-to-equity");
assert(pillar(bankInput, "Value")?.score === pillar(base, "Value")?.score, "bank value still uses price-to-earnings");
assert(pillar(bankInput, "Growth")?.score === pillar(base, "Growth")?.score, "bank growth still uses revenue growth");

const insurer = scoreSnapshot({ ...base, sector: "Financial Services", industry: "Insurance - Property & Casualty" });
assert(insurer.industryGroup === "insurance", "insurance industry is recognized");
assert(insurer.pillars.filter((item) => item.score != null).every((item) => item.label !== "Quality" && item.label !== "Financial Health"), "insurers omit quality and health");

const reit = scoreSnapshot({ ...base, sector: "Real Estate", industry: "REIT - Retail" });
assert(reit.industryGroup === "reit", "reit industry is recognized");
assert(pillar({ ...base, industry: "REIT - Retail" }, "Value")?.score == null, "reits do not use price-to-earnings");
assert(pillar({ ...base, industry: "REIT - Retail" }, "Growth")?.score != null, "reits still use revenue growth");

const industrial = scoreSnapshot({ ...base, sector: "Industrials", industry: "Machinery" });
assert(industrial.score === general.score, "industrial companies use the same formulas as other operating companies");
assert(industrial.pillars.every((item) => item.score != null), "industrial companies keep all five pillars when data exists");

const assetManager = scoreSnapshot({ ...base, sector: "Financial Services", industry: "Asset Management" });
assert(assetManager.industryGroup === "general", "other financial companies stay on the operating-company path");

console.log("score checks passed");
