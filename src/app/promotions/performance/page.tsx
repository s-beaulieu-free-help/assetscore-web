import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { loadViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Promotion performance · AssetScore", robots: { index: false, follow: false } };

type StatRow = {
  campaign_id: string;
  placement: string;
  impressions: number;
  clicks: number;
};

export default async function PromotionPerformancePage() {
  const { user } = await loadViewer();
  const allowed = process.env.PROMO_REPORT_EMAIL;
  if (!user?.email || !allowed || user.email !== allowed) notFound();

  const admin = createSupabaseAdmin();
  const { data, error } = admin
    ? await admin.from("promo_campaign_stats").select("campaign_id, placement, impressions, clicks")
    : { data: null, error: { message: "The service role is not configured." } };

  const rows = (data ?? []) as StatRow[];
  const funnelEvents = [
    "registration_completed",
    "trial_started",
    "first_stock_evaluation",
    "first_portfolio_created",
    "upgrade_clicked",
    "checkout_started",
    "subscription_started",
    "subscription_canceled",
  ];
  const daily = admin
    ? await admin.from("product_daily_counts").select("day, event_name, total").order("day", { ascending: false }).limit(80)
    : { data: null, error: null };
  const eventCounts = admin
    ? await Promise.all(
        funnelEvents.map(async (eventName) => {
          const result = await admin
            .from("product_events")
            .select("id", { count: "exact", head: true })
            .eq("event_name", eventName);
          return { eventName, count: result.count ?? 0, error: result.error?.message ?? "" };
        }),
      )
    : [];
  const subscribers = admin
    ? await admin
        .from("subscriptions")
        .select("user_id", { count: "exact", head: true })
        .eq("plan", "pro_monthly")
        .eq("status", "active")
    : { count: null, error: { message: "The service role is not configured." } };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Promotions</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em]">Campaign performance</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Counts include only people who allowed product counts. Click-through rate is clicks divided by impressions.
        </p>
        {error ? <p className="mt-6 text-sm text-muted">{error.message}</p> : null}
        <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-normal">Campaign</th>
                <th className="px-4 py-3 font-normal">Placement</th>
                <th className="px-4 py-3 font-normal">Impressions</th>
                <th className="px-4 py-3 font-normal">Clicks</th>
                <th className="px-4 py-3 font-normal">Click-through rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-muted" colSpan={5}>
                    No promotion counts yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const impressions = Number(row.impressions);
                  const clicks = Number(row.clicks);
                  const rate = impressions > 0 ? `${Math.round((clicks / impressions) * 1000) / 10}%` : "—";
                  return (
                    <tr key={`${row.campaign_id}-${row.placement}`} className="border-b border-line last:border-b-0">
                      <td className="px-4 py-3">{row.campaign_id}</td>
                      <td className="px-4 py-3">{row.placement}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{impressions}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{clicks}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{rate}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <h2 className="mt-16 text-2xl font-medium tracking-[-0.03em]">Conversion counts</h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Daily totals are visits from people who allowed counts. Account steps are one row per event. Active Pro is
          the number of monthly subscriptions marked active. These tables do not list names or email addresses.
        </p>
        {subscribers.error ? <p className="mt-4 text-sm text-muted">{subscribers.error.message}</p> : null}
        <p className="mt-4 text-sm">
          Active monthly subscribers: <span className="font-mono">{subscribers.count ?? "—"}</span>
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-normal">Account step</th>
                <th className="px-4 py-3 font-normal">Count</th>
              </tr>
            </thead>
            <tbody>
              {eventCounts.map((row) => (
                <tr key={row.eventName} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3">{row.eventName}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{row.error ? "—" : row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-normal">Day</th>
                <th className="px-4 py-3 font-normal">Visit count</th>
                <th className="px-4 py-3 font-normal">Total</th>
              </tr>
            </thead>
            <tbody>
              {(daily.data ?? []).length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-muted" colSpan={3}>
                    {daily.error?.message || "No visit totals yet."}
                  </td>
                </tr>
              ) : (
                (daily.data ?? []).map((row) => (
                  <tr key={`${row.day}-${row.event_name}`} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">{row.day}</td>
                    <td className="px-4 py-3">{row.event_name}</td>
                    <td className="px-4 py-3 font-mono tabular-nums">{row.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
