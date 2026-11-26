import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const title = "How to read a stock score · AssetScore";
const description =
  "Short explanations of financial health, stock comparison, the price-to-earnings ratio, profitability, and what a high price multiple means.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/learn" },
  openGraph: { title, description, url: "https://assetscore.net/learn", type: "website" },
  twitter: { card: "summary", title, description },
};

const articles = [
  {
    id: "financial-health",
    title: "How to evaluate a company's financial health",
    body: "AssetScore Financial Health uses the latest annual current ratio and debt compared with equity. A higher current ratio means short-term assets cover short-term bills more comfortably. More debt relative to equity lowers that part of the score. If only one figure is available, that figure is the pillar. The score describes the balance sheet that was returned. It does not say whether the shares will rise.",
  },
  {
    id: "compare",
    title: "How to compare two stocks",
    body: "A comparison puts two companies on the same five pillars: Value, Growth, Quality, Financial Health, and Momentum. Each pillar uses the same inputs as the stock page. The useful reading is which pillar is stronger for each company, not which overall number is larger by itself. Comparison is included with the 30-day trial and with Pro.",
  },
  {
    id: "pe",
    title: "Understanding the price-to-earnings ratio",
    body: "Value uses the annual price-to-earnings ratio. The ratio is the price divided by annual earnings. A lower positive multiple scores higher. Negative earnings keep Value low. The ratio does not include dividends or a forecast, and it can look very different for companies in different businesses. AssetScore does not adjust it by industry.",
  },
  {
    id: "profitability",
    title: "How to evaluate company profitability",
    body: "Quality uses the annual net profit margin, the share of revenue kept as profit. A wider margin scores higher. A loss scores lower. Profitability is one of five equal pillars, so a wide margin can still sit next to an expensive multiple or a weak price trend.",
  },
  {
    id: "overvalued",
    title: "What a high price multiple means here",
    body: "A high annual price-to-earnings ratio lowers the Value score. That is a description of the multiple, not a statement that the shares are about to fall. Momentum, which measures where the price sits in the 52-week range, can be strong at the same time. Read the pillars separately before reading the average.",
  },
];

export default function LearnPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Learn</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em]">How to read a stock score</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          These notes match the calculations on the stock page. The full rules are on the{" "}
          <Link href="/methodology" className="text-foreground hover:text-accent">
            methodology
          </Link>{" "}
          page.
        </p>
        <div className="mt-10 space-y-10">
          {articles.map((article) => (
            <article key={article.id} id={article.id}>
              <h2 className="text-2xl font-medium tracking-[-0.03em]">{article.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">{article.body}</p>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
