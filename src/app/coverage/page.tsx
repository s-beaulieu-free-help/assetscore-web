import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { shareMetadata } from "@/lib/seo";

const title = "Stock coverage · AssetScore";
const description =
  "AssetScore covers US-listed stocks, including the S&P 500, Nasdaq 100, and Dow Jones. ETFs, crypto, bonds, and non-US listings are outside the current coverage.";

export const metadata: Metadata = shareMetadata({ title, description, path: "/coverage" });

const covered = [
  {
    title: "US-listed stocks",
    body: "A stock page can be opened for a US ticker when Financial Modeling Prep returns a quote and annual figures. Search, comparison, favorites, and portfolios use those tickers.",
  },
  {
    title: "S&P 500, Nasdaq 100, and Dow Jones",
    body: "These three indexes are published once a day as rankings and as the Stock Screener universe. Each row links to that company's stock analysis.",
  },
  {
    title: "Operating companies, banks, insurers, and REITs",
    body: "Operating companies use all five pillars. Banks and insurers keep Value, Growth, and Momentum. Real estate investment trusts keep Growth and Momentum. Omitted pillars are left out of the average.",
  },
];

const outside = [
  "Exchange-traded funds and mutual funds",
  "Crypto assets",
  "Bonds and other fixed income",
  "Non-US listings",
  "Options and other derivatives",
];

export default function CoveragePage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Coverage</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">What AssetScore scores</h1>
        <p className="mt-6 text-sm leading-7 text-muted">
          AssetScore is a stock analysis for US-listed companies. The score uses the latest quote and the latest annual
          figures. It describes those figures. It is not a forecast and it is not investment advice.
        </p>
        <section className="mt-12 space-y-8">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">Included</h2>
          {covered.map((item) => (
            <article key={item.title}>
              <h3 className="text-xl font-medium tracking-[-0.03em]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.body}</p>
            </article>
          ))}
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">Outside current coverage</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
            {outside.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-7 text-muted">
            ETF scores and crypto scores are planned. They are not part of the score you see on a stock page today.
          </p>
        </section>
        <p className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/methodology" className="text-foreground hover:text-accent">
            Methodology
          </Link>
          <Link href="/reports" className="text-foreground hover:text-accent">
            Sample reports
          </Link>
          <Link href="/rankings/sp500" className="text-foreground hover:text-accent">
            S&P 500 rankings
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
