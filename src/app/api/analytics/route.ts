import { NextResponse } from "next/server";
import { recordConsentedEvent, recordDailyCount, type ConsentEvent, type DailyEvent } from "@/lib/analytics";

const daily = new Set<DailyEvent>([
  "site_view",
  "homepage_view",
  "registration_page_view",
  "stock_page_view",
  "screener_page_view",
  "pricing_page_view",
  "upgrade_click",
  "portfolio_page_view",
]);

const consented = new Set<ConsentEvent>([
  "registration_completed",
  "first_stock_evaluation",
  "first_portfolio_created",
  "free_activity",
  "trial_started",
  "upgrade_clicked",
]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { event?: string } | null;
  const event = body?.event;
  if (!event) return NextResponse.json({ ok: false }, { status: 400 });
  if (event === "upgrade_click") {
    await recordDailyCount("upgrade_click");
    await recordConsentedEvent("upgrade_clicked");
    return NextResponse.json({ ok: true });
  }
  if (daily.has(event as DailyEvent)) {
    await recordDailyCount(event as DailyEvent);
    return NextResponse.json({ ok: true });
  }
  if (!consented.has(event as ConsentEvent)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await recordConsentedEvent(event as ConsentEvent);
  return NextResponse.json({ ok: true });
}
