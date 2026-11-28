import type { Metadata } from "next";
import Link from "next/link";
import { recordDailyCount } from "@/lib/analytics";
import { BillingActions } from "@/components/billing-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UpgradeLink } from "@/components/upgrade-link";
import { freeEvaluationLimit, loadAccess } from "@/lib/billing/access";
import type { Access } from "@/lib/billing/entitlement";
import { PRO_MONTHLY_PRICE, TRIAL_LENGTH_DAYS } from "@/lib/billing/plans";
import { shareMetadata } from "@/lib/seo";
import { loadViewer } from "@/lib/viewer";

const title = "AssetScore Pro — $5.99 US/month";
const description =
  "Unlock the complete AssetScore experience. Full Pro access for 30 days, no credit card, and no automatic charge. Pro is $5.99 US/month.";

export const metadata: Metadata = shareMetadata({ title, description, path: "/pricing" });

const benefits = [
  {
    title: "Understand Your Investments",
    points: [
      "The same AssetScore used on every stock page",
      "Five financial quality pillars",
      "Company strengths and weaknesses, in plain language",
      "Unlimited stock evaluations",
    ],
  },
  {
    title: "Discover Investment Opportunities",
    points: [
      "The Stock Screener",
      "Highly rated companies from the daily dataset",
      "Filters across the scores and figures that dataset contains",
      "S&P 500, Nasdaq 100, and Dow Jones",
    ],
  },
  {
    title: "Analyze Your Portfolio",
    points: [
      "Overall portfolio score",
      "Company quality and portfolio construction",
      "Sector and company allocation",
      "Strengths, concentration, and saved history",
    ],
  },
];

