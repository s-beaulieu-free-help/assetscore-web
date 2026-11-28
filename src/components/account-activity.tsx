import Link from "next/link";
import { buildStockPage, getFmpSnapshot } from "@/lib/fmp";
import { analyzePortfolio, type QualityHolding } from "@/lib/portfolio-quality";
import { loadScreenerDataset, type ScreenerRow } from "@/lib/screener";
import { loadViewer } from "@/lib/viewer";

type Evaluation = { ticker: string; created_at: string };
type Favorite = { ticker: string };
type Portfolio = { id: string; name: string; status: string; updated_at: string };
type Holding = { ticker: string; allocation: number };

export async function AccountActivity() {
  const { supabase, user } = await loadViewer();
  if (!supabase || !user) return null;

  const [evaluationsResult, favoritesResult, portfoliosResult] = await Promise.all([
    supabase.from("stock_evaluations").select("ticker, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
    supabase.from("favorite_stocks").select("ticker").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
    supabase.from("portfolios").select("id, name, status, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(1),
  ]);

  const evaluations = (evaluationsResult.data ?? []) as Evaluation[];
  const favorites = (favoritesResult.data ?? []) as Favorite[];
  const portfolio = ((portfoliosResult.data ?? []) as Portfolio[])[0] ?? null;
  const lastAnalysis = evaluations[0]?.created_at ?? null;
  const published = new Map(loadScreenerDataset().rows.map((row) => [row.symbol, row]));
  const liveBudget = { remaining: 4 };

  const favoriteScores = await Promise.all(
    favorites.map(async (favorite) => {
      const stock = await publishedOrLive(favorite.ticker, published, liveBudget);
      return { ticker: favorite.ticker, score: stock?.score ?? null, band: stock && "band" in stock ? stock.band : null };
    }),
  );

  let portfolioSummary: { name: string; href: string; score: number | null; note: string | null } | null = null;
  if (portfolio) {
    const { data: rows } = await supabase.from("portfolio_stocks").select("ticker, allocation").eq("portfolio_id", portfolio.id);
    const holdings = (rows ?? []) as Holding[];
    const quality = await Promise.all(holdings.map((holding) => qualityHolding(holding, published, liveBudget)));
    const analysis = analyzePortfolio(quality);
    portfolioSummary = {
      name: portfolio.name,
      href: `/portfolios/${portfolio.id}`,
      score: analysis.overall.score ?? analysis.company.score,
      note:
        analysis.overall.score != null
          ? analysis.overall.band
          : analysis.company.score != null
            ? "Company quality only. Open the portfolio for the full breakdown."
            : analysis.overall.reason,
    };
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-medium">Your activity</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Recent Free-plan evaluations, favorite scores from the daily dataset, and the latest portfolio score. Open a
        portfolio to see its saved history.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-line bg-card p-5">
          <h3 className="text-sm text-muted">Recent evaluations</h3>
          <p className="mt-2 text-sm text-foreground">
            {lastAnalysis
              ? `Last analysis ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(lastAnalysis))} UTC`
              : "No saved evaluation yet"}
          </p>
          {evaluations.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {evaluations.map((item) => (
                <li key={`${item.ticker}-${item.created_at}`}>
                  <Link href={`/stocks/${item.ticker}`} className="hover:text-accent">
                    {item.ticker}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted">
              Free-plan stock visits are listed here. Trial and Pro visits are not stored as a history.
            </p>
          )}
        </article>
        <article className="rounded-2xl border border-line bg-card p-5">
          <h3 className="text-sm text-muted">Favorite scores</h3>
          {favoriteScores.length ? (
            <ul className="mt-3 space-y-2 text-sm">
              {favoriteScores.map((item) => (
                <li key={item.ticker} className="flex justify-between gap-3">
                  <Link href={`/stocks/${item.ticker}`} className="hover:text-accent">
                    {item.ticker}
                  </Link>
                  <span className="font-mono tabular-nums text-muted">
                    {item.score == null ? "Unavailable" : `${item.score}${item.band ? ` ${item.band}` : ""}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted">No favorites yet.</p>
          )}
          <Link href="/favorites" className="mt-4 inline-flex text-sm text-foreground hover:text-accent">
            Open watchlist
          </Link>
        </article>
        <article className="rounded-2xl border border-line bg-card p-5">
          <h3 className="text-sm text-muted">Portfolio score</h3>
          {portfolioSummary ? (
            <>
              <p className="mt-2 text-sm">{portfolioSummary.name}</p>
              <p className="mt-2 font-mono text-2xl tabular-nums">
                {portfolioSummary.score == null ? "—" : portfolioSummary.score}
              </p>
              {portfolioSummary.note ? <p className="mt-2 text-sm leading-6 text-muted">{portfolioSummary.note}</p> : null}
              <Link href={portfolioSummary.href} className="mt-4 inline-flex text-sm text-foreground hover:text-accent">
                Open portfolio
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm leading-6 text-muted">No portfolio yet.</p>
              <Link href="/portfolios" className="mt-4 inline-flex text-sm text-foreground hover:text-accent">
                Create a portfolio
              </Link>
            </>
          )}
        </article>
      </div>
    </section>
  );
}

async function publishedOrLive(ticker: string, published: Map<string, ScreenerRow>, liveBudget: { remaining: number }) {
  const stored = published.get(ticker.toUpperCase());
  if (stored) return stored;
  if (liveBudget.remaining <= 0) return null;
  liveBudget.remaining -= 1;
  try {
    return buildStockPage(await getFmpSnapshot(ticker));
  } catch {
    return null;
  }
}

async function qualityHolding(holding: Holding, published: Map<string, ScreenerRow>, liveBudget: { remaining: number }): Promise<QualityHolding> {
  const stock = await publishedOrLive(holding.ticker, published, liveBudget);
  const pillars =
    stock && "pillars" in stock
      ? stock.pillars.map((pillar) => ({ label: pillar.label, score: pillar.score }))
      : stock
        ? [
            { label: "Value", score: stock.value },
            { label: "Growth", score: stock.growth },
            { label: "Quality", score: stock.quality },
            { label: "Financial Health", score: stock.health },
            { label: "Momentum", score: stock.momentum },
          ]
        : [];
  return {
    ticker: holding.ticker,
    name: stock?.name ?? holding.ticker,
    allocation: Number(holding.allocation),
    score: stock?.score ?? null,
    sector: stock && "sector" in stock ? stock.sector : null,
    isEtf: stock && "isEtf" in stock ? stock.isEtf : false,
    statementDate: null,
    pillars,
  };
}
