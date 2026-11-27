import type { Metadata } from "next";
import Link from "next/link";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { HomeCta } from "@/components/home-cta";
import { HomeFaq, homeFaqs } from "@/components/home-faq";
import { Pillars } from "@/components/pillars";
import { ProductDemos, type ExampleHolding } from "@/components/product-demos";
import { ScreenerShowcase } from "@/components/screener-showcase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TopRatedLists } from "@/components/top-rated-lists";
import { Trust } from "@/components/trust";
import { recordDailyCount } from "@/lib/analytics";
import { loadAccess } from "@/lib/billing/access";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { buildStockPage, getFmpSnapshot, type StockPageData } from "@/lib/fmp";
import { loadViewer, viewerName } from "@/lib/viewer";

export const dynamic = "force-dynamic";

const title = "AssetScore · Stock analysis, evaluation, and scoring";
const description =
  "A stock analysis platform for individual investors. Evaluate a company with a 0–100 AssetScore for value, growth, quality, financial health, and momentum. New accounts get 30 days of Pro, with no credit card.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "https://assetscore.net",
    siteName: "AssetScore",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1353,
        height: 1353,
        alt: "AssetScore logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/logo.png"],
  },
};

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
        <p className="border-b border-line">
          <span className="mx-auto block w-full max-w-6xl px-6 py-4 text-sm leading-6 text-muted">
            {name ? (
              <span className="text-foreground">
                Welcome {name}
                {access.trialEnded && access.isFree
                  ? `. Your 30-day AssetScore Pro trial has ended. Upgrade for just ${PRO_MONTHLY_PRICE.label} to keep unlimited stock evaluations, the Stock Screener, new portfolios, and stock comparisons.`
                  : ""}
              </span>
            ) : (
              <>
                <Link href="/register" className="text-foreground hover:text-accent">
                  Create your free account
                </Link>{" "}
                and use unlimited stock evaluations, the Stock Screener, portfolios, and stock comparisons for 30 days. No credit card is required, and the trial
                does not charge you when it ends.
              </>
            )}
          </span>
        </p>
        <Hero signedIn={Boolean(user)} />
        <TopRatedLists />
        <ScreenerShowcase />
        <ProductDemos
          example={example}
          left={apple}
          right={microsoft}
          holdings={[
            exampleHolding(regeneron, "REGN", 15),
            exampleHolding(coke, "KO", 25),
            exampleHolding(exxon, "XOM", 40),
            exampleHolding(caterpillar, "CAT", 20),
          ]}
        />
        <Pillars />
        <Trust />
        <Features />
        {user ? null : <HomeCta />}
        <HomeFaq />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SiteFooter />
    </div>
  );
}
