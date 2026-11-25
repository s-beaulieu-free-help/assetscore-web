import { entitlementFromRow, visitorAccess, type Access, type SubscriptionRow } from "@/lib/billing/entitlement";
import { FREE_EVALUATION_LIMIT_FALLBACK } from "@/lib/billing/plans";
import { loadViewer } from "@/lib/viewer";

export async function loadAccess(): Promise<Access> {
  const { supabase, user } = await loadViewer();
  if (!supabase || !user) return visitorAccess();

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "user_id, plan, status, trial_started_at, trial_ends_at, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return visitorAccess();
  return entitlementFromRow((data as SubscriptionRow | null) ?? null);
}

export async function freeEvaluationLimit() {
  const { supabase } = await loadViewer();
  if (!supabase) return FREE_EVALUATION_LIMIT_FALLBACK;
  const { data } = await supabase
    .from("plan_limits")
    .select("stock_evaluations_per_month")
    .eq("id", "free")
    .maybeSingle();
  const limit = data?.stock_evaluations_per_month;
  return typeof limit === "number" && limit > 0 ? limit : FREE_EVALUATION_LIMIT_FALLBACK;
}

export async function recordStockEvaluation(ticker: string) {
  const { supabase, user } = await loadViewer();
  if (!supabase || !user) return { allowed: true as const };
  const { data, error } = await supabase.rpc("record_stock_evaluation", { p_ticker: ticker });
  if (error) {
    if (/record_stock_evaluation|schema cache|does not exist|could not find/i.test(error.message)) {
      return { allowed: true as const };
    }
    return { allowed: false as const, limit: FREE_EVALUATION_LIMIT_FALLBACK };
  }
  const result = (data ?? {}) as { allowed?: boolean; limit?: number };
  return { allowed: result.allowed !== false, limit: result.limit };
}
