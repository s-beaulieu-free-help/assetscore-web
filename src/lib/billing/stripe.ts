import Stripe from "stripe";

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-11-18.endive" });
}

export function stripePriceId(interval: "month" | "year") {
  return interval === "year" ? process.env.STRIPE_PRICE_PRO_ANNUAL : process.env.STRIPE_PRICE_PRO_MONTHLY;
}

export function billingConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_PRO_MONTHLY &&
      process.env.STRIPE_PRICE_PRO_ANNUAL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
