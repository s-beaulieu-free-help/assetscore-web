import { readFileSync, statSync } from "node:fs";
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
  marginMax: number | null;
  marketCapMin: number | null;
  marketCapMax: number | null;
  priceMin: number | null;
  priceMax: number | null;
  revenueGrowthMax: number | null;
  debtToEquityMin: number | null;
  currentRatioMax: number | null;
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
  "revenueGrowth",
  "netMargin",
  "debtToEquity",
  "currentRatio",
] as const;

export type ScreenerSort = (typeof SCREENER_SORTS)[number];

export const SCREENER_PRESETS: Array<{
  id: string;
  name: string;
  description: string;
  criteria: string;
  featured: boolean;
  requires: Array<keyof ScreenerRow>;
  filters: Partial<ScreenerFilters>;
}> = [
  {
    id: "high-quality",
    name: "High quality stocks",
    description: "Companies with a strong overall AssetScore, strong profitability, and strong financial health.",
    criteria: "AssetScore at least 75, Quality at least 80, and Financial Health at least 70. A missing score is left out.",
    featured: true,
    requires: ["score", "quality", "health"],
    filters: { scoreMin: 75, qualityMin: 80, healthMin: 70 },
  },
  {
    id: "growth-leaders",
    name: "Growth leaders",
    description: "Companies with a high Growth score and annual revenue growth of at least 10%.",
    criteria: "Growth at least 80 and revenue growth at least 10%. Earnings growth is not in the published dataset, so it is not used.",
    featured: true,
    requires: ["growth", "revenueGrowth"],
    filters: { growthMin: 80, revenueGrowthMin: 0.1 },
  },
  {
    id: "financially-healthy",
    name: "Financially healthy companies",
    description: "Companies with a strong Financial Health score, a current ratio of at least 1.2, and debt-to-equity of at most 1.5.",
    criteria: "Financial Health at least 80, current ratio at least 1.2, and debt-to-equity at most 1.5. Cash flow is not in the published dataset.",
    featured: true,
    requires: ["health", "currentRatio", "debtToEquity"],
    filters: { healthMin: 80, currentRatioMin: 1.2, debtToEquityMax: 1.5 },
  },
  {
    id: "profitability-leaders",
    name: "Profitability leaders",
    description: "Companies with a high Quality score and an annual net margin of at least 15%.",
    criteria: "Quality at least 80 and net profit margin at least 15%. Operating margin, return on equity, and return on assets are not in the published dataset.",
    featured: true,
    requires: ["quality", "netMargin"],
    filters: { qualityMin: 80, marginMin: 0.15 },
  },
  {
    id: "momentum-leaders",
    name: "Momentum leaders",
    description: "Companies whose existing Momentum score is high.",
    criteria: "Momentum at least 80. The published dataset does not include a separate multi-period price return.",
    featured: true,
    requires: ["momentum"],
    filters: { momentumMin: 80 },
  },
  {
    id: "quality-price",
    name: "Quality at a reasonable price",
    description: "Companies with a strong AssetScore, solid profitability, a P/E of 25 or less, and a Growth score that is not weak.",
    criteria: "AssetScore at least 75, Quality at least 70, annual P/E at most 25, and Growth at least 50.",
    featured: true,
    requires: ["score", "quality", "pe", "growth"],
    filters: { scoreMin: 75, qualityMin: 70, peMax: 25, growthMin: 50 },
  },
  {
    id: "strong-growth",
    name: "Strong Growth Stocks",
    description: "Growth above 80 and an overall score above 70.",
    criteria: "Growth at least 80 and AssetScore at least 70.",
    featured: false,
    requires: ["score", "growth"],
    filters: { growthMin: 80, scoreMin: 70 },
  },
  {
    id: "undervalued",
    name: "Best Value Stocks",
    description: "Value above 75 and an overall score above 70.",
    criteria: "Value at least 75 and AssetScore at least 70.",
    featured: false,
    requires: ["score", "value"],
    filters: { valueMin: 75, scoreMin: 70 },
  },
  {
    id: "healthy",
    name: "Strong Financial Health",
    description: "Financial Health above 85.",
    criteria: "Financial Health at least 85.",
    featured: false,
    requires: ["health"],
    filters: { healthMin: 85 },
  },
  {
    id: "high-overall",
    name: "High Overall AssetScore",
    description: "Overall AssetScore above 85.",
    criteria: "AssetScore at least 85.",
    featured: false,
    requires: ["score"],
    filters: { scoreMin: 85 },
  },
  {
    id: "strong-profitability",
    name: "Strong Profitability",
    description: "Quality above 80, using the annual net profit margin score.",
    criteria: "Quality at least 80.",
    featured: false,
    requires: ["quality"],
    filters: { qualityMin: 80 },
  },
  {
    id: "low-pe",
    name: "Low P/E Stocks",
    description: "Annual price-to-earnings at or below 20. This is a screen setting, not a separate score.",
    criteria: "Annual P/E at most 20.",
    featured: false,
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
    marginMax: null,
    marketCapMin: null,
    marketCapMax: null,
    priceMin: null,
    priceMax: null,
    revenueGrowthMax: null,
    debtToEquityMin: null,
    currentRatioMax: null,
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

let publishedMemo: { mtimeMs: number; dataset: ReturnType<typeof datasetFromPublished> } | null = null;

export function loadScreenerDataset() {
  try {
    const file = path.join(process.cwd(), "src", "data", "top-rated.json");
    const mtimeMs = statSync(file).mtimeMs;
    if (publishedMemo && publishedMemo.mtimeMs === mtimeMs) return publishedMemo.dataset;
    const raw = readFileSync(file, "utf8");
    const dataset = datasetFromPublished(JSON.parse(raw) as PublishedFile);
    publishedMemo = { mtimeMs, dataset };
    return dataset;
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
  read("revenueGrowthMax", -5, 20);
  read("debtToEquityMax", 0, 100);
  read("debtToEquityMin", 0, 100);
  read("currentRatioMin", 0, 100);
  read("currentRatioMax", 0, 100);
  read("marginMin", -5, 5);
  read("marginMax", -5, 5);
  read("marketCapMin", 0, Number.MAX_SAFE_INTEGER);
  read("marketCapMax", 0, Number.MAX_SAFE_INTEGER);
  read("priceMin", 0, 100000);
  read("priceMax", 0, 100000);
  return filters;
}

function passesRange(value: number | null, min: number | null, max: number | null) {
  if (min == null && max == null) return true;
  if (value == null) return false;
  if (min != null && value < min) return false;
  if (max != null && value > max) return false;
  return true;
}

const RANGE_FILTERS: Array<[keyof ScreenerRow, keyof ScreenerFilters, keyof ScreenerFilters]> = [
  ["score", "scoreMin", "scoreMax"],
  ["value", "valueMin", "valueMax"],
  ["growth", "growthMin", "growthMax"],
  ["quality", "qualityMin", "qualityMax"],
  ["health", "healthMin", "healthMax"],
  ["momentum", "momentumMin", "momentumMax"],
  ["pe", "peMin", "peMax"],
  ["revenueGrowth", "revenueGrowthMin", "revenueGrowthMax"],
  ["debtToEquity", "debtToEquityMin", "debtToEquityMax"],
  ["currentRatio", "currentRatioMin", "currentRatioMax"],
  ["netMargin", "marginMin", "marginMax"],
  ["marketCap", "marketCapMin", "marketCapMax"],
  ["price", "priceMin", "priceMax"],
];

export function applyScreener(rows: ScreenerRow[], filters: ScreenerFilters, available: Set<keyof ScreenerRow>) {
  return rows.filter((row) => {
    if (filters.indexes.length === 0 || !filters.indexes.some((index) => row.indexes.includes(index))) return false;
    return RANGE_FILTERS.every(([field, minKey, maxKey]) => {
      if (field !== "score" && !available.has(field)) return true;
      const value = row[field];
      return passesRange(typeof value === "number" ? value : null, filters[minKey] as number | null, filters[maxKey] as number | null);
    });
  });
}

export function searchScreener(rows: ScreenerRow[], query: string) {
  const text = query.trim().toLowerCase();
  if (!text) return rows;
  return rows.filter((row) => row.symbol.toLowerCase().includes(text) || row.name.toLowerCase().includes(text));
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
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const requested = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePage = Math.min(pages, requested);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    page: safePage,
    pageSize: PAGE_SIZE,
    total: rows.length,
    pages,
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

export const SCREENER_NUMERIC_KEYS = [
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
  "revenueGrowthMax",
  "debtToEquityMin",
  "debtToEquityMax",
  "currentRatioMin",
  "currentRatioMax",
  "marginMin",
  "marginMax",
  "marketCapMin",
  "marketCapMax",
  "priceMin",
  "priceMax",
] as const satisfies ReadonlyArray<keyof ScreenerFilters>;

export function screenerQuery(filters: ScreenerFilters, extra: Record<string, string> = {}) {
  const params = new URLSearchParams();
  params.set("indexesSet", "1");
  if (filters.indexes.length > 0) params.set("indexes", filters.indexes.join(","));
  const numericKeys = SCREENER_NUMERIC_KEYS;
  for (const key of numericKeys) {
    const value = filters[key];
    if (typeof value === "number") params.set(key, String(value));
  }
  for (const [key, value] of Object.entries(extra)) params.set(key, value);
  return params.toString();
}

export const SCREENER_VIEWS = ["quick", "filters", "rankings", "matrix", "discovery"] as const;
export type ScreenerView = (typeof SCREENER_VIEWS)[number];

export function screenerView(value: unknown): ScreenerView {
  return SCREENER_VIEWS.includes(value as ScreenerView) ? (value as ScreenerView) : "quick";
}

export const RESULT_COLUMNS = [
  { id: "value", label: "Value", field: "value" },
  { id: "growth", label: "Growth", field: "growth" },
  { id: "quality", label: "Quality", field: "quality" },
  { id: "health", label: "Financial Health", field: "health" },
  { id: "momentum", label: "Momentum", field: "momentum" },
  { id: "marketCap", label: "Market cap", field: "marketCap" },
  { id: "indexes", label: "Indexes", field: "indexes" },
  { id: "pe", label: "P/E", field: "pe" },
  { id: "revenueGrowth", label: "Revenue growth", field: "revenueGrowth" },
  { id: "netMargin", label: "Net margin", field: "netMargin" },
  { id: "debtToEquity", label: "Debt to equity", field: "debtToEquity" },
  { id: "currentRatio", label: "Current ratio", field: "currentRatio" },
  { id: "price", label: "Price", field: "price" },
] as const;

export type ResultColumnId = (typeof RESULT_COLUMNS)[number]["id"];

export const DEFAULT_COLUMNS: ResultColumnId[] = ["growth", "health", "quality", "momentum", "marketCap", "indexes"];

export function columnsFromSearch(params: Record<string, string | string[] | undefined>): ResultColumnId[] {
  const raw = params.cols;
  const text = Array.isArray(raw) ? raw.join(",") : raw;
  if (!text) return DEFAULT_COLUMNS;
  const allowed = new Set(RESULT_COLUMNS.map((column) => column.id));
  const chosen = text
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is ResultColumnId => allowed.has(item as ResultColumnId));
  return chosen.length > 0 ? [...new Set(chosen)] : DEFAULT_COLUMNS;
}

export function sortFromStored(value: unknown) {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const sort = SCREENER_SORTS.includes(record.sort as ScreenerSort) ? (record.sort as ScreenerSort) : "score";
  const direction = record.dir === "asc" ? "asc" : "desc";
  return { sort, direction };
}

export const FILTER_HELP = {
  score: "Measures the overall quality of a company using AssetScore's existing evaluation. It is not a forecast.",
  growth: "The existing Growth score. It is based on year-over-year revenue growth.",
  health: "The existing Financial Health score. It uses the current ratio and debt compared with equity.",
  quality: "The existing Quality score. It is based on the annual net profit margin.",
  momentum: "The existing Momentum score. It places the latest price in the 52-week range.",
  value: "The existing Value score. It is based on the annual price-to-earnings ratio.",
  revenueGrowth: "How much annual revenue changed from the prior year.",
  debtToEquity: "Debt compared with equity from the latest annual figures. A higher number means more debt.",
  currentRatio: "Short-term assets compared with short-term liabilities.",
  netMargin: "Annual profit as a share of revenue.",
  pe: "The annual price-to-earnings ratio. A lower positive number means a lower price relative to earnings.",
  marketCap: "The company value from the quote stored in the daily dataset.",
  price: "The share price stored in the daily dataset. It is not a live quote.",
} as const;
