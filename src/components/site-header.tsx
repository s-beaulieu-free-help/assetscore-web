import { SiteHeaderBar } from "@/components/site-header-bar";
import { loadAccess } from "@/lib/billing/access";
import { loadViewer, viewerName } from "@/lib/viewer";

export async function SiteHeader() {
  const [{ user, profile }, access] = await Promise.all([loadViewer(), loadAccess()]);
  const notice = access.isTrialActive
    ? `Pro Trial — ${access.daysRemaining} ${access.daysRemaining === 1 ? "day" : "days"} remaining`
    : access.isFree
      ? "Upgrade to Pro"
      : null;
  return <SiteHeaderBar name={user ? viewerName(profile) : null} notice={notice} />;
}
