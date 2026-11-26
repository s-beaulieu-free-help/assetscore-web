import type { Metadata } from "next";
import Link from "next/link";
import { BillingActions } from "@/components/billing-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { freeEvaluationLimit, loadAccess } from "@/lib/billing/access";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { loadViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Pricing · AssetScore",
  description: "Try AssetScore Pro free for 30 days. Full access, no credit card, and no automatic charge. Pro is $5.99 US/month.",
};

const freeFeatures = [
  "Basic stock information",
  "Basic evaluation results",
  "Limited functionality",
  "Advertisements",
];

const proFeatures = [
  "Unlimited stock analysis",
  "Unlimited portfolio management",
  "Complete portfolio scoring",
  "Unlimited favorites",
  "Stock comparisons",
  "Stock Screener",
  "Advanced financial analysis",
  "Historical score tracking, where it is implemented",
  "Full access to Pro features",
  "No advertisements",
];

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
          Try AssetScore Pro free for 30 days.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground">Full access. No credit card required. No automatic charge.</p>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          The trial starts after you confirm your email. It does not become a paid subscription. To keep Pro after those
          30 days, you choose a plan yourself. Nothing is charged unless you do.
        </p>
        {access.trialEnded && access.isFree ? (
          <p className="mt-6 max-w-2xl text-sm leading-6 text-foreground">
            Your 30-day AssetScore Pro trial has ended. Your account is now on the Free plan. Upgrade to continue
            enjoying unlimited stock analysis and full portfolio management. Saved portfolios and favorites stay in the
            account, under the Free plan&apos;s access rules.
          </p>
        ) : null}
        {notice ? <p className="mt-6 max-w-2xl text-sm leading-6 text-foreground">{notice}</p> : null}

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-line bg-card p-6">
            <h2 className="text-lg font-medium">Free</h2>
            <p className="mt-3 font-mono text-2xl">$0</p>
            <p className="mt-2 text-xs text-muted">After the trial, unless you subscribe.</p>
            <ul className="mt-6 space-y-2 text-sm leading-6 text-muted">
              <li>{limit} stock evaluations per month</li>
              {freeFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
              <li>Saved portfolios, favorites, and reviews stay in the account</li>
            </ul>
          </article>

          <article id="monthly" className="scroll-mt-24 rounded-2xl border border-accent/40 bg-card p-6">
            <h2 className="text-lg font-medium">AssetScore Pro</h2>
            <p className="mt-3 font-mono text-2xl">{PRO_MONTHLY_PRICE.label}</p>
            <p className="mt-2 text-xs leading-5 text-muted">
              Recurring monthly subscription. Billed every month in US dollars. Taxes are shown on the Stripe payment
              page before you pay.
            </p>
            <ul className="mt-6 space-y-2 text-sm leading-6 text-muted">
              {proFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-6">{user ? <BillingActions showMonthly /> : <AuthLinks />}</div>
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
