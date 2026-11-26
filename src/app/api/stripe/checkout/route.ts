import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { rememberStripeCustomer } from "@/lib/billing/stripe-sync";
import { stripeClient, stripePriceId } from "@/lib/billing/stripe";
import { isPromotionId } from "@/lib/promotions";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  const admin = createSupabaseAdmin();
  const stripe = stripeClient();
  if (!supabase || !admin || !stripe) {
    return NextResponse.json({ message: "Billing is not configured yet." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Log in to subscribe." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { interval?: string } | null;
  const interval = body?.interval === "year" ? "year" : body?.interval === "month" ? "month" : null;
  const price = interval ? stripePriceId(interval) : null;
  if (!interval || !price) {
    return NextResponse.json({ message: "Choose a monthly or annual plan." }, { status: 400 });
  }

  const { data: row } = await admin
    .from("subscriptions")
    .select("plan, status, stripe_customer_id, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const paid =
    (row?.plan === "pro_monthly" || row?.plan === "pro_annual") &&
    row.status === "active" &&
    (!row.current_period_end || new Date(row.current_period_end).getTime() > Date.now());
  if (paid && row.stripe_customer_id) {
    const origin = new URL(request.url).origin;
    const portal = await stripe.billingPortal.sessions.create({
      customer: row.stripe_customer_id,
      return_url: `${origin}/account`,
    });
    return NextResponse.json({ url: portal.url });
  }

  let customerId = row?.stripe_customer_id ?? "";
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await rememberStripeCustomer(admin, user.id, customerId);
  }

  const origin = new URL(request.url).origin;
  const campaign = (await cookies()).get("promo_campaign")?.value ?? "";
  const promoCampaign = isPromotionId(campaign) ? campaign : "";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/pricing?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancel`,
    metadata: { user_id: user.id, promo_campaign: promoCampaign },
    subscription_data: { metadata: { user_id: user.id, promo_campaign: promoCampaign } },
  });

  return NextResponse.json({ url: session.url });
}
