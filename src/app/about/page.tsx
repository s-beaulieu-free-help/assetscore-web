import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "About AssetScore",
  description:
    "Learn how AssetScore transforms complex financial data into simple scores that help investors evaluate opportunities faster.",
  openGraph: {
    title: "About AssetScore",
    description:
      "Learn how AssetScore transforms complex financial data into simple scores that help investors evaluate opportunities faster.",
    url: "https://assetscore.net/about",
  },
};

const steps = [
  {
    index: "01",
    title: "Collect Data",
    body: "We gather financial market information from trusted financial data providers.",
  },
  {
    index: "02",
    title: "Analyze",
    body: "We evaluate multiple categories including valuation, growth, quality, financial health and momentum.",
  },
  {
    index: "03",
    title: "Score",
    body: "Each category contributes to a transparent AssetScore ranging from 0 to 100.",
  },
  {
    index: "04",
    title: "Explore",
    body: "Investors can compare opportunities and investigate the factors driving each score.",
  },
];

const principles = [
  {
    title: "Transparency",
    body: "Every score should be explainable.",
  },
  {
    title: "Consistency",
    body: "All assets are evaluated using the same methodology.",
  },
  {
    title: "Clarity",
    body: "Simple insights are more valuable than information overload.",
  },
  {
    title: "Continuous Improvement",
    body: "Our scoring models evolve as new data becomes available.",
  },
];

const available = [
  {
    title: "US stock analysis",
    body: "A 0–100 AssetScore from value, growth, quality, financial health, and momentum. Missing inputs are left out of the average.",
  },
  {
    title: "Stock comparison",
    body: "Two US-listed companies side by side, using the same pillars and scores as the stock page.",
  },
  {
    title: "Portfolios",
    body: "Add holdings and allocations. The portfolio score is the allocation-weighted average of those AssetScores.",
  },
  {
    title: "Favorites",
    body: "Save stocks to return to them from the account.",
  },
  {
    title: "Top Rated lists",
    body: "The S&P 500, Nasdaq 100, and Dow Jones lists are published once a day from the same scoring run.",
  },
  {
    title: "Stock Screener",
    body: "Screen that daily universe by index and AssetScore. Included with the 30-day Pro trial and with Pro at $5.99 US/month.",
  },
];

const planned = [
  {
    title: "ETF scores",
    body: "The same style of score for exchange-traded funds.",
  },
  {
    title: "Crypto scores",
    body: "A score for crypto assets, using a methodology written for that market.",
  },
  {
    title: "Historical score tracking",
    body: "A record of how an AssetScore changes over time.",
  },
];

const disclaimer = [
  "AssetScore provides informational and educational content only.",
  "AssetScore does not provide financial, investment, legal, accounting or tax advice.",
  "AssetScore scores are generated using quantitative models and should not be considered recommendations to buy, sell or hold any security.",
  "Investing involves risk, including the potential loss of capital.",
  "Users are solely responsible for their own investment decisions.",
];

export default function AboutPage() {
  return (
    <div>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(215,242,92,0.08),transparent_58%)]"
          />
          <div className="relative mx-auto w-full max-w-6xl px-6 pt-20 pb-20 lg:pt-28 lg:pb-24">
            <p className="rise font-mono text-[11px] tracking-[0.22em] text-muted uppercase">
              AssetScore
            </p>
            <h1 className="rise mt-5 max-w-3xl text-4xl leading-[1.02] font-medium tracking-[-0.045em] sm:text-6xl">
              About AssetScore
            </h1>
            <p
              className="rise mt-6 max-w-2xl text-[17px] leading-8 text-muted"
              style={{ animationDelay: "80ms" }}
            >
              AssetScore helps investors evaluate opportunities in seconds by transforming
              complex financial information into a simple, transparent score.
            </p>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[16rem_1fr] lg:py-28">
            <h2 className="text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Our Mission</h2>
            <div className="max-w-2xl space-y-5 text-[15px] leading-7 text-muted">
              <p>
                Financial markets generate an overwhelming amount of information. Most investors
                do not have the time to analyze hundreds of metrics before making a decision.
              </p>
              <p>
                AssetScore was built to simplify research by turning complex financial data into
                clear, understandable scores that help investors focus their attention where it
                matters most.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Process</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              How AssetScore Works
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className="rise bg-background px-6 py-8"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <p className="font-mono text-[11px] tracking-[0.16em] text-accent">{step.index}</p>
                  <h3 className="mt-8 text-xl font-medium tracking-[-0.03em]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Standards</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Our Principles
            </h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {principles.map((principle) => (
                <article key={principle.title} className="rounded-2xl border border-line bg-card px-6 py-7">
                  <h3 className="text-xl font-medium tracking-[-0.03em]">{principle.title}</h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-muted">{principle.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
            <h2 className="text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Important Disclaimer
            </h2>
            <div className="mt-8 max-w-3xl space-y-4 rounded-2xl border border-line bg-card px-6 py-7 sm:px-8">
              {disclaimer.map((line) => (
                <p key={line} className="text-sm leading-7 text-muted">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-28">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Roadmap</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-medium tracking-[-0.035em] sm:text-4xl">
              Available now and planned
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
              Available features are in the product today. Planned features are on the roadmap.
            </p>
            <div className="mt-12 grid gap-10 lg:grid-cols-2">
              <div>
                <h3 className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Available now</h3>
                <ul className="mt-4 space-y-3">
                  {available.map((item) => (
                    <li key={item.title} className="rounded-2xl border border-line bg-card px-5 py-5">
                      <p className="text-[15px] font-medium tracking-[-0.02em]">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Planned</h3>
                <ul className="mt-4 space-y-3">
                  {planned.map((item) => (
                    <li key={item.title} className="rounded-2xl border border-dashed border-line px-5 py-5">
                      <p className="text-[15px] font-medium tracking-[-0.02em]">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-20 sm:flex-row sm:items-center sm:justify-between lg:py-24">
            <h2 className="text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Ready to explore?</h2>
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink transition hover:brightness-110"
            >
              Analyze Stocks
            </Link>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Contact</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Contact us</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
              Send a message to AssetScore. Include the email address where you want a reply.
            </p>
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
