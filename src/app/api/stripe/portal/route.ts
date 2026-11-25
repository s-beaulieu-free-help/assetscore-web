import { NextResponse } from "next/server";
import { stripeClient } from "@/lib/billing/stripe";
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
  if (!user) return NextResponse.json({ message: "Log in to manage billing." }, { status: 401 });

  const { data: row } = await admin.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
  if (!row?.stripe_customer_id) {
    return NextResponse.json({ message: "No Stripe billing account exists for this user yet." }, { status: 409 });
  }

  const origin = new URL(request.url).origin;
  const portal = await stripe.billingPortal.sessions.create({
    customer: row.stripe_customer_id,
    return_url: `${origin}/account`,
  });
  return NextResponse.json({ url: portal.url });
}
