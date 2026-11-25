import { cache } from "react";
import { scoreSnapshot, type Pillar } from "@/lib/score";
import { formatMoney } from "@/lib/stocks";

const FMP_BASE = "https://financialmodelingprep.com/stable";

export class FmpError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "FmpError";
    this.status = status;
  }
}

export class FmpNotFoundError extends FmpError {
  constructor(symbol: string) {
    super(`No Financial Modeling Prep profile was found for ${symbol}.`, 404);
    this.name = "FmpNotFoundError";
  }
}

type Profile = {
  symbol?: string;
  companyName?: string;
  exchange?: string;
  price?: number;
  marketCap?: number;
  change?: number;
};

type Quote = {
  symbol?: string;
  name?: string;
  price?: number;
  change?: number;
  previousClose?: number;
  marketCap?: number;
  exchange?: string;
  volume?: number;
  yearLow?: number;
  yearHigh?: number;
};

type LightBar = {
  date?: string;
  price?: number;
};

type IncomeStatement = {
  revenue?: number;
};

type Ratios = {
  priceToEarningsRatio?: number | null;
  netProfitMargin?: number | null;
  currentRatio?: number | null;
  debtToEquityRatio?: number | null;
};

type IncomeGrowth = {
  growthRevenue?: number | null;
};

export type PricePoint = {
  date: string;
  price: number;
};

export type StockMetric = {
  label: string;
  value: string;
  hint: string;
};

export type FmpSnapshot = {
  symbol: string;
  companyName: string;
  exchange: string;
  price: number;
  change: number;
  marketCap: number | null;
  pe: number | null;
  revenue: number | null;
  revenueGrowth: number | null;
  netMargin: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  volume: number | null;
  yearLow: number | null;
  yearHigh: number | null;
  fetchedAt: string;
  history: PricePoint[];
};

export type StockPageData = {
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  fetchedAt: string;
  history: PricePoint[];
  metrics: StockMetric[];
  score: number | null;
  band: string | null;
  pillars: Pillar[];
  reasons: string[];
};

function apiKey() {
  const key = process.env.FMP_API_KEY;
  if (!key) {
    throw new FmpError("Market data is unavailable because FMP_API_KEY is not set.", 500);
  }
  return key;
}

function endpoint(path: string, symbol: string, extra?: Record<string, string>) {
  const url = new URL(`${FMP_BASE}/${path}`);
  url.searchParams.set("symbol", symbol);
  for (const [name, value] of Object.entries(extra ?? {})) {
    url.searchParams.set(name, value);
  }
  return url;
}

const successCache = new Map<string, { at: number; data: unknown }>();
const SUCCESS_TTL_MS = 300_000;
let limitedUntil = 0;

async function fmpGet<T>(path: string, symbol: string, extra?: Record<string, string>): Promise<T> {
  const url = endpoint(path, symbol, extra);
  const cacheKey = url.toString();
  const cached = successCache.get(cacheKey);
  if (cached && Date.now() - cached.at < SUCCESS_TTL_MS) return cached.data as T;

  if (Date.now() < limitedUntil) {
    throw new FmpError("Financial Modeling Prep returned status 429.", 429);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { apikey: apiKey() },
      next: { revalidate: 300 },
    });
  } catch {
    throw new FmpError("Financial Modeling Prep could not be reached.", 503);
  }

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 120_000) : 60_000;
    limitedUntil = Math.max(limitedUntil, Date.now() + waitMs);
    throw new FmpError("Financial Modeling Prep returned status 429.", 429);
  }

  if (response.status === 401 || response.status === 403) {
    throw new FmpError("Financial Modeling Prep rejected the API key.", response.status);
  }

  if (!response.ok) {
    throw new FmpError(`Financial Modeling Prep returned status ${response.status}.`, response.status);
  }

  const data = (await response.json()) as T;
  successCache.set(cacheKey, { at: Date.now(), data });
  return data;
}

async function optional<T>(request: Promise<T>): Promise<{ data: T | null; rateLimited: boolean }> {
  try {
    return { data: await request, rateLimited: false };
  } catch (error) {
    if (error instanceof FmpError && error.status === 429) return { data: null, rateLimited: true };
    if (error instanceof FmpError && (error.status === 402 || error.status === 404)) {
      return { data: null, rateLimited: false };
    }
    throw error;
  }
}

