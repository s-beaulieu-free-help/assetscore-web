import type Stripe from "stripe";
import type { createSupabaseAdmin } from "@/lib/supabase/admin";

type Admin = NonNullable<ReturnType<typeof createSupabaseAdmin>>;

function iso(seconds: number | null) {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

function periodOf(subscription: Stripe.Subscription) {
  const loose = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  const item = subscription.items.data[0] as { current_period_start?: number; current_period_end?: number } | undefined;
  return {
    start: loose.current_period_start ?? item?.current_period_start ?? null,
    end: loose.current_period_end ?? item?.current_period_end ?? null,
    priceId: subscription.items.data[0]?.price?.id ?? null,
  };
}

export async function syncStripeSubscription(admin: Admin, subscription: Stripe.Subscription, eventCreated: number) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  let userId = subscription.metadata.user_id || "";
  if (!userId) {
    const { data } = await admin.from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
    userId = data?.user_id ?? "";
  }
  if (!userId) return;

  const { data: existing } = await admin
    .from("subscriptions")
    .select("plan, trial_ends_at, stripe_event_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (typeof existing?.stripe_event_at === "number" && existing.stripe_event_at > eventCreated) return;

  const { start, end, priceId } = periodOf(subscription);
  const pricePlan =
    priceId && priceId === process.env.STRIPE_PRICE_PRO_ANNUAL
      ? "pro_annual"
      : priceId && priceId === process.env.STRIPE_PRICE_PRO_MONTHLY
        ? "pro_monthly"
        : null;
  const trialEndsAt = existing?.trial_ends_at ?? null;
  const trialStillActive = Boolean(trialEndsAt) && new Date(trialEndsAt as string).getTime() > Date.now();
  const paid = (subscription.status === "active" || subscription.status === "trialing") && pricePlan;

  let plan = "free";
  let status = "canceled";
  if (paid && pricePlan) {
    plan = pricePlan;
    status = "active";
  } else if (subscription.status === "past_due") {
    plan = pricePlan ?? (existing?.plan === "pro_monthly" || existing?.plan === "pro_annual" ? existing.plan : "free");
    status = "past_due";
  } else if (subscription.status === "incomplete") {
    plan = trialStillActive ? "trial" : "free";
    status = "incomplete";
  } else if (trialStillActive) {
    plan = "trial";
    status = "trialing";
  } else if (subscription.status === "unpaid") {
    status = "unpaid";
  }

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      plan,
      status,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      current_period_start: iso(start),
      current_period_end: iso(end),
      cancel_at_period_end: subscription.cancel_at_period_end,
      stripe_event_at: eventCreated,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
}

export async function rememberStripeCustomer(admin: Admin, userId: string, customerId: string) {
  const { data: existing } = await admin.from("subscriptions").select("user_id").eq("user_id", userId).maybeSingle();
  if (existing) {
    const { error } = await admin
      .from("subscriptions")
      .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await admin.from("subscriptions").insert({
    user_id: userId,
    plan: "free",
    status: "free",
    stripe_customer_id: customerId,
  });
  if (error) throw new Error(error.message);
}
