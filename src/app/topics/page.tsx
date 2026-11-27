import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LEARN_ARTICLES } from "@/lib/learn-articles";
import { shareMetadata } from "@/lib/seo";
import { TOPIC_PAGES } from "@/lib/topics";

const title = "Stock categories and investing topics · AssetScore";
const description =
  "S&P 500 lists by quality, valuation, revenue growth, and financial health, plus short articles on the ratios behind each AssetScore pillar.";

export const metadata: Metadata = shareMetadata({ title, description, path: "/topics" });

export default function TopicsPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Topics</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Stock categories</h1>
        <p className="mt-6 text-sm leading-7 text-muted">
          These pages use the daily published S&P 500 dataset. The full ordering by overall AssetScore is the{" "}
          <Link href="/rankings/sp500" className="text-foreground hover:text-accent">
            S&P 500 ranking
          </Link>
          . A high pillar score describes the latest figures. It is not a forecast.
        </p>
        <ul className="mt-10 space-y-4">
          {TOPIC_PAGES.map((topic) => (
            <li key={topic.slug} className="rounded-2xl border border-line bg-card px-5 py-5">
              <Link href={`/topics/${topic.slug}`} className="text-lg font-medium hover:text-accent">
                {topic.h1}
              </Link>
              <p className="mt-2 text-sm leading-6 text-muted">{topic.description}</p>
            </li>
          ))}
        </ul>
        <h2 className="mt-14 text-2xl font-medium tracking-[-0.03em]">Guides</h2>
        <ul className="mt-4 space-y-3">
          {LEARN_ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link href={`/learn/${article.slug}`} className="text-sm text-foreground hover:text-accent">
                {article.title}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/methodology" className="text-sm text-foreground hover:text-accent">
              Scoring methodology
            </Link>
          </li>
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
