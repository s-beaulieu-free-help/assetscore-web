import { entitlementFromRow, type SubscriptionRow } from "../src/lib/billing/entitlement";
import { activePromotions, choosePromotion, type PromotionCampaign } from "../src/lib/promotions";

function row(partial: Partial<SubscriptionRow>): SubscriptionRow {
  return {
    user_id: "user",
    plan: "free",
    status: "free",
    trial_started_at: null,
    trial_ends_at: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
    ...partial,
  };
}

const now = Date.parse("2026-11-25T00:00:00Z");
const future = new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString();
const past = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();

const free = entitlementFromRow(row({ plan: "free", status: "free", trial_ends_at: past }), now);
const trial = entitlementFromRow(row({ plan: "trial", status: "trialing", trial_ends_at: future }), now);
const pro = entitlementFromRow(
  row({
    plan: "pro_monthly",
    status: "active",
    current_period_end: future,
    trial_ends_at: past,
  }),
  now,
);
const expired = entitlementFromRow(row({ plan: "free", status: "free", trial_ends_at: past }), now);

if (!free.shouldDisplayAds || !free.isFree) throw new Error("Free accounts should see promotions.");
if (trial.shouldDisplayAds || !trial.isTrialActive) throw new Error("Trial accounts should not see promotions.");
if (pro.shouldDisplayAds || pro.plan !== "pro_monthly") throw new Error("Pro accounts should not see promotions.");
if (!expired.shouldDisplayAds || !expired.trialEnded) throw new Error("An expired trial should see Free promotions.");

const stock = activePromotions("stock", now);
if (stock.map((item) => item.id).join(",") !== "unlock-analysis,beyond-score,monthly-pro") {
  throw new Error(`Unexpected stock rotation order: ${stock.map((item) => item.id).join(",")}`);
}
if (activePromotions("portfolio", now).length !== 1) throw new Error("Portfolio placement should have one campaign.");
if (activePromotions("account", now)[0]?.id !== "monthly-pro") throw new Error("Account placement should offer monthly Pro.");
if (JSON.stringify(activePromotions("account", now)).includes("49.99")) throw new Error("Promotions must not advertise an annual price.");

const sample: PromotionCampaign[] = stock;
const first = choosePromotion(sample, { dismissed: [], seen: [], turn: 0 });
const second = choosePromotion(sample, { dismissed: [], seen: [first?.id ?? ""], turn: 0 });
const third = choosePromotion(sample, { dismissed: ["unlock-analysis", "beyond-score"], seen: [], turn: 0 });
const none = choosePromotion(sample, { dismissed: sample.map((item) => item.id), seen: [], turn: 0 });
if (first?.id !== "unlock-analysis" || second?.id !== "beyond-score" || third?.id !== "monthly-pro" || none !== null) {
  throw new Error("Promotion rotation or dismissal did not behave as expected.");
}

const inactive = activePromotions("stock", now).filter((item) => item.id === "missing");
if (inactive.length !== 0) throw new Error("Unknown campaigns must stay out of rotation.");

console.log("promotion checks passed");
