import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { scoreSnapshot } from "../src/lib/score";
import type { ScoreObservation } from "../src/lib/score-history";

const REFRESH_GAP_MS = 20 * 60 * 60 * 1000;

const BASE = "https://financialmodelingprep.com/stable";
const TOP_COUNT = 8;
const LISTS = [
  { id: "sp500", name: "S&P 500", source: "sp500" },
  { id: "nasdaq100", name: "Nasdaq 100", source: "nasdaq100" },
  { id: "dow", name: "Dow Jones", source: "dow" },
] as const;

type Member = { symbol: string; name: string };
type Quote = {
  symbol?: string;
  name?: string;
  price?: number;
  marketCap?: number;
  yearLow?: number;
  yearHigh?: number;
};
type Ratios = {
  priceToEarningsRatio?: number | null;
  netProfitMargin?: number | null;
  currentRatio?: number | null;
  debtToEquityRatio?: number | null;
};
type Growth = { growthRevenue?: number | null };
type Profile = { sector?: string; industry?: string };

const key = process.env.FMP_API_KEY;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fmp<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}/${endpoint}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, { headers: { apikey: key as string } });
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 120_000) : 15_000;
      await sleep(wait);
      continue;
    }
    if (!response.ok) {
      throw new Error(`${endpoint} returned ${response.status}`);
    }
    return (await response.json()) as T;
  }
  throw new Error(`${endpoint} stayed rate limited.`);
}

function finite(value: number | null | undefined) {
  return value != null && Number.isFinite(value) ? value : null;
}

function marketSymbol(symbol: string) {
  return symbol.replace(/\./g, "-");
}

function wikiName(cell: string) {
  const labeled = cell.match(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/);
  return (labeled?.[1] ?? cell).replace(/<br\s*\/?>/gi, " ").replace(/\{\{[^}]+\}\}/g, "").trim();
}

