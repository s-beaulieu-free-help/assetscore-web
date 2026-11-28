import type { Metadata } from "next";
import Link from "next/link";
import { FavoriteList } from "@/components/favorites-board";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { loadViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Favorites · AssetScore" };

export default async function FavoritesPage() {
  const { user } = await loadViewer();

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Watchlist</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Favorite stocks</h1>
        {user ? (
          <>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
              Stocks you save from a dashboard. Scores come from the same live market data as the stock pages.
            </p>
            <FavoriteList userId={user.id} />
          </>
        ) : (
          <p className="mt-6 max-w-xl text-sm leading-6 text-muted">
            Favorites are available after you{" "}
            <Link href="/login" className="text-foreground hover:text-accent">
              log in
            </Link>
            . The first stock you open stays available without an account.
          </p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