function first<T>(rows: T[] | null | undefined) {
  return rows?.[0];
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function historyWindow() {
  const to = new Date();
  const from = new Date(to);
  from.setUTCMonth(from.getUTCMonth() - 18);
  return { from: isoDate(from), to: isoDate(to) };
}

function normalizeHistory(rows: LightBar[] | null): PricePoint[] {
  if (!rows) return [];
  return rows
    .flatMap((row) => {
      if (!row.date || row.price == null || !Number.isFinite(row.price)) return [];
      return [{ date: row.date, price: row.price }];
    })
    .sort((left, right) => left.date.localeCompare(right.date));
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatGrowth(value: number) {
  const percent = value * 100;
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(1)}%`;
}

export const getFmpSnapshot = cache(async (symbol: string): Promise<FmpSnapshot> => {
  const window = historyWindow();
  const [profileResult, quoteResult, incomeResult, ratioResult, growthResult, historyResult] = await Promise.all([
    optional(fmpGet<Profile[]>("profile", symbol)),
    optional(fmpGet<Quote[]>("quote", symbol)),
    optional(fmpGet<IncomeStatement[]>("income-statement", symbol, { limit: "1", period: "annual" })),
    optional(fmpGet<Ratios[]>("ratios", symbol, { limit: "1", period: "annual" })),
    optional(fmpGet<IncomeGrowth[]>("income-statement-growth", symbol, { limit: "1", period: "annual" })),
    optional(fmpGet<LightBar[]>("historical-price-eod/light", symbol, window)),
  ]);

  const profile = first(profileResult.data);
  const quote = first(quoteResult.data);
  const rateLimited = [profileResult, quoteResult, incomeResult, ratioResult, growthResult, historyResult].some(
    (result) => result.rateLimited,
  );
  if (!profile && !quote) {
    if (rateLimited) throw new FmpError("Financial Modeling Prep returned status 429.", 429);
    throw new FmpNotFoundError(symbol);
  }

  const price = quote?.price ?? profile?.price;
  if (price == null || Number.isNaN(price)) {
    if (rateLimited) throw new FmpError("Financial Modeling Prep returned status 429.", 429);
    throw new FmpNotFoundError(symbol);
  }

  const income = first(incomeResult.data);
  const ratios = first(ratioResult.data);
  const growth = first(growthResult.data);

  return {
    symbol: profile?.symbol ?? quote?.symbol ?? symbol,
    companyName: profile?.companyName ?? quote?.name ?? symbol,
    exchange: profile?.exchange ?? quote?.exchange ?? "—",
    price,
    change:
      quote?.previousClose != null
        ? price - quote.previousClose
        : (quote?.change ?? profile?.change ?? 0),
    marketCap: quote?.marketCap ?? profile?.marketCap ?? null,
    pe: ratios?.priceToEarningsRatio ?? null,
    revenue: income?.revenue ?? null,
    revenueGrowth: growth?.growthRevenue ?? null,
    netMargin: ratios?.netProfitMargin ?? null,
    currentRatio: ratios?.currentRatio ?? null,
    debtToEquity: ratios?.debtToEquityRatio ?? null,
    volume: quote?.volume ?? null,
    yearLow: quote?.yearLow ?? null,
    yearHigh: quote?.yearHigh ?? null,
    fetchedAt: new Date().toISOString(),
    history: normalizeHistory(historyResult.data),
  };
});

export function buildStockPage(snapshot: FmpSnapshot): StockPageData {
  const scored = scoreSnapshot(snapshot);
  return {
    ticker: snapshot.symbol,
    name: snapshot.companyName,
    exchange: snapshot.exchange,
    price: snapshot.price,
    change: snapshot.change,
    fetchedAt: snapshot.fetchedAt,
    history: snapshot.history,
    metrics: [
      {
        label: "Market cap",
        value: snapshot.marketCap == null ? "—" : formatCompact(snapshot.marketCap),
        hint: "Latest quote",
      },
      {
        label: "P/E",
        value: snapshot.pe == null || !Number.isFinite(snapshot.pe) ? "—" : snapshot.pe.toFixed(1),
        hint: "Latest annual",
      },
      {
        label: "Revenue",
        value: snapshot.revenue == null ? "—" : formatCompact(snapshot.revenue),
        hint: "Latest fiscal year",
      },
      {
        label: "Revenue growth",
        value: snapshot.revenueGrowth == null ? "—" : formatGrowth(snapshot.revenueGrowth),
        hint: "Year over year",
      },
      {
        label: "Volume",
        value: snapshot.volume == null ? "—" : formatCount(snapshot.volume),
        hint: "Latest session",
      },
      {
        label: "52-week range",
        value:
          snapshot.yearLow == null || snapshot.yearHigh == null
            ? "—"
            : `${formatMoney(snapshot.yearLow)} – ${formatMoney(snapshot.yearHigh)}`,
        hint: "Quote",
      },
    ],
    score: scored.score,
    band: scored.band,
    pillars: scored.pillars,
    reasons: scored.reasons,
  };
}
