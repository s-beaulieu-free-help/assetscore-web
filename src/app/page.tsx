import type { Metadata } from "next";
import Link from "next/link";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { HomeCta } from "@/components/home-cta";
import { HomeFaq, homeFaqs } from "@/components/home-faq";
import { Pillars } from "@/components/pillars";
import { ProductDemos, type ExampleHolding } from "@/components/product-demos";
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

const title = "AssetScore · Stock analysis for individual investors";
const description =
  "Evaluate a stock with a 0–100 score for value, growth, quality, financial health, and momentum. Compare companies and review a portfolio. New accounts get 30 days free, with no credit card.";

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

function exampleHolding(stock: StockPageData | null, ticker: string): ExampleHolding {
  return {
    ticker: stock?.ticker ?? ticker,
    name: stock?.name ?? ticker,
    score: stock?.score ?? null,
    band: stock?.band ?? null,
    allocation: 25,
  };
}

export default async function Home() {
  await recordDailyCount("homepage_view");
  const [{ user, profile }, access, example, apple, microsoft, meta] = await Promise.all([
    loadViewer(),
    loadAccess(),
    loadStock("NVDA"),
    loadStock("AAPL"),
    loadStock("MSFT"),
    loadStock("META"),
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
                  ? `. Your 30-day AssetScore Pro trial has ended. Upgrade for just ${PRO_MONTHLY_PRICE.label} to continue enjoying unlimited stock analysis and complete portfolio management.`
                  : ""}
              </span>
            ) : (
              <>
                <Link href="/register" className="text-foreground hover:text-accent">
                  Create your free account
                </Link>{" "}
                and unlock stock screener and portfolio tools for 30 days. No credit card is required, and the trial
                does not charge you when it ends.
              </>
            )}
          </span>
        </p>
        <Hero signedIn={Boolean(user)} />
        <TopRatedLists />
        <ProductDemos
          example={example}
          left={apple}
          right={microsoft}
          holdings={[
            exampleHolding(example, "NVDA"),
            exampleHolding(apple, "AAPL"),
            exampleHolding(microsoft, "MSFT"),
            exampleHolding(meta, "META"),
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