const included = [
  "Unlimited stock evaluations",
  "Stock Screener",
  "Portfolio quality, construction, and overall scores",
  "New portfolios",
  "Stock comparisons",
  "Favorites and reviews",
  "No AssetScore promotional ads",
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const params = await searchParams;
  await recordDailyCount("pricing_page_view");
  const [{ user }, access, limit] = await Promise.all([loadViewer(), loadAccess(), freeEvaluationLimit()]);
  const comparison = [
    ["Stock evaluations", `${limit} per calendar month`, "Unlimited"],
    ["Stock Screener", "Not included", "Included"],
    ["Portfolio analysis", "Overview of a saved portfolio", "Quality, construction, and history"],
    ["New portfolios", "Not included", "Included"],
    ["Stock comparisons", "Not included", "Included"],
    ["New favorites and reviews", "Not included", "Included"],
    ["AssetScore promotional ads", "Shown", "Not shown"],
  ];
  const faqs = [
    {
      question: "Do I need a credit card to start the free trial?",
      answer:
        "No. After you confirm your email, you get AssetScore Pro for 30 days without entering payment information.",
    },
    {
      question: "Will I be charged automatically after my trial?",
      answer: "No. The trial ends on its own. You are charged only if you later choose to subscribe.",
    },
    {
      question: "How much does AssetScore Pro cost?",
      answer: `AssetScore Pro is ${PRO_MONTHLY_PRICE.label}. Taxes are shown on the payment page before you pay.`,
    },
    {
      question: "Can I cancel my subscription?",
      answer:
        "There is nothing to cancel during the trial, because no card is charged. If you subscribe, you can manage or cancel that subscription from the account billing portal. A canceled paid plan keeps access until the end of the period already paid.",
    },
    {
      question: "What happens when my free trial ends?",
      answer: `The account returns to the Free plan: ${limit} stock evaluations per calendar month and AssetScore promotional ads. The Stock Screener, new portfolios, comparisons, favorites, and reviews require Pro. Portfolios, favorites, and reviews you already saved stay in the account.`,
    },
    {
      question: "Do Pro subscribers see promotional ads?",
      answer: "No. AssetScore Pro does not show AssetScore promotional ads. The 30-day trial does not show them either.",
    },
  ];
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
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">AssetScore Pro</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.045em] text-balance sm:text-5xl">
          Unlock the Complete Investment Intelligence Experience.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-foreground">
          Understand the quality of your investments, discover exceptional companies, and gain a deeper understanding of
          your portfolio — all through one powerful platform.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="rounded-2xl border border-line bg-card p-6">
              <h2 className="text-lg font-medium tracking-[-0.02em]">{benefit.title}</h2>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-muted">
                {benefit.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section id="monthly" className="scroll-mt-24 mt-8 rounded-2xl border border-accent/40 bg-card p-6 sm:p-10">
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">AssetScore Pro</p>
          <h2 className="mt-3 max-w-xl text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
            Unlock the complete investment intelligence experience.
          </h2>
          <p className="mt-6 flex items-end gap-3">
            <span className="font-mono text-5xl tracking-[-0.05em] tabular-nums sm:text-6xl">${PRO_MONTHLY_PRICE.amount}</span>
            <span className="pb-1 text-sm text-muted">USD / month</span>
          </p>
          <div className="mt-6">
            <PricingAction user={Boolean(user)} access={access} />
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
            No credit card required. No automatic charge after your {TRIAL_LENGTH_DAYS}-day trial.
          </p>
          <ul className="mt-8 grid gap-2 text-sm text-foreground sm:grid-cols-2">
            {included.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-line px-6 py-7 sm:px-8">
          <h2 className="text-xl font-medium tracking-[-0.03em]">Full Pro access for {TRIAL_LENGTH_DAYS} days.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Experience the complete AssetScore platform free for {TRIAL_LENGTH_DAYS} days. Explore every Pro feature
            without entering payment information. Your trial ends automatically, with no unexpected charges.
          </p>
          <ol className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <li>Full Pro access for {TRIAL_LENGTH_DAYS} days.</li>
            <li>No credit card required.</li>
            <li>No automatic payment when the trial expires.</li>
          </ol>
        </section>

        {access.trialEnded && access.isFree ? (
          <p className="mt-8 max-w-2xl text-sm leading-6 text-foreground">
            Your {TRIAL_LENGTH_DAYS}-day trial has ended. The account is on the Free plan. Saved portfolios and favorites
            stay available. Pro restores unlimited stock evaluations, the Stock Screener, new portfolios, and stock
            comparisons.
          </p>
        ) : null}
        {notice ? <p className="mt-6 max-w-2xl text-sm leading-6 text-foreground">{notice}</p> : null}

        <section className="mt-16">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">Free and Pro</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Free keeps the same stock-page score. Pro adds the tools around it. A portfolio you already saved stays
            readable after the trial.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-line">
                <tr>
                  <th className="px-4 py-3 font-normal text-muted"> </th>
                  <th className="px-4 py-3 font-normal text-muted">Free</th>
                  <th className="px-4 py-3 font-medium">Pro · {PRO_MONTHLY_PRICE.label}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row[0]} className="border-b border-line last:border-b-0">
                    <th className="px-4 py-3 text-left font-normal">{row[0]}</th>
                    <td className="px-4 py-3 text-muted">{row[1]}</td>
                    <td className="px-4 py-3 font-medium">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16 max-w-3xl">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">Questions</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {faqs.map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="cursor-pointer text-sm font-medium">{item.question}</summary>
                <p className="mt-3 text-sm leading-6 text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {user ? null : (
          <div className="mt-16">
            <UpgradeLink
              href="/register"
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink"
            >
              Start Your Free 30-Day Trial
            </UpgradeLink>
            <p className="mt-3 text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-foreground hover:text-accent">
                Log in
              </Link>
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function PricingAction({ user, access }: { user: boolean; access: Access }) {
  if (!user) {
    return (
      <UpgradeLink
        href="/register"
        className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink"
      >
        Start Your Free 30-Day Trial
      </UpgradeLink>
    );
  }
  if (access.isTrialActive) {
    return (
      <p className="text-sm leading-6 text-foreground">
        Your trial is active{access.daysRemaining != null ? ` · ${access.daysRemaining} days remaining` : ""}.
      </p>
    );
  }
  if (access.isPro) {
    return <p className="text-sm leading-6 text-foreground">Pro is active on this account.</p>;
  }
  return <BillingActions showMonthly showPortal={access.hasStripeSubscription} />;
}
