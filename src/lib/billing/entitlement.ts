import { PRO_ANNUAL_PRICE, PRO_MONTHLY_PRICE } from "@/lib/billing/plans";

export type SubscriptionRow = {
  user_id: string;
  plan: string;
  status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export type Access = {
  plan: "visitor" | "free" | "trial" | "pro_monthly" | "pro_annual";
  isTrialActive: boolean;
  isPro: boolean;
  isFree: boolean;
  canUseUnlimitedAnalysis: boolean;
  canCreatePortfolio: boolean;
  canUseAdvancedPortfolioAnalysis: boolean;
  canCompareStocks: boolean;
  canViewHistoricalScores: boolean;
  canReview: boolean;
  canAddFavorite: boolean;
  shouldDisplayAds: boolean;
  trialEndsAt: string | null;
  daysRemaining: number | null;
  trialEnded: boolean;
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  billingLabel: string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function trialDaysRemaining(endsAt: string, now: number) {
  const remaining = new Date(endsAt).getTime() - now;
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / DAY_MS);
}

function paidActive(row: SubscriptionRow, now: number) {
  if (row.plan !== "pro_monthly" && row.plan !== "pro_annual") return false;
  if (row.status !== "active") return false;
  if (!row.current_period_end) return true;
  return new Date(row.current_period_end).getTime() > now;
}

function trialActive(row: SubscriptionRow, now: number) {
  return Boolean(row.trial_ends_at) && new Date(row.trial_ends_at as string).getTime() > now;
}

function fullAccess(plan: Access["plan"], extra: Partial<Access> = {}): Access {
  const paid = plan === "pro_monthly" || plan === "pro_annual";
  return {
    plan,
    isTrialActive: plan === "trial",
    isPro: paid || plan === "trial",
    isFree: false,
    canUseUnlimitedAnalysis: true,
    canCreatePortfolio: true,
    canUseAdvancedPortfolioAnalysis: true,
    canCompareStocks: true,
    canViewHistoricalScores: true,
    canReview: true,
    canAddFavorite: true,
    shouldDisplayAds: false,
    trialEndsAt: null,
    daysRemaining: null,
    trialEnded: false,
    status: null,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: null,
    billingLabel: plan === "pro_monthly" ? PRO_MONTHLY_PRICE.label : plan === "pro_annual" ? PRO_ANNUAL_PRICE.label : null,
    ...extra,
  };
}

export function visitorAccess(): Access {
  return fullAccess("visitor");
}

export function freeAccess(extra: Partial<Access> = {}): Access {
  return {
    ...fullAccess("free"),
    plan: "free",
    isTrialActive: false,
    isPro: false,
    isFree: true,
    canUseUnlimitedAnalysis: false,
    canCreatePortfolio: false,
    canUseAdvancedPortfolioAnalysis: false,
    canCompareStocks: false,
    canViewHistoricalScores: false,
    canReview: false,
    canAddFavorite: false,
    shouldDisplayAds: true,
    billingLabel: null,
    ...extra,
  };
}

export function entitlementFromRow(row: SubscriptionRow | null, now = Date.now()): Access {
  if (!row) return freeAccess();

  if (paidActive(row, now)) {
    return fullAccess(row.plan as "pro_monthly" | "pro_annual", {
      status: row.status,
      cancelAtPeriodEnd: row.cancel_at_period_end,
      currentPeriodEnd: row.current_period_end,
      trialEndsAt: row.trial_ends_at,
      trialEnded: Boolean(row.trial_ends_at) && !trialActive(row, now),
    });
  }

  if (trialActive(row, now)) {
    return fullAccess("trial", {
      trialEndsAt: row.trial_ends_at,
      daysRemaining: trialDaysRemaining(row.trial_ends_at as string, now),
      status: "trialing",
    });
  }

  return freeAccess({
    trialEndsAt: row.trial_ends_at,
    trialEnded: Boolean(row.trial_ends_at),
    status: row.status,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    currentPeriodEnd: row.current_period_end,
  });
}
