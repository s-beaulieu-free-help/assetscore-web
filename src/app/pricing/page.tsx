import type { Metadata } from "next";
import Link from "next/link";
import { BillingActions } from "@/components/billing-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { freeEvaluationLimit, loadAccess } from "@/lib/billing/access";
import { PRO_ANNUAL_PRICE, PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { loadViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Pricing · AssetScore" };

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const params = await searchParams;
  const [{ user }, access, limit] = await Promise.all([loadViewer(), loadAccess(), freeEvaluationLimit()]);
  const notice =
    params.checkout === "success"
      ? "Payment received. Pro access starts after Stripe confirms the subscription. Reaching this page does not activate Pro by itself."
      : params.checkout === "cancel"
        ? "Checkout was canceled. You have not been charged."
        : null;

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Pricing</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
          Full access for 30 days. No credit card.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Every new account gets 30 days of AssetScore Pro after the email address is confirmed. The trial does not turn into a paid
          subscription. Nothing is charged unless you choose a plan.
        </p>
        {access.trialEnded && access.isFree ? (
          <p className="mt-6 max-w-2xl text-sm leading-6 text-foreground">
            Your 30-day AssetScore Pro trial has ended. Upgrade for just {PRO_MONTHLY_PRICE.label} to continue enjoying unlimited
            stock analysis and complete portfolio management.
          </p>
        ) : null}
        {notice ? <p className="mt-6 max-w-2xl text-sm leading-6 text-foreground">{notice}</p> : null}

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <article className="rounded-2xl border border-line bg-card p-6">
            <h2 className="text-lg font-medium">Free</h2>
            <p className="mt-3 font-mono text-2xl">$0</p>
            <ul className="mt-6 space-y-2 text-sm leading-6 text-muted">
              <li>{limit} stock evaluations per month</li>
              <li>Basic stock information</li>
              <li>Basic evaluation results</li>
              <li>Saved portfolios, favorites, and reviews stay in the account</li>
              <li>Advertisements</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-line bg-card p-6">
            <h2 className="text-lg font-medium">Pro Monthly</h2>
            <p className="mt-3 font-mono text-2xl">{PRO_MONTHLY_PRICE.label}</p>
            <p className="mt-2 text-xs text-muted">Billed every month in US dollars. Taxes are shown on the Stripe payment page.</p>
            <ul className="mt-6 space-y-2 text-sm leading-6 text-muted">
              <li>Unlimited stock analysis</li>
              <li>Complete portfolio management</li>
              <li>Advanced financial analysis</li>
              <li>Stock comparisons</li>
              <li>Historical tracking, where it is available</li>
              <li>Unlimited favorites and reviews</li>
              <li>No advertisements</li>
            </ul>
            <div className="mt-6">
              {user ? <BillingActions showMonthly /> : <AuthLinks />}
            </div>
          </article>

          <article className="rounded-2xl border border-accent/40 bg-card p-6">
            <h2 className="text-lg font-medium">Pro Annual</h2>
            <p className="mt-3 font-mono text-2xl">{PRO_ANNUAL_PRICE.label}</p>
            <p className="mt-2 text-xs text-muted">
              One payment of $49.99 US each year, instead of twelve monthly payments. Taxes are shown on the Stripe payment page.
            </p>
            <ul className="mt-6 space-y-2 text-sm leading-6 text-muted">
              <li>All Pro Monthly features</li>
              <li>Lower yearly cost</li>
              <li>No advertisements</li>
            </ul>
            <div className="mt-6">
              {user ? <BillingActions showAnnual /> : <AuthLinks />}
            </div>
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function AuthLinks() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/register" className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink">
        Create a free account
      </Link>
      <Link href="/login" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm">
        Log in
      </Link>
    </div>
  );
}
