import Link from "next/link";
import { buildStockPage, getFmpSnapshot } from "@/lib/fmp";
import { weightedPortfolioScore } from "@/lib/portfolio-score";
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

  const favoriteScores = await Promise.all(
    favorites.map(async (favorite) => {
      try {
        const stock = buildStockPage(await getFmpSnapshot(favorite.ticker));
        return { ticker: favorite.ticker, score: stock.score, band: stock.band };
      } catch {
        return { ticker: favorite.ticker, score: null, band: null };
      }
    }),
  );

  let portfolioSummary: { name: string; href: string; score: number | null; note: string | null } | null = null;
  if (portfolio) {
    const { data: rows } = await supabase
      .from("portfolio_stocks")
      .select("ticker, allocation")
      .eq("portfolio_id", portfolio.id);
    const holdings = (rows ?? []) as Holding[];
    if (holdings.length > 6) {
      portfolioSummary = {
        name: portfolio.name,
        href: `/portfolios/${portfolio.id}`,
        score: null,
        note: "Open the portfolio to see its weighted score.",
      };
    } else {
      const scored = await Promise.all(
        holdings.map(async (holding) => {
          try {
            const stock = buildStockPage(await getFmpSnapshot(holding.ticker));
            return { score: stock.score, allocation: Number(holding.allocation) };
          } catch {
            return { score: null, allocation: Number(holding.allocation) };
          }
        }),
      );
      const result = weightedPortfolioScore(scored);
      portfolioSummary = {
        name: portfolio.name,
        href: `/portfolios/${portfolio.id}`,
        score: result.score,
        note: result.reason,
      };
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-medium">Your activity</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Recent Free-plan evaluations, current favorite scores, and the latest portfolio score. Past scores are not
        stored, so changes in score or financial health are not shown.
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
