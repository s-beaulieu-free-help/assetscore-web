import { readFileSync } from "node:fs";
import path from "node:path";
import type { Access } from "@/lib/billing/entitlement";

export const SCREENER_INDEXES = [
  { id: "sp500", name: "S&P 500" },
  { id: "nasdaq100", name: "Nasdaq 100" },
  { id: "dow", name: "Dow Jones" },
] as const;

export type ScreenerIndexId = (typeof SCREENER_INDEXES)[number]["id"];

export type ScreenerRow = {
  symbol: string;
  name: string;
  score: number;
  band: string;
  indexes: ScreenerIndexId[];
  price: number | null;
  marketCap: number | null;
  pe: number | null;
  revenueGrowth: number | null;
  netMargin: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  value: number | null;
  growth: number | null;
  quality: number | null;
  health: number | null;
  momentum: number | null;
};

export type ScreenerFilters = {
  indexes: ScreenerIndexId[];
  scoreMin: number | null;
  scoreMax: number | null;
  valueMin: number | null;
  valueMax: number | null;
  growthMin: number | null;
  growthMax: number | null;
  qualityMin: number | null;
  qualityMax: number | null;
  healthMin: number | null;
  healthMax: number | null;
  momentumMin: number | null;
  momentumMax: number | null;
  peMin: number | null;
  peMax: number | null;
  revenueGrowthMin: number | null;
  debtToEquityMax: number | null;
  currentRatioMin: number | null;
  marginMin: number | null;
  marketCapMin: number | null;
};

export const SCREENER_SORTS = [
  "score",
  "symbol",
  "name",
  "price",
  "marketCap",
  "value",
  "growth",
  "quality",
  "health",
  "momentum",
  "pe",
] as const;

export type ScreenerSort = (typeof SCREENER_SORTS)[number];

export const SCREENER_PRESETS: Array<{
  id: string;
  name: string;
  description: string;
  requires: Array<keyof ScreenerRow>;
  filters: Partial<ScreenerFilters>;
}> = [
  {
    id: "high-quality",
    name: "Highest Quality Stocks",
    description: "Overall score above 75, Quality above 80, and Financial Health above 70.",
    requires: ["score", "quality", "health"],
    filters: { scoreMin: 75, qualityMin: 80, healthMin: 70 },
  },
  {
    id: "strong-growth",
    name: "Strong Growth Stocks",
    description: "Growth above 80 and an overall score above 70.",
    requires: ["score", "growth"],
    filters: { growthMin: 80, scoreMin: 70 },
  },
  {
    id: "undervalued",
    name: "Best Value Stocks",
    description: "Value above 75 and an overall score above 70.",
    requires: ["score", "value"],
    filters: { valueMin: 75, scoreMin: 70 },
  },
  {
    id: "healthy",
    name: "Strong Financial Health",
    description: "Financial Health above 85.",
    requires: ["health"],
    filters: { healthMin: 85 },
  },
  {
    id: "high-overall",
    name: "High Overall AssetScore",
    description: "Overall AssetScore above 85.",
    requires: ["score"],
    filters: { scoreMin: 85 },
  },
  {
    id: "strong-profitability",
    name: "Strong Profitability",
    description: "Quality above 80, using the annual net profit margin score.",
    requires: ["quality"],
    filters: { qualityMin: 80 },
  },
  {
    id: "low-pe",
    name: "Low P/E Stocks",
    description: "Annual price-to-earnings at or below 20. This is a screen setting, not a separate score.",
    requires: ["pe"],
    filters: { peMax: 20 },
  },
];

type PublishedFile = {
  publishedAt?: string;
  lists?: Array<{ id?: string; entries?: Array<{ symbol?: string; name?: string; score?: number; band?: string }> }>;
  universe?: Array<Partial<ScreenerRow> & { symbol?: string; indexes?: string[] }>;
};

const PAGE_SIZE = 20;

export function canUseScreener(access: Access) {
  return access.canUseScreener && (access.isTrialActive || access.plan === "pro_monthly" || access.plan === "pro_annual");
}

function emptyFilters(indexes: ScreenerIndexId[] = SCREENER_INDEXES.map((item) => item.id)): ScreenerFilters {
  return {
    indexes,
    scoreMin: null,
    scoreMax: null,
    valueMin: null,
    valueMax: null,
    growthMin: null,
    growthMax: null,
    qualityMin: null,
    qualityMax: null,
    healthMin: null,
    healthMax: null,
    momentumMin: null,
    momentumMax: null,
    peMin: null,
    peMax: null,
    revenueGrowthMin: null,
    debtToEquityMax: null,
    currentRatioMin: null,
    marginMin: null,
    marketCapMin: null,
  };
}

function asIndex(value: string | undefined): ScreenerIndexId | null {
  if (value === "sp500" || value === "nasdaq100" || value === "dow") return value;
  return null;
}

