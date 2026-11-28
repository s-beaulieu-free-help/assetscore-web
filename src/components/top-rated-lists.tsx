import { readFileSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { scoreTextClass } from "@/lib/score";

type RankedStock = {
  rank: number;
  symbol: string;
  name: string;
  score: number;
  band: string;
};

type PublishedRanking = {
  publishedAt: string;
  lists: Array<{ id: string; name: string; entries: RankedStock[] }>;
};

const fallbackLists = [
  { id: "sp500", name: "S&P 500", entries: [] },
  { id: "nasdaq100", name: "Nasdaq 100", entries: [] },
  { id: "dow", name: "Dow Jones", entries: [] },
];

function publishedRanking(): PublishedRanking | null {
  try {
    const raw = readFileSync(path.join(process.cwd(), "src", "data", "top-rated.json"), "utf8");
    return JSON.parse(raw) as PublishedRanking;
  } catch {
    return null;
  }
}

export function TopRatedLists() {
  const published = publishedRanking();
  const lists = published?.lists?.length ? published.lists : fallbackLists;
  const publishedLabel = published?.publishedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
      }).format(new Date(published.publishedAt))
    : null;

  return (
    <section id="top-rated" className="scroll-mt-24 border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Discover</p>
        <h2 className="mt-4 max-w-xl text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-4xl">
          Top Rated
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
          These lists are published from the daily ranking.
          {publishedLabel ? ` Published ${publishedLabel}.` : ""} Scores use the same annual figures and quote as the stock page.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {lists.map((list) => (
            <article key={list.id} className="rounded-2xl border border-line bg-card px-6 py-7">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-xl font-medium tracking-[-0.03em]">{list.name}</h3>
                {list.id === "sp500" || list.id === "nasdaq100" || list.id === "dow" ? (
                  <Link
                    href={list.id === "dow" ? "/rankings/dow-jones" : `/rankings/${list.id}`}
                    className="text-xs text-muted hover:text-accent"
                  >
                    Full ranking
                  </Link>
                ) : null}
              </div>
              {list.entries.length === 0 ? (
                <p className="mt-4 text-sm leading-6 text-muted">No ranking has been published yet.</p>
              ) : (
                <ol className="mt-5 divide-y divide-line">
                  {list.entries.map((entry) => (
                    <li key={entry.symbol}>
                      <Link
                        href={`/stocks/${entry.symbol}`}
                        className="flex items-baseline justify-between gap-3 py-3 transition hover:text-accent"
                      >
                        <span className="min-w-0">
                          <span className="font-mono text-xs text-muted">{entry.rank}</span>
                          <span className="ml-3 font-medium">{entry.symbol}</span>
                          <span className="mt-1 block truncate text-sm text-muted">{entry.name}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className={`block font-mono text-sm tabular-nums ${scoreTextClass(entry.score)}`}>{entry.score}</span>
                          <span className="block text-xs text-muted">{entry.band}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
