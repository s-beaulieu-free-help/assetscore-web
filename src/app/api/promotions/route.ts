import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { PROMOTION_PLACEMENTS, isPromotionId, PROMOTIONS, type PromotionPlacement } from "@/lib/promotions";
import { loadViewer } from "@/lib/viewer";

export async function POST(request: Request) {
  const jar = await cookies();
  if (jar.get("analytics_consent")?.value !== "granted") {
    return NextResponse.json({ ok: true });
  }

  const body = (await request.json().catch(() => null)) as {
    event?: string;
    campaignId?: string;
    placement?: string;
  } | null;
  const event = body?.event === "impression" || body?.event === "click" ? body.event : null;
  const campaignId = body?.campaignId ?? "";
  const placement = body?.placement ?? "";
  const campaign = PROMOTIONS.find((item) => item.id === campaignId);
  if (!event || !isPromotionId(campaignId) || !campaign) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!PROMOTION_PLACEMENTS.includes(placement as PromotionPlacement) || !campaign.placements.includes(placement as PromotionPlacement)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  if (!admin) return NextResponse.json({ ok: true });
  const { user } = await loadViewer();
  const { error } = await admin.from("promo_events").insert({
    user_id: user?.id ?? null,
    campaign_id: campaignId,
    placement,
    event_name: event,
  });
  if (error && !/promo_events|schema cache|does not exist/i.test(error.message)) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
