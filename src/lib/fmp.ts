import { formatMoney, type StockAnalysis } from "@/lib/stocks";

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

type IncomeStatement = {
  revenue?: number;
};

type Ratios = {
  priceToEarningsRatio?: number | null;
};

type IncomeGrowth = {
  growthRevenue?: number | null;
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
  volume: number | null;
  yearLow: number | null;
  yearHigh: number | null;
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

async function fmpGet<T>(path: string, symbol: string, extra?: Record<string, string>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint(path, symbol, extra), {
      headers: { apikey: apiKey() },
      next: { revalidate: 300 },
    });
  } catch {
    throw new FmpError("Financial Modeling Prep could not be reached.", 503);
  }

  if (response.status === 401 || response.status === 403) {
    throw new FmpError("Financial Modeling Prep rejected the API key.", response.status);
  }

  if (!response.ok) {
    throw new FmpError(`Financial Modeling Prep returned status ${response.status}.`, response.status);
  }

  return (await response.json()) as T;
}

async function optional<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof FmpError && (error.status === 402 || error.status === 403 || error.status === 404)) {
      return null;
    }
    throw error;
  }
}

function first<T>(rows: T[] | null | undefined) {
  return rows?.[0];
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

export async function getFmpSnapshot(symbol: string): Promise<FmpSnapshot> {
  const [profileRows, quoteRows, incomeRows, ratioRows, growthRows] = await Promise.all([
    fmpGet<Profile[]>("profile", symbol),
    optional(fmpGet<Quote[]>("quote", symbol)),
    optional(fmpGet<IncomeStatement[]>("income-statement", symbol, { limit: "1", period: "annual" })),
    optional(fmpGet<Ratios[]>("ratios", symbol, { limit: "1", period: "annual" })),
    optional(fmpGet<IncomeGrowth[]>("income-statement-growth", symbol, { limit: "1", period: "annual" })),
  ]);

  const profile = first(profileRows);
  const quote = first(quoteRows);
  if (!profile && !quote) throw new FmpNotFoundError(symbol);

  const price = quote?.price ?? profile?.price;
  if (price == null || Number.isNaN(price)) throw new FmpNotFoundError(symbol);

  const income = first(incomeRows);
  const ratios = first(ratioRows);
  const growth = first(growthRows);

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
    volume: quote?.volume ?? null,
    yearLow: quote?.yearLow ?? null,
    yearHigh: quote?.yearHigh ?? null,
  };
}

export function applyFmpSnapshot(stock: StockAnalysis, snapshot: FmpSnapshot): StockAnalysis {
  const last = stock.history.at(-1) || snapshot.price;
  const scale = last ? snapshot.price / last : 1;

  return {
    ...stock,
    ticker: snapshot.symbol,
    name: snapshot.companyName,
    exchange: snapshot.exchange,
    price: snapshot.price,
    change: snapshot.change,
    history: stock.history.map((point) => Number((point * scale).toFixed(2))),
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
  };
}
