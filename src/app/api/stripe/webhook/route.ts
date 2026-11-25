import { NextResponse } from "next/server";
import { rememberStripeCustomer, syncStripeSubscription } from "@/lib/billing/stripe-sync";
import { stripeClient } from "@/lib/billing/stripe";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = stripeClient();
  const admin = createSupabaseAdmin();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !admin || !secret) {
    return NextResponse.json({ message: "Billing is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ message: "Missing Stripe signature." }, { status: 400 });

  const body = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ message: "Invalid Stripe signature." }, { status: 400 });
  }

  const { error: insertError } = await admin.from("stripe_events").insert({ id: event.id, event_type: event.type });
  if (insertError) {
    if (insertError.code === "23505") return NextResponse.json({ received: true });
    return NextResponse.json({ message: "Could not record the event." }, { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id || session.client_reference_id || "";
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (userId && customerId) await rememberStripeCustomer(admin, userId, customerId);
        if (session.subscription) {
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncStripeSubscription(admin, subscription, event.created);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncStripeSubscription(admin, event.data.object, event.created);
        break;
      case "invoice.paid":
      case "invoice.payment_failed": {
        const subscriptionRef = event.data.object.parent?.subscription_details?.subscription;
        const subscriptionId = typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef?.id;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncStripeSubscription(admin, subscription, event.created);
        }
        break;
      }
      default:
        break;
    }
  } catch {
    await admin.from("stripe_events").delete().eq("id", event.id);
    return NextResponse.json({ message: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
