import { headers } from "next/headers";
import { cache } from "react";
import { tooManyRequests } from "@/lib/rate-limit";
import { scoreSnapshot, type Pillar } from "@/lib/score";
import { loadScreenerDataset } from "@/lib/screener";
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
    super(`No market data was found for ${symbol}.`, 404);
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
  sector?: string;
  industry?: string;
  isEtf?: boolean;
  isFund?: boolean;
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
  timestamp?: number;
};

type LightBar = {
  date?: string;
  price?: number;
};

type IncomeStatement = {
  date?: string;
  revenue?: number;
};

type Ratios = {
  date?: string;
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
  sector: string | null;
  industry: string | null;
  isEtf: boolean;
  statementDate: string | null;
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
  sector: string | null;
  industry: string | null;
  isEtf: boolean;
  industryGroup: string;
  methodologyVersion: string;
  statementDate: string | null;
};

function apiKey() {
  const key = process.env.FMP_API_KEY;
  if (!key) {
    throw new FmpError("Market data is unavailable.", 500);
  }
  return key;
}

function endpoint(path: string, params: Record<string, string>) {
  const url = new URL(`${FMP_BASE}/${path}`);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }
  return url;
}

const QUOTE_TTL_MS = 300_000;
const RESEARCH_TTL_MS = 86_400_000;
const successCache = new Map<string, { at: number; ttl: number; data: unknown }>();
let limitedUntil = 0;

function publishedFundamentals(symbol: string) {
  const row = loadScreenerDataset().rows.find((item) => item.symbol === symbol);
  if (!row) return null;
  return {
    pe: row.pe,
    revenueGrowth: row.revenueGrowth,
    netMargin: row.netMargin,
    currentRatio: row.currentRatio,
    debtToEquity: row.debtToEquity,
  };
}

async function fmpGet<T>(path: string, symbol: string, extra?: Record<string, string>, ttlMs = QUOTE_TTL_MS): Promise<T> {
  return fmpQuery<T>(path, { symbol, ...extra }, ttlMs);
}

async function fmpQuery<T>(path: string, params: Record<string, string>, ttlMs: number): Promise<T> {
  const url = endpoint(path, params);
  const cacheKey = `${ttlMs}:${url.toString()}`;
  const cached = successCache.get(cacheKey);
  if (cached && Date.now() - cached.at < cached.ttl) return cached.data as T;

  if (Date.now() < limitedUntil) {
    throw new FmpError("Market data is temporarily unavailable.", 429);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { apikey: apiKey() },
      signal: controller.signal,
      next: { revalidate: Math.round(ttlMs / 1000) },
    });
  } catch {
    throw new FmpError("Market data could not be reached.", 503);
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 429) {
    const retryAfter = Number(response.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 120_000) : 60_000;
    limitedUntil = Math.max(limitedUntil, Date.now() + waitMs);
    throw new FmpError("Market data is temporarily unavailable.", 429);
  }

  if (response.status === 401 || response.status === 403) {
    throw new FmpError("Market data is unavailable.", response.status);
  }

  if (!response.ok) {
    throw new FmpError("Market data could not be loaded.", response.status);
  }

  const data = (await response.json()) as T;
  if (successCache.size > 400) {
    const now = Date.now();
    for (const [key, entry] of successCache) {
      if (now - entry.at >= entry.ttl) successCache.delete(key);
    }
  }
  successCache.set(cacheKey, { at: Date.now(), ttl: ttlMs, data });
  return data;
}

