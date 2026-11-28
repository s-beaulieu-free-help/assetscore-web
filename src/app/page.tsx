import type { Metadata } from "next";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { HomeCta } from "@/components/home-cta";
import { HomeFaq, homeFaqs } from "@/components/home-faq";
import { Pillars } from "@/components/pillars";
import { PortfolioPreview, ProductDemos, type ExampleHolding } from "@/components/product-demos";
import { ScreenerShowcase } from "@/components/screener-showcase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TopRatedLists } from "@/components/top-rated-lists";
import { Trust } from "@/components/trust";
import { recordDailyCount } from "@/lib/analytics";
import { loadAccess } from "@/lib/billing/access";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { buildStockPage, getFmpSnapshot, type StockPageData } from "@/lib/fmp";
import { jsonLd, shareMetadata } from "@/lib/seo";
import { loadViewer, viewerName } from "@/lib/viewer";

export const dynamic = "force-dynamic";

const title = "AssetScore · Stock analysis, evaluation, and scoring";
const description =
  "A stock analysis platform for individual investors. Evaluate a company with a 0–100 AssetScore for value, growth, quality, financial health, and momentum. New accounts get 30 days of Pro, with no credit card.";

export const metadata: Metadata = shareMetadata({ title, description, path: "/" });

async function loadStock(symbol: string) {
  try {
    return buildStockPage(await getFmpSnapshot(symbol));
  } catch {
    return null;
  }
}

function exampleHolding(stock: StockPageData | null, ticker: string, allocation: number): ExampleHolding {
  return {
    ticker: stock?.ticker ?? ticker,
    name: stock?.name ?? ticker,
    score: stock?.score ?? null,
    band: stock?.band ?? null,
    allocation,
    sector: stock?.sector ?? null,
    isEtf: stock?.isEtf ?? false,
    pillars: stock?.pillars.map((pillar) => ({ label: pillar.label, score: pillar.score })) ?? [],
  };
}

export default async function Home() {
  await recordDailyCount("homepage_view");
  const [{ user, profile }, access, example, apple, microsoft, regeneron, coke, exxon, caterpillar] = await Promise.all([
    loadViewer(),
    loadAccess(),
    loadStock("NVDA"),
    loadStock("AAPL"),
    loadStock("MSFT"),
    loadStock("REGN"),
    loadStock("KO"),
    loadStock("XOM"),
    loadStock("CAT"),
  ]);
  const name = user ? viewerName(profile) : null;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div id="top">
      <SiteHeader />
      <main>
        {name ? (
          <p className="border-b border-line">
            <span className="mx-auto block w-full max-w-6xl px-6 py-4 text-sm leading-6 text-foreground">
              Welcome {name}
              {access.trialEnded && access.isFree
                ? `. Your 30-day AssetScore Pro trial has ended. Upgrade for just ${PRO_MONTHLY_PRICE.label} to keep unlimited stock evaluations, the Stock Screener, new portfolios, and stock comparisons.`
                : ""}
            </span>
          </p>
        ) : null}
        <Hero signedIn={Boolean(user)} />
        <PortfolioPreview
          holdings={[
            exampleHolding(regeneron, "REGN", 15),
            exampleHolding(coke, "KO", 25),
            exampleHolding(exxon, "XOM", 40),
            exampleHolding(caterpillar, "CAT", 20),
          ]}
        />
        <TopRatedLists />
        <ScreenerShowcase />
        <ProductDemos example={example} left={apple} right={microsoft} />
        <Pillars />
        <Trust />
        <Features />
        {user ? null : <HomeCta />}
        <HomeFaq />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <SiteFooter />
    </div>
  );
}
