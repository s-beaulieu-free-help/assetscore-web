import { cookies } from "next/headers";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { loadViewer } from "@/lib/viewer";

const DAILY_EVENTS = [
  "site_view",
  "homepage_view",
  "registration_page_view",
  "stock_page_view",
  "screener_page_view",
  "pricing_page_view",
  "upgrade_click",
  "portfolio_page_view",
] as const;
const CONSENT_EVENTS = [
  "registration_completed",
  "first_stock_evaluation",
  "first_portfolio_created",
  "free_activity",
  "trial_started",
  "upgrade_clicked",
] as const;
const OPERATIONAL_EVENTS = ["checkout_started", "subscription_started", "subscription_canceled"] as const;

export type DailyEvent = (typeof DAILY_EVENTS)[number];
export type ConsentEvent = (typeof CONSENT_EVENTS)[number];
export type OperationalEvent = (typeof OPERATIONAL_EVENTS)[number];

async function consentGranted() {
  const jar = await cookies();
  return jar.get("analytics_consent")?.value === "granted";
}

export async function recordDailyCount(event: DailyEvent) {
  if (!(await consentGranted())) return;
  const admin = createSupabaseAdmin();
  if (!admin) return;
  const day = new Date().toISOString().slice(0, 10);
  const { data, error } = await admin
    .from("product_daily_counts")
    .select("total")
    .eq("day", day)
    .eq("event_name", event)
    .maybeSingle();
  if (error) return;
  if (!data) {
    await admin.from("product_daily_counts").insert({ day, event_name: event, total: 1 });
    return;
  }
  await admin
    .from("product_daily_counts")
    .update({ total: Number(data.total) + 1 })
    .eq("day", day)
    .eq("event_name", event);
}

export async function recordConsentedEvent(event: ConsentEvent, detail?: string) {
  if (!(await consentGranted())) return;
  const admin = createSupabaseAdmin();
  if (!admin) return;
  const { user } = await loadViewer();
  if (!user) return;
  const once = event !== "free_activity";
  const day = new Date().toISOString().slice(0, 10);
  const storedDetail = event === "free_activity" ? day : detail ?? null;
  if (user && (once || event === "free_activity")) {
    let query = admin.from("product_events").select("id").eq("user_id", user.id).eq("event_name", event);
    if (event === "free_activity") query = query.eq("detail", day);
    const { data, error } = await query.limit(1);
    if (error || (data && data.length > 0)) return;
  }
  await admin.from("product_events").insert({
    user_id: user?.id ?? null,
    event_name: event,
    detail: storedDetail,
  });
}

export async function recordOperationalEvent(
  admin: NonNullable<ReturnType<typeof createSupabaseAdmin>>,
  userId: string,
  event: OperationalEvent,
  detail: string,
) {
  const { error } = await admin.from("product_events").insert({
    user_id: userId,
    event_name: event,
    detail,
  });
  if (error && !/product_events|schema cache|does not exist|check constraint|23514/i.test(error.message)) {
    throw new Error(error.message);
  }
}
