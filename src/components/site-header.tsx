import Link from "next/link";
import { SiteHeaderBar } from "@/components/site-header-bar";
import { loadAccess } from "@/lib/billing/access";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { loadViewer, viewerName } from "@/lib/viewer";

export async function SiteHeader() {
  const [{ user, profile }, access] = await Promise.all([loadViewer(), loadAccess()]);
  const notice = access.isTrialActive
    ? `Pro Trial — ${access.daysRemaining} ${access.daysRemaining === 1 ? "day" : "days"} remaining`
    : access.isFree
      ? "Upgrade to Pro"
      : null;
  const endingSoon = access.isTrialActive && access.daysRemaining != null && access.daysRemaining <= 7;
  const banner = endingSoon
    ? `Your Pro trial ends in ${access.daysRemaining} ${access.daysRemaining === 1 ? "day" : "days"}. Continue enjoying unlimited stock analysis and portfolio management for ${PRO_MONTHLY_PRICE.label}.`
    : access.trialEnded && access.isFree
      ? "Your 30-day AssetScore Pro trial has ended. Your account is now on the Free plan. Upgrade to continue enjoying unlimited stock analysis and full portfolio management. Saved portfolios and favorites remain available."
      : null;

  return (
    <>
      <SiteHeaderBar name={user ? viewerName(profile) : null} notice={notice} />
      {banner ? (
        <p className="border-b border-line bg-card">
          <Link href="/pricing" className="mx-auto block w-full max-w-6xl px-6 py-3 text-sm leading-6 text-muted hover:text-foreground">
            {banner}
          </Link>
        </p>
      ) : null}
    </>
  );
}