function numberOrNull(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function normalizeRow(raw: Partial<ScreenerRow> & { symbol?: string; indexes?: string[] }, fallbackIndex?: ScreenerIndexId): ScreenerRow | null {
  const symbol = raw.symbol?.trim().toUpperCase();
  if (!symbol || typeof raw.score !== "number" || !Number.isFinite(raw.score)) return null;
  const indexes = (raw.indexes ?? (fallbackIndex ? [fallbackIndex] : []))
    .map((item) => asIndex(item))
    .filter((item): item is ScreenerIndexId => item != null);
  return {
    symbol,
    name: raw.name?.trim() || symbol,
    score: raw.score,
    band: raw.band || "",
    indexes,
    price: numberOrNull(raw.price),
    marketCap: numberOrNull(raw.marketCap),
    pe: numberOrNull(raw.pe),
    revenueGrowth: numberOrNull(raw.revenueGrowth),
    netMargin: numberOrNull(raw.netMargin),
    currentRatio: numberOrNull(raw.currentRatio),
    debtToEquity: numberOrNull(raw.debtToEquity),
    value: numberOrNull(raw.value),
    growth: numberOrNull(raw.growth),
    quality: numberOrNull(raw.quality),
    health: numberOrNull(raw.health),
    momentum: numberOrNull(raw.momentum),
  };
}

export function datasetFromPublished(published: PublishedFile) {
  const rows = new Map<string, ScreenerRow>();
  if (published.universe?.length) {
    for (const raw of published.universe) {
      const row = normalizeRow(raw);
      if (!row) continue;
      const existing = rows.get(row.symbol);
      if (!existing) {
        rows.set(row.symbol, row);
        continue;
      }
      existing.indexes = [...new Set([...existing.indexes, ...row.indexes])];
    }
  } else {
    for (const list of published.lists ?? []) {
      const index = asIndex(list.id);
      if (!index) continue;
      for (const entry of list.entries ?? []) {
        const row = normalizeRow(entry, index);
        if (!row) continue;
        const existing = rows.get(row.symbol);
        if (!existing) {
          rows.set(row.symbol, row);
          continue;
        }
        if (!existing.indexes.includes(index)) existing.indexes.push(index);
      }
    }
  }
  const list = [...rows.values()];
  const numericFields = [
    "price",
    "marketCap",
    "pe",
    "revenueGrowth",
    "netMargin",
    "currentRatio",
    "debtToEquity",
    "value",
    "growth",
    "quality",
    "health",
    "momentum",
  ] as const;
  const available = new Set<keyof ScreenerRow>(["symbol", "name", "score", "band", "indexes"]);
  for (const field of numericFields) {
    if (list.some((row) => row[field] != null)) available.add(field);
  }
  return {
    publishedAt: published.publishedAt ?? null,
    rows: list,
    available,
    fullUniverse: Boolean(published.universe?.length),
  };
}

export function loadScreenerDataset() {
  try {
    const raw = readFileSync(path.join(process.cwd(), "src", "data", "top-rated.json"), "utf8");
    return datasetFromPublished(JSON.parse(raw) as PublishedFile);
  } catch {
    return { publishedAt: null, rows: [] as ScreenerRow[], available: new Set<keyof ScreenerRow>(), fullUniverse: false };
  }
}

function bound(value: number | null, min: number, max: number) {
  if (value == null || !Number.isFinite(value)) return null;
  return Math.min(max, Math.max(min, value));
}

export function filtersFromSearch(params: Record<string, string | string[] | undefined>, presetId?: string | null): ScreenerFilters {
  const preset = SCREENER_PRESETS.find((item) => item.id === presetId);
  const filters = emptyFilters();
  Object.assign(filters, preset?.filters ?? {});
  const indexParam = params.indexes;
  const requested = (Array.isArray(indexParam) ? indexParam : indexParam?.split(",") ?? [])
    .map((item) => asIndex(item.trim()))
    .filter((item): item is ScreenerIndexId => item != null);
  const indexFlag = params.indexesSet;
  const indexesWereSubmitted = (Array.isArray(indexFlag) ? indexFlag[0] : indexFlag) === "1";
  if (indexesWereSubmitted) filters.indexes = [...new Set(requested)];
  else if (requested.length > 0) filters.indexes = [...new Set(requested)];
  const read = (key: keyof ScreenerFilters, min: number, max: number) => {
    const raw = params[key];
    const text = Array.isArray(raw) ? raw[0] : raw;
    if (text == null || text === "") return;
    const value = Number(text);
    (filters[key] as number | null) = bound(value, min, max);
  };
  read("scoreMin", 0, 100);
  read("scoreMax", 0, 100);
  read("valueMin", 0, 100);
  read("valueMax", 0, 100);
  read("growthMin", 0, 100);
  read("growthMax", 0, 100);
  read("qualityMin", 0, 100);
  read("qualityMax", 0, 100);
  read("healthMin", 0, 100);
  read("healthMax", 0, 100);
  read("momentumMin", 0, 100);
  read("momentumMax", 0, 100);
  read("peMin", -1000, 1000);
  read("peMax", -1000, 1000);
  read("revenueGrowthMin", -5, 20);
  read("debtToEquityMax", 0, 100);
  read("currentRatioMin", 0, 100);
  read("marginMin", -5, 5);
  read("marketCapMin", 0, Number.MAX_SAFE_INTEGER);
  return filters;
}

function passesRange(value: number | null, min: number | null, max: number | null) {
  if (min == null && max == null) return true;
  if (value == null) return false;
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

export function applyScreener(rows: ScreenerRow[], filters: ScreenerFilters, available: Set<keyof ScreenerRow>) {
  return rows.filter((row) => {
    if (!filters.indexes.some((index) => row.indexes.includes(index))) return false;
    if (!passesRange(row.score, filters.scoreMin, filters.scoreMax)) return false;
    if (available.has("value") && !passesRange(row.value, filters.valueMin, filters.valueMax)) return false;
    if (available.has("growth") && !passesRange(row.growth, filters.growthMin, filters.growthMax)) return false;
    if (available.has("quality") && !passesRange(row.quality, filters.qualityMin, filters.qualityMax)) return false;
    if (available.has("health") && !passesRange(row.health, filters.healthMin, filters.healthMax)) return false;
    if (available.has("momentum") && !passesRange(row.momentum, filters.momentumMin, filters.momentumMax)) return false;
    if (available.has("pe") && !passesRange(row.pe, filters.peMin, filters.peMax)) return false;
    if (available.has("revenueGrowth") && filters.revenueGrowthMin != null && (row.revenueGrowth == null || row.revenueGrowth < filters.revenueGrowthMin)) {
      return false;
    }
    if (available.has("debtToEquity") && filters.debtToEquityMax != null && (row.debtToEquity == null || row.debtToEquity > filters.debtToEquityMax)) {
      return false;
    }
    if (available.has("currentRatio") && filters.currentRatioMin != null && (row.currentRatio == null || row.currentRatio < filters.currentRatioMin)) {
      return false;
    }
    if (available.has("netMargin") && filters.marginMin != null && (row.netMargin == null || row.netMargin < filters.marginMin)) return false;
    if (available.has("marketCap") && filters.marketCapMin != null && (row.marketCap == null || row.marketCap < filters.marketCapMin)) return false;
    return true;
  });
}

export function sortScreener(rows: ScreenerRow[], sort: ScreenerSort, direction: "asc" | "desc") {
  const factor = direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    const a = left[sort];
    const b = right[sort];
    if (typeof a === "number" && typeof b === "number") return (a - b) * factor;
    if (a == null) return 1;
    if (b == null) return -1;
    return String(a).localeCompare(String(b)) * factor;
  });
}

