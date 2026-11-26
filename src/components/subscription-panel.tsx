import { BillingActions } from "@/components/billing-actions";
import type { Access } from "@/lib/billing/entitlement";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";

function planTitle(access: Access) {
  if (access.isTrialActive) return "Pro Trial";
  if (access.plan === "pro_monthly") return "Pro Monthly";
  if (access.plan === "pro_annual") return "Pro Annual";
  return "Free";
}

function formatUtc(value: string) {
  return `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value))} UTC`;
}

export function SubscriptionPanel({ access }: { access: Access }) {
  const renewal = access.currentPeriodEnd ? formatUtc(access.currentPeriodEnd) : null;
  const trialEnd = access.trialEndsAt ? formatUtc(access.trialEndsAt) : null;
  const trialStatus = access.isTrialActive
    ? `Active, ${access.daysRemaining} ${access.daysRemaining === 1 ? "day" : "days"} remaining`
    : access.trialEnded
      ? "Ended. This account is on the Free plan until you subscribe."
      : "No trial is recorded on this account.";
  const paid = access.plan === "pro_monthly" || access.plan === "pro_annual";

  return (
    <section className="mt-10 rounded-2xl border border-line bg-card p-6">
      <h2 className="text-lg font-medium">Subscription</h2>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Current plan</dt>
          <dd className="mt-1">{planTitle(access)}</dd>
        </div>
        <div>
          <dt className="text-muted">Trial status</dt>
          <dd className="mt-1">{trialStatus}</dd>
        </div>
        <div>
          <dt className="text-muted">Trial expiration</dt>
          <dd className="mt-1">{trialEnd ?? "None"}</dd>
        </div>
        <div>
          <dt className="text-muted">Subscription price</dt>
          <dd className="mt-1">
            {access.plan === "pro_annual" ? "On file with Stripe" : access.billingLabel ?? "No paid subscription"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Next billing date</dt>
          <dd className="mt-1">{paid && renewal ? renewal : "None until you subscribe"}</dd>
        </div>
        <div>
          <dt className="text-muted">Cancellation</dt>
          <dd className="mt-1">
            {access.cancelAtPeriodEnd
              ? `Canceled. Access continues until ${renewal ?? "the end of the paid period"}.`
              : "Not canceled"}
          </dd>
        </div>
      </dl>
      {access.isTrialActive && access.daysRemaining != null && access.daysRemaining <= 7 ? (
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Your Pro trial ends in {access.daysRemaining} {access.daysRemaining === 1 ? "day" : "days"}. Keep
          unlimited stock evaluations, the Stock Screener, new portfolios, and stock comparisons for {PRO_MONTHLY_PRICE.label}. The trial will
          not charge a card.
        </p>
      ) : null}
      {access.trialEnded && access.isFree ? (
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Your 30-day AssetScore Pro trial has ended. Your account is now on the Free plan. Upgrade to keep
          unlimited stock evaluations, the Stock Screener, new portfolios, and stock comparisons. Saved portfolios and favorites remain
          available under the Free plan&apos;s access rules. Nothing was deleted.
        </p>
      ) : (
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          The free trial does not charge a card when it ends. Pro continues only after you choose a paid plan at{" "}
          {PRO_MONTHLY_PRICE.label}.
        </p>
      )}
      <div className="mt-5">
        {paid || access.hasStripeSubscription ? (
          <BillingActions showPortal showMonthly={!paid} />
        ) : (
          <BillingActions showMonthly />
        )}
      </div>
    </section>
  );
}