async function wikiText(page: string) {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Wikipedia returned ${response.status} for ${page}.`);
  const payload = (await response.json()) as { parse?: { wikitext?: { "*"?: string } } };
  const text = payload.parse?.wikitext?.["*"];
  if (!text) throw new Error(`Wikipedia did not return ${page}.`);
  return text;
}

function tableRows(text: string) {
  const table = text.match(/\{\| class="wikitable sortable[^]*?\n\|\}/);
  if (!table) throw new Error("The constituent table was not found.");
  return table[0].split("\n|-").slice(1);
}

async function sp500Members(): Promise<Member[]> {
  const response = await fetch("https://raw.githubusercontent.com/datasets/s-and-p-500-companies/main/data/constituents.csv");
  if (!response.ok) throw new Error(`S&P 500 list returned ${response.status}.`);
  const lines = (await response.text()).trim().split(/\r?\n/).slice(1);
  return lines.flatMap((line) => {
    const [symbol, name] = line.split(",");
    const ticker = symbol?.trim().toUpperCase();
    if (!ticker || !name) return [];
    return [{ symbol: ticker, name: name.trim() }];
  });
}

async function nasdaqMembers(): Promise<Member[]> {
  const rows = tableRows(await wikiText("List of NASDAQ-100 companies"));
  return rows.flatMap((row) => {
    const cells = row.split("||").map((cell) => cell.trim());
    const symbol = cells[0]?.replace(/^\|/, "").trim().toUpperCase();
    if (!symbol || !/^[A-Z.]{1,6}$/.test(symbol)) return [];
    return [{ symbol, name: wikiName(cells[1] ?? symbol) }];
  });
}

async function dowMembers(): Promise<Member[]> {
  const rows = tableRows(await wikiText("List of Dow Jones Industrial Average companies"));
  return rows.flatMap((row) => {
    const symbol = row.match(/\{\{(?:NYSE|NASDAQ) link\|([A-Z.]+)\}\}/)?.[1];
    if (!symbol) return [];
    const company = row.match(/\| \[\[(?:[^\]]+\|)?([^\]]+)\]\]/)?.[1] ?? symbol;
    return [{ symbol, name: company.trim() }];
  });
}

async function membersOf(list: (typeof LISTS)[number]): Promise<Member[]> {
  if (list.source === "sp500") return sp500Members();
  if (list.source === "nasdaq100") return nasdaqMembers();
  return dowMembers();
}

async function optionalRows<T>(endpoint: string, params: Record<string, string>) {
  try {
    return await fmp<T[]>(endpoint, params);
  } catch (error) {
    if (error instanceof Error && /returned 402|returned 404/.test(error.message)) return [];
    throw error;
  }
}

function datasetIsCurrent() {
  try {
    const raw = readFileSync(path.join(process.cwd(), "src", "data", "top-rated.json"), "utf8");
    const publishedAt = Date.parse((JSON.parse(raw) as { publishedAt?: string }).publishedAt ?? "");
    return Number.isFinite(publishedAt) && Date.now() - publishedAt < REFRESH_GAP_MS;
  } catch {
    return false;
  }
}

async function main() {
  if (!process.argv.includes("--probe") && datasetIsCurrent() && !process.argv.includes("--force")) {
    console.log("The daily dataset is already current. Top Rated and the Stock Screener share the nightly publish.");
    return;
  }
  const lists = [];
  for (const list of LISTS) {
    const members = await membersOf(list);
    lists.push({ ...list, members });
    console.log(`${list.name}: ${members.length} constituents`);
  }
  if (process.argv.includes("--probe")) return;
  if (!key) throw new Error("FMP_API_KEY is not set.");

  const bySymbol = new Map<string, Member>();
  for (const list of lists) {
    for (const member of list.members) {
      if (!bySymbol.has(member.symbol)) bySymbol.set(member.symbol, member);
    }
  }
  const symbols = [...bySymbol.keys()].map(marketSymbol);
  console.log(`Unique symbols: ${symbols.length}`);

  const nameByMarket = new Map<string, string>();
  const indexesByMarket = new Map<string, string[]>();
  for (const list of lists) {
    for (const member of list.members) {
      const key = marketSymbol(member.symbol);
      if (!nameByMarket.has(key)) nameByMarket.set(key, member.name);
      const membership = indexesByMarket.get(key) ?? [];
      if (!membership.includes(list.id)) membership.push(list.id);
      indexesByMarket.set(key, membership);
    }
  }

  const scored = new Map<
    string,
    {
      symbol: string;
      name: string;
      score: number;
      band: string;
      indexes: string[];
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
      sector: string | null;
      industry: string | null;
      industryGroup: string;
      methodologyVersion: "2";
    }
  >();
  let index = 0;
  for (const symbol of symbols) {
    index += 1;
    const quote = (await optionalRows<Quote>("quote", { symbol }))[0];
    await sleep(220);
    const price = finite(quote?.price);
    if (price == null) {
      console.log(`${index}/${symbols.length} ${symbol} skipped, no price`);
      continue;
    }
    const ratios = (await optionalRows<Ratios>("ratios", { symbol, limit: "1", period: "annual" }))[0];
    await sleep(220);
    const growth = (await optionalRows<Growth>("income-statement-growth", { symbol, limit: "1", period: "annual" }))[0];
    await sleep(220);
    const profile = (await optionalRows<Profile>("profile", { symbol }))[0];
    await sleep(220);
    const result = scoreSnapshot({
      price,
      pe: finite(ratios?.priceToEarningsRatio),
      revenueGrowth: finite(growth?.growthRevenue),
      netMargin: finite(ratios?.netProfitMargin),
      currentRatio: finite(ratios?.currentRatio),
      debtToEquity: finite(ratios?.debtToEquityRatio),
      yearLow: finite(quote.yearLow),
      yearHigh: finite(quote.yearHigh),
      history: [],
      sector: profile?.sector ?? null,
      industry: profile?.industry ?? null,
      statementDate: null,
    });
    if (result.score != null && result.band) {
      const pillar = (label: string) => result.pillars.find((item) => item.label === label)?.score ?? null;
      scored.set(symbol, {
        symbol,
        name: nameByMarket.get(symbol) || quote.name || symbol,
        score: result.score,
        band: result.band,
        indexes: indexesByMarket.get(symbol) ?? [],
        price,
        marketCap: finite(quote.marketCap),
        pe: finite(ratios?.priceToEarningsRatio),
        revenueGrowth: finite(growth?.growthRevenue),
        netMargin: finite(ratios?.netProfitMargin),
        currentRatio: finite(ratios?.currentRatio),
        debtToEquity: finite(ratios?.debtToEquityRatio),
        value: pillar("Value"),
        growth: pillar("Growth"),
        quality: pillar("Quality"),
        health: pillar("Financial Health"),
        momentum: pillar("Momentum"),
        sector: profile?.sector ?? null,
        industry: profile?.industry ?? null,
        industryGroup: result.industryGroup,
        methodologyVersion: "2",
      });
    }
    if (index % 25 === 0) console.log(`${index}/${symbols.length} scored ${scored.size}`);
  }

  const published = {
    publishedAt: new Date().toISOString(),
    lists: lists.map((list) => {
      const entries = list.members
        .flatMap((member) => {
          const row = scored.get(marketSymbol(member.symbol));
          return row ? [row] : [];
        })
        .sort((left, right) => right.score - left.score || left.symbol.localeCompare(right.symbol))
        .slice(0, TOP_COUNT)
        .map((row, position) => ({
          rank: position + 1,
          symbol: row.symbol,
          name: row.name,
          score: row.score,
          band: row.band,
        }));
      return { id: list.id, name: list.name, entries };
    }),
    universe: [...scored.values()],
  };

  const destination = path.join(process.cwd(), "src", "data", "top-rated.json");
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(published, null, 2)}\n`);
  const asOf = published.publishedAt.slice(0, 10);
  const historyDestination = path.join(process.cwd(), "src", "data", "score-history.json");
  let existing: ScoreObservation[] = [];
  try {
    existing = (JSON.parse(readFileSync(historyDestination, "utf8")) as { observations?: ScoreObservation[] }).observations ?? [];
  } catch {
    existing = [];
  }
  const seen = new Set(existing.map((row) => `${row.symbol}|${row.asOf}|${row.methodologyVersion}`));
  const observations = [...existing];
  for (const row of published.universe) {
    const key = `${row.symbol}|${asOf}|2`;
    if (seen.has(key)) continue;
    observations.push({
      symbol: row.symbol,
      name: row.name,
      asOf,
      methodologyVersion: "2",
      industryGroup: row.industryGroup === "bank" || row.industryGroup === "insurance" || row.industryGroup === "reit" ? row.industryGroup : "general",
      score: row.score,
      value: row.value,
      growth: row.growth,
      quality: row.quality,
      health: row.health,
      momentum: row.momentum,
    });
  }
  writeFileSync(historyDestination, `${JSON.stringify({ observations }, null, 2)}\n`);
  for (const list of published.lists) {
    console.log(`${list.name}: published ${list.entries.length}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Ranking publish failed.");
  process.exit(1);
});