export function pageScreener(rows: ScreenerRow[], page: number) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    page: safePage,
    pageSize: PAGE_SIZE,
    total: rows.length,
    pages: Math.max(1, Math.ceil(rows.length / PAGE_SIZE)),
    rows: rows.slice(start, start + PAGE_SIZE),
  };
}

export function presetAvailable(preset: (typeof SCREENER_PRESETS)[number], available: Set<keyof ScreenerRow>) {
  return preset.requires.every((field) => available.has(field));
}

export function filtersFromStored(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const params: Record<string, string> = { indexesSet: "1" };
  if (Array.isArray(record.indexes)) params.indexes = record.indexes.filter((item) => typeof item === "string").join(",");
  for (const [key, item] of Object.entries(record)) {
    if (typeof item === "number" && Number.isFinite(item)) params[key] = String(item);
  }
  return filtersFromSearch(params);
}

export function screenerQuery(filters: ScreenerFilters, extra: Record<string, string> = {}) {
  const params = new URLSearchParams();
  params.set("indexesSet", "1");
  if (filters.indexes.length > 0) params.set("indexes", filters.indexes.join(","));
  const numericKeys: Array<keyof ScreenerFilters> = [
    "scoreMin",
    "scoreMax",
    "valueMin",
    "valueMax",
    "growthMin",
    "growthMax",
    "qualityMin",
    "qualityMax",
    "healthMin",
    "healthMax",
    "momentumMin",
    "momentumMax",
    "peMin",
    "peMax",
    "revenueGrowthMin",
    "debtToEquityMax",
    "currentRatioMin",
    "marginMin",
    "marketCapMin",
  ];
  for (const key of numericKeys) {
    const value = filters[key];
    if (typeof value === "number") params.set(key, String(value));
  }
  for (const [key, value] of Object.entries(extra)) params.set(key, value);
  return params.toString();
}