async function requestBudget() {
  try {
    const requestHeaders = await headers();
    const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = forwarded || requestHeaders.get("x-real-ip") || "local";
    if (tooManyRequests(`fmp:${ip}`, 240, 60_000)) {
      throw new FmpError("Too many stock pages were opened in a short time. Wait a minute and try again.", 429);
    }
  } catch (error) {
    if (error instanceof FmpError) throw error;
  }
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
  await requestBudget();
  const window = historyWindow();
  const published = publishedFundamentals(symbol);
  const [profileResult, quoteResult, incomeResult, ratioResult, growthResult, historyResult] = await Promise.all([
    optional(fmpGet<Profile[]>("profile", symbol, undefined, RESEARCH_TTL_MS)),
    optional(fmpGet<Quote[]>("quote", symbol, undefined, QUOTE_TTL_MS)),
    optional(fmpGet<IncomeStatement[]>("income-statement", symbol, { limit: "1", period: "annual" }, RESEARCH_TTL_MS)),
    published
      ? Promise.resolve({ data: null as Ratios[] | null, rateLimited: false })
      : optional(fmpGet<Ratios[]>("ratios", symbol, { limit: "1", period: "annual" }, RESEARCH_TTL_MS)),
    published
      ? Promise.resolve({ data: null as IncomeGrowth[] | null, rateLimited: false })
      : optional(fmpGet<IncomeGrowth[]>("income-statement-growth", symbol, { limit: "1", period: "annual" }, RESEARCH_TTL_MS)),
    optional(fmpGet<LightBar[]>("historical-price-eod/light", symbol, window, RESEARCH_TTL_MS)),
  ]);

  const profile = first(profileResult.data);
  const quote = first(quoteResult.data);
  const scoreInputsLimited = [profileResult, quoteResult, ratioResult, growthResult].some((result) => result.rateLimited);
  if (scoreInputsLimited) throw new FmpError("Market data is temporarily unavailable.", 429);
  const rateLimited = [profileResult, quoteResult, incomeResult, ratioResult, growthResult, historyResult].some(
    (result) => result.rateLimited,
  );
  if (!profile && !quote) {
    if (rateLimited) throw new FmpError("Market data is temporarily unavailable.", 429);
    throw new FmpNotFoundError(symbol);
  }

  const price = quote?.price ?? profile?.price;
  if (price == null || Number.isNaN(price)) {
    if (rateLimited) throw new FmpError("Market data is temporarily unavailable.", 429);
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
    pe: published ? published.pe : (ratios?.priceToEarningsRatio ?? null),
    revenue: income?.revenue ?? null,
    revenueGrowth: published ? published.revenueGrowth : (growth?.growthRevenue ?? null),
    netMargin: published ? published.netMargin : (ratios?.netProfitMargin ?? null),
    currentRatio: published ? published.currentRatio : (ratios?.currentRatio ?? null),
    debtToEquity: published ? published.debtToEquity : (ratios?.debtToEquityRatio ?? null),
    volume: quote?.volume ?? null,
    yearLow: quote?.yearLow ?? null,
    yearHigh: quote?.yearHigh ?? null,
    sector: profile?.sector ?? null,
    industry: profile?.industry ?? null,
    isEtf: Boolean(profile?.isEtf || profile?.isFund || /exchange traded fund|\betf\b/i.test(profile?.industry ?? "")),
    statementDate: ratios?.date ?? income?.date ?? null,
    fetchedAt: new Date().toISOString(),
    history: normalizeHistory(historyResult.data),
  };
});

export type IndexSeries = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: PricePoint[];
  fetchedAt: string;
};

export const getIndexSeries = cache(async (symbol: string): Promise<IndexSeries | null> => {
  const window = historyWindow();
  const [quoteResult, historyResult] = await Promise.all([
    optional(fmpGet<Quote[]>("quote", symbol, undefined, QUOTE_TTL_MS)),
    optional(fmpGet<LightBar[]>("historical-price-eod/light", symbol, window, RESEARCH_TTL_MS)),
  ]);
  const quote = first(quoteResult.data);
  const price = quote?.price;
  if (price == null || Number.isNaN(price)) {
    if (quoteResult.rateLimited || historyResult.rateLimited) {
      throw new FmpError("Market data is temporarily unavailable.", 429);
    }
    return null;
  }

  return {
    symbol: quote?.symbol ?? symbol,
    name: quote?.name ?? symbol,
    price,
    change:
      quote?.previousClose != null
        ? price - quote.previousClose
        : (quote?.change ?? 0),
    history: normalizeHistory(historyResult.data),
    fetchedAt: quoteAsOf(quote, symbol),
  };
});

function quoteAsOf(quote: Quote | undefined, symbol: string) {
  const stamp = quote?.timestamp;
  if (typeof stamp === "number" && Number.isFinite(stamp) && stamp > 0) {
    const milliseconds = stamp < 1_000_000_000_000 ? stamp * 1000 : stamp;
    return new Date(milliseconds).toISOString();
  }
  const url = endpoint("quote", { symbol });
  const cached = successCache.get(`${QUOTE_TTL_MS}:${url.toString()}`);
  return new Date(cached?.at ?? Date.now()).toISOString();
}

export function buildStockPage(snapshot: FmpSnapshot): StockPageData {
  const scored = scoreSnapshot({
    ...snapshot,
    sector: snapshot.sector,
    industry: snapshot.industry,
    statementDate: snapshot.statementDate,
  });
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
    sector: snapshot.sector,
    industry: snapshot.industry,
    isEtf: snapshot.isEtf,
    industryGroup: scored.industryGroup,
    methodologyVersion: scored.methodologyVersion,
    statementDate: scored.statementDate,
  };
}
