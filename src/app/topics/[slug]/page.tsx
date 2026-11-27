import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { jsonLd, shareMetadata } from "@/lib/seo";
import { TOPIC_PAGES, topicPage, topicRows } from "@/lib/topics";

type TopicProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return TOPIC_PAGES.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: TopicProps): Promise<Metadata> {
  const topic = topicPage((await params).slug);
  if (!topic) return { title: "Topics · AssetScore" };
  return shareMetadata({
    title: `${topic.title} · AssetScore`,
    description: topic.description,
    path: `/topics/${topic.slug}`,
  });
}

function publishedLabel(publishedAt: string | null) {
  if (!publishedAt) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(publishedAt));
}

export default async function TopicPage({ params }: TopicProps) {
  const topic = topicPage((await params).slug);
  if (!topic) notFound();
  const { publishedAt, rows } = topicRows(topic);
  const label = publishedLabel(publishedAt);
  const url = `https://assetscore.net/topics/${topic.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "AssetScore", item: "https://assetscore.net/" },
          { "@type": "ListItem", position: 2, name: "Topics", item: "https://assetscore.net/topics" },
          { "@type": "ListItem", position: 3, name: topic.h1, item: url },
        ],
      },
      {
        "@type": "ItemList",
        name: topic.title,
        numberOfItems: rows.length,
        itemListElement: rows.map((row, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${row.name} (${row.symbol})`,
          url: `https://assetscore.net/stocks/${row.symbol}`,
        })),
      },
    ],
  };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">S&P 500</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{topic.h1}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{topic.intro}</p>
        <p className="mt-4 text-sm text-muted">{label ? `Published ${label}.` : "No daily dataset has been published yet."}</p>
        <nav className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Related">
          <Link href={topic.rankingHref} className="text-foreground hover:text-accent">
            Full S&P 500 ranking
          </Link>
          <Link href={topic.article.href} className="text-foreground hover:text-accent">
            {topic.article.label}
          </Link>
          <Link href="/methodology" className="text-foreground hover:text-accent">
            Methodology
          </Link>
          {TOPIC_PAGES.filter((item) => item.slug !== topic.slug).map((item) => (
            <Link key={item.slug} href={`/topics/${item.slug}`} className="text-foreground hover:text-accent">
              {item.pillarLabel}
            </Link>
          ))}
        </nav>
        {rows.length === 0 ? (
          <p className="mt-10 text-sm text-muted">No companies with this pillar are in the published S&P 500 dataset yet.</p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-4 py-3 font-normal">Company</th>
                  <th className="px-4 py-3 font-normal">{topic.pillarLabel}</th>
                  <th className="px-4 py-3 font-normal">AssetScore</th>
                  <th className="px-4 py-3 font-normal">Band</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.symbol} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <Link href={`/stocks/${row.symbol}`} className="font-medium hover:text-accent">
                        {row.name}
                      </Link>
                      <span className="mt-1 block font-mono text-xs text-muted">{row.symbol}</span>
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums">{row[topic.pillar]}</td>
                    <td className="px-4 py-3 font-mono tabular-nums">{row.score}</td>
                    <td className="px-4 py-3 text-muted">{row.band}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      <SiteFooter />
    </div>
  );
}
