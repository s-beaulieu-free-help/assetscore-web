import { NextResponse } from "next/server";
import { recordConsentedEvent, type ConsentEvent } from "@/lib/analytics";

const allowed = new Set<ConsentEvent>([
  "registration_completed",
  "first_stock_evaluation",
  "first_portfolio_created",
  "free_activity",
]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { event?: string } | null;
  const event = body?.event;
  if (!event || !allowed.has(event as ConsentEvent)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await recordConsentedEvent(event as ConsentEvent);
  return NextResponse.json({ ok: true });
}
