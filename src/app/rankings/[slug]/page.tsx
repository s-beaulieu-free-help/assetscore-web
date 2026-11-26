import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { rankedIndex, rankingPage, RANKING_PAGES } from "@/lib/rankings";

type RankingPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return RANKING_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: RankingPageProps): Promise<Metadata> {
  const page = rankingPage((await params).slug);
  if (!page) return { title: "Rankings · AssetScore" };
  const path = `/rankings/${page.slug}`;
  return {
    title: `${page.title} · AssetScore`,
    description: page.description,
    alternates: { canonical: path },
    openGraph: { title: page.title, description: page.description, url: `https://assetscore.net${path}`, type: "website" },
    twitter: { card: "summary", title: page.title, description: page.description },
  };
}

export default async function RankingPage({ params }: RankingPageProps) {
  const page = rankingPage((await params).slug);
  if (!page) notFound();
  const { publishedAt, rows } = rankedIndex(page.indexId);
  const updated = publishedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
        timeZoneName: "short",
      }).format(new Date(publishedAt))
    : null;
  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: page.title,
    numberOfItems: rows.length,
    itemListElement: rows.map((row, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${row.name} (${row.symbol})`,
      url: `https://assetscore.net/stocks/${row.symbol}`,
    })),
  };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Rankings</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{page.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
          {page.name} companies in the daily published universe, ordered by AssetScore. The score is the same rounded
          average of Value, Growth, Quality, Financial Health, and Momentum used on each stock page. This list is not a
          forecast and it is not a recommendation to buy or sell.
        </p>
        <p className="mt-4 text-sm text-foreground">Last updated: {updated ?? "No ranking has been published yet."}</p>
        <p className="mt-3 text-sm text-muted">
          <Link href="/methodology" className="text-foreground hover:text-accent">
            How the score is calculated
          </Link>
          <span className="px-2 text-white/20">·</span>
          <Link href="/screener" className="text-foreground hover:text-accent">
            Stock Screener
          </Link>
        </p>
        <nav className="mt-8 flex flex-wrap gap-3 text-sm" aria-label="Index rankings">
          {RANKING_PAGES.map((item) => (
            <Link
              key={item.slug}
              href={`/rankings/${item.slug}`}
              className={`rounded-full border px-3 py-2 ${item.slug === page.slug ? "border-accent text-foreground" : "border-line text-muted hover:text-foreground"}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        {rows.length === 0 ? (
          <p className="mt-10 text-sm text-muted">No companies from this index are in the published dataset yet.</p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-4 py-3 font-normal">Rank</th>
                  <th className="px-4 py-3 font-normal">Company</th>
                  <th className="px-4 py-3 font-normal">AssetScore</th>
                  <th className="px-4 py-3 font-normal">Band</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.symbol} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 font-mono text-muted tabular-nums">{index + 1}</td>
                    <td className="px-4 py-3">
                      <Link href={`/stocks/${row.symbol}`} className="font-medium hover:text-accent">
                        {row.name}
                      </Link>
                      <span className="mt-1 block font-mono text-xs text-muted">{row.symbol}</span>
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">{row.score}</td>
                    <td className="px-4 py-3 text-muted">{row.band}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />
      <SiteFooter />
    </div>
  );
}
