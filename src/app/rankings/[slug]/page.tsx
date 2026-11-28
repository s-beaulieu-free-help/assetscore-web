import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LEARN_ARTICLES } from "@/lib/learn-articles";
import { RANKING_FAQS, rankedIndex, rankingPage, RANKING_PAGES } from "@/lib/rankings";
import { scoreTextClass } from "@/lib/score";
import { jsonLd, shareMetadata } from "@/lib/seo";
import { TOPIC_PAGES } from "@/lib/topics";

type RankingPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return RANKING_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: RankingPageProps): Promise<Metadata> {
  const page = rankingPage((await params).slug);
  if (!page) return { title: "Rankings · AssetScore" };
  return shareMetadata({
    title: `${page.title} · AssetScore`,
    description: page.description,
    path: `/rankings/${page.slug}`,
  });
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
  const faqs = RANKING_FAQS[page.slug];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: page.title,
        numberOfItems: rows.length,
        itemListElement: rows.map((row, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${row.name} (${row.symbol})`,
          url: `https://assetscore.net/stocks/${row.symbol}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Rankings</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{page.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{page.lead}</p>
        <p className="mt-4 text-sm text-foreground">Last updated: {updated ?? "No ranking has been published yet."}</p>
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Related reading">
          <Link href="/methodology" className="text-foreground hover:text-accent">
            How the score is calculated
          </Link>
          <Link href="/screener" className="text-foreground hover:text-accent">
            Stock Screener
          </Link>
          <Link href="/topics" className="text-foreground hover:text-accent">
            Stock categories
          </Link>
          <Link href="/learn" className="text-foreground hover:text-accent">
            Guides
          </Link>
        </nav>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-medium">S&amp;P 500 by pillar</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {TOPIC_PAGES.map((topic) => (
                <li key={topic.slug}>
                  <Link href={`/topics/${topic.slug}`} className="text-foreground hover:text-accent">
                    {topic.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-medium">How the pillars are scored</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {LEARN_ARTICLES.filter((article) => article.kind === "score").map((article) => (
                <li key={article.slug}>
                  <Link href={`/learn/${article.slug}`} className="text-foreground hover:text-accent">
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
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
                    <td className={`px-4 py-3 font-mono tabular-nums ${scoreTextClass(row.score)}`}>{row.score}</td>
                    <td className="px-4 py-3 text-muted">{row.band}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">Questions about this ranking</h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((item) => (
              <div key={item.question}>
                <dt className="text-sm font-medium">{item.question}</dt>
                <dd className="mt-2 text-sm leading-7 text-muted">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <SiteFooter />
    </div>
  );
}
