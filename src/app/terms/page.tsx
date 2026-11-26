import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";

const title = "Terms · AssetScore";
const description = "The terms for using AssetScore research tools, the free trial, and the monthly Pro plan.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/terms" },
  openGraph: { title, description, url: "https://assetscore.net/terms", type: "website" },
};

export default function TermsPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Terms</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em]">Using AssetScore</h1>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted">
          <p>
            AssetScore provides financial research and informational tools for US-listed stocks. Scores, screens,
            comparisons, and portfolio averages describe reported figures. They are not individualized investment
            advice and they are not a forecast of returns.
          </p>
          <p>
            A new account can include 30 days of Pro access after the email address is confirmed. No credit card is
            required for that trial, and the trial does not charge a card when it ends. The account then uses the Free
            plan unless you subscribe. Pro is {PRO_MONTHLY_PRICE.label}, billed monthly in US dollars through Stripe.
            There is no annual plan. Taxes are shown by Stripe before you pay.
          </p>
          <p>
            Free accounts can open a limited number of stock evaluations each calendar month and see the same stock
            scores. The Stock Screener, new portfolios, stock comparisons, new favorites, and new reviews require an
            active trial or a paid Pro plan. The server enforces those limits.
          </p>
          <p>
            You are responsible for the account, the information you enter, and your investment decisions. Market data
            comes from Financial Modeling Prep and can be delayed. Annual statements and the latest quote can refer to
            different dates.
          </p>
          <p>
            Questions about the account, privacy, or these terms can be sent from the{" "}
            <Link href="/about" className="text-foreground hover:text-accent">
              About
            </Link>{" "}
            page. The{" "}
            <Link href="/privacy" className="text-foreground hover:text-accent">
              privacy notice
            </Link>{" "}
            describes what is stored.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
