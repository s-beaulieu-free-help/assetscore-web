import Link from "next/link";
import { RemoveFavorite } from "@/components/remove-favorite";
import { buildStockPage, getFmpSnapshot } from "@/lib/fmp";
import { loadViewer } from "@/lib/viewer";
import { formatMoney } from "@/lib/stocks";

export async function FavoritesBoard() {
  const { supabase, user } = await loadViewer();

  return (
    <section id="favorites" className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Watchlist</p>
        <h2 className="mt-4 text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] sm:text-4xl">
          Favorite stocks
        </h2>
        {!user || !supabase ? (
          <p className="mt-6 max-w-xl text-sm leading-6 text-muted">
            Sign in to save US-listed stocks here and open their dashboards later.{" "}
            <Link href="/login" className="text-foreground hover:text-accent">
              Log in
            </Link>{" "}
            or{" "}
            <Link href="/register" className="text-foreground hover:text-accent">
              register
            </Link>
            .
          </p>
        ) : (
          <FavoriteList userId={user.id} />
        )}
      </div>
    </section>
  );
}

async function FavoriteList({ userId }: { userId: string }) {
  const { supabase } = await loadViewer();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("favorite_stocks")
    .select("id, ticker")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="mt-6 text-sm text-[#f0a3a8]">{error.message}</p>;
  }
  if (!data?.length) {
    return (
      <p className="mt-6 max-w-xl text-sm leading-6 text-muted">
        No favorites yet. Open a stock and choose Add favorite.
      </p>
    );
  }

  const rows = await Promise.all(
    data.map(async (favorite) => {
      try {
        const stock = buildStockPage(await getFmpSnapshot(favorite.ticker));
        return { ...favorite, stock };
      } catch {
        return { ...favorite, stock: null };
      }
    }),
  );

  return (
    <ul className="mt-10 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
      {rows.map((row) => (
        <li key={row.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Link href={`/stocks/${row.ticker}`} className="text-lg font-medium tracking-[-0.03em] hover:text-accent">
              {row.ticker}
            </Link>
            <p className="mt-1 text-sm text-muted">{row.stock?.name ?? "Market data unavailable"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="font-mono text-sm tabular-nums">{row.stock ? formatMoney(row.stock.price) : "—"}</p>
            <p className="font-mono text-sm tabular-nums">
              {row.stock?.score == null ? "Score unavailable" : `${row.stock.score} ${row.stock.band}`}
            </p>
            <Link href={`/stocks/${row.ticker}`} className="text-sm text-foreground hover:text-accent">
              Dashboard
            </Link>
            <RemoveFavorite ticker={row.ticker} />
          </div>
        </li>
      ))}
    </ul>
  );
}
