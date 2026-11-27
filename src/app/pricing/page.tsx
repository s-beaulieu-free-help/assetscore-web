import type { Metadata } from "next";
import Link from "next/link";
import { recordDailyCount } from "@/lib/analytics";
import { BillingActions } from "@/components/billing-actions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { freeEvaluationLimit, loadAccess } from "@/lib/billing/access";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { shareMetadata } from "@/lib/seo";
import { loadViewer } from "@/lib/viewer";

const title = "AssetScore Pro — $5.99 US/month";
const description =
  "Compare Free and Pro. The 30-day trial includes the Stock Screener, portfolios, and comparisons. No credit card and no automatic charge. Pro is $5.99 US/month.";

export const metadata: Metadata = shareMetadata({ title, description, path: "/pricing" });

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
    ["Stock scores on the stock page", "Same score", "Same score"],
    ["Stock Screener", "Not included", "Included"],
    ["New portfolios", "Not included", "Included"],
    ["Stock comparisons", "Not included", "Included"],
    ["New favorites and reviews", "Not included", "Included"],
    ["AssetScore promotional ads", "Shown", "Not shown"],
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
            keeping unlimited stock evaluations, the Stock Screener, new portfolios, and stock comparisons. Saved portfolios and favorites stay in the
            account, under the Free plan&apos;s access rules.
          </p>
        ) : null}
        {notice ? <p className="mt-6 max-w-2xl text-sm leading-6 text-foreground">{notice}</p> : null}

        <div className="mt-10 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line">
              <tr>
                <th className="px-4 py-3 font-normal text-muted">Feature</th>
                <th className="px-4 py-3 font-normal">Free</th>
                <th className="px-4 py-3 font-normal">Pro · {PRO_MONTHLY_PRICE.label}</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row[0]} className="border-b border-line last:border-b-0">
                  <th className="px-4 py-3 text-left font-normal text-muted">{row[0]}</th>
                  <td className="px-4 py-3">{row[1]}</td>
                  <td className="px-4 py-3">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
          Saved portfolios, favorites, and reviews stay in the account after a trial ends. Creating a new portfolio,
          comparison, favorite, or review requires Pro. The stock page uses the same score for Free and Pro. Historical
          score tracking is not available yet.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-line bg-card p-6">
            <h2 className="text-lg font-medium">Free</h2>
            <p className="mt-3 font-mono text-2xl">$0</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {limit} stock evaluations per calendar month, the same stock scores, and AssetScore&apos;s own Pro
              promotions. Portfolios you already saved stay available.
            </p>
          </article>

          <article id="monthly" className="scroll-mt-24 rounded-2xl border border-accent/40 bg-card p-6">
            <h2 className="text-lg font-medium">AssetScore Pro</h2>
            <p className="mt-3 font-mono text-3xl">{PRO_MONTHLY_PRICE.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Monthly subscription in US dollars. The 30-day trial includes this access and does not charge a card when
              it ends. Taxes are shown on the Stripe payment page before you pay.
            </p>
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
