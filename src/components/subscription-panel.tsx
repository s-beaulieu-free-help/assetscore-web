import { BillingActions } from "@/components/billing-actions";
import type { Access } from "@/lib/billing/entitlement";

function planTitle(access: Access) {
  if (access.isTrialActive) return "Pro Trial";
  if (access.plan === "pro_monthly") return "Pro Monthly";
  if (access.plan === "pro_annual") return "Pro Annual";
  return "Free";
}

export function SubscriptionPanel({ access }: { access: Access }) {
  const renewal = access.currentPeriodEnd
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
        new Date(access.currentPeriodEnd),
      )
    : null;
  const trialEnd = access.trialEndsAt
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
        new Date(access.trialEndsAt),
      )
    : null;

  return (
    <section className="mt-10 rounded-2xl border border-line bg-card p-6">
      <h2 className="text-lg font-medium">Subscription</h2>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Current plan</dt>
          <dd className="mt-1">{planTitle(access)}</dd>
        </div>
        {access.isTrialActive ? (
          <div>
            <dt className="text-muted">Trial</dt>
            <dd className="mt-1">
              {access.daysRemaining} {access.daysRemaining === 1 ? "day" : "days"} remaining
              {trialEnd ? `, through ${trialEnd} UTC` : ""}
            </dd>
          </div>
        ) : null}
        {access.billingLabel ? (
          <div>
            <dt className="text-muted">Price</dt>
            <dd className="mt-1">{access.billingLabel}</dd>
          </div>
        ) : null}
        {renewal && access.isPro && !access.isTrialActive ? (
          <div>
            <dt className="text-muted">{access.cancelAtPeriodEnd ? "Access through" : "Next billing date"}</dt>
            <dd className="mt-1">{renewal} UTC</dd>
          </div>
        ) : null}
        {access.cancelAtPeriodEnd ? (
          <div>
            <dt className="text-muted">Cancellation</dt>
            <dd className="mt-1">Canceled. Pro stays on until the paid period ends.</dd>
          </div>
        ) : null}
      </dl>
      {access.trialEnded && access.isFree ? (
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Your 30-day AssetScore Pro trial has ended. Your portfolios, favorites, and reviews are still here. Upgrade for just $5.99
          CAD/month to continue unlimited stock analysis and complete portfolio management.
        </p>
      ) : (
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          The free trial does not charge a card when it ends. Pro continues only after you choose a paid plan.
        </p>
      )}
      <div className="mt-5">
        {access.plan === "pro_monthly" || access.plan === "pro_annual" || access.status === "past_due" ? (
          <BillingActions showPortal showMonthly={access.isFree} showAnnual={access.isFree} />
        ) : (
          <BillingActions showMonthly showAnnual />
        )}
      </div>
    </section>
  );
}
