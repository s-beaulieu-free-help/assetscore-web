import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LEARN_ARTICLES } from "@/lib/learn-articles";
import { shareMetadata } from "@/lib/seo";

const title = "How to read a stock score · AssetScore";
const description =
  "Articles on valuation, revenue growth, profit margin, financial health, and how those ratios become an AssetScore.";

export const metadata: Metadata = shareMetadata({ title, description, path: "/learn" });

export default function LearnPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Learn</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em]">How to read a stock score</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Each article explains one part of the score used on stock pages and in the{" "}
          <Link href="/rankings/sp500" className="text-foreground hover:text-accent">
            S&P 500 ranking
          </Link>
          . The formulas are on the{" "}
          <Link href="/methodology" className="text-foreground hover:text-accent">
            methodology
          </Link>{" "}
          page. Category lists are under{" "}
          <Link href="/topics" className="text-foreground hover:text-accent">
            topics
          </Link>
          .
        </p>
        <ul className="mt-10 space-y-4">
          {LEARN_ARTICLES.map((article) => (
            <li key={article.slug} className="rounded-2xl border border-line bg-card px-5 py-5">
              <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{article.kicker}</p>
              <Link href={`/learn/${article.slug}`} className="mt-2 block text-lg font-medium hover:text-accent">
                {article.title}
              </Link>
              <p className="mt-2 text-sm leading-6 text-muted">{article.description}</p>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
