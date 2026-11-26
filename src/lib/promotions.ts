import { PRO_ANNUAL_PRICE, PRO_MONTHLY_PRICE } from "@/lib/billing/plans";

export const PROMOTION_PLACEMENTS = ["stock", "portfolio", "account"] as const;

export type PromotionPlacement = (typeof PROMOTION_PLACEMENTS)[number];

export type PromotionCampaign = {
  id: string;
  name: string;
  headline: string;
  description: string;
  cta: string;
  href: string;
  placements: PromotionPlacement[];
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  priority: number;
};

export const PROMOTIONS: PromotionCampaign[] = [
  {
    id: "unlock-analysis",
    name: "Unlock AssetScore Pro",
    headline: "Get More From Every Stock Analysis",
    description: "Unlock the full potential of AssetScore with unlimited stock evaluations and advanced investment tools.",
    cta: "Explore Pro",
    href: "/pricing",
    placements: ["stock"],
    active: true,
    startsAt: null,
    endsAt: null,
    priority: 50,
  },
  {
    id: "portfolio-tools",
    name: "Portfolio Management",
    headline: "Your Investments Deserve More",
    description:
      "Take your investment research further with AssetScore Pro portfolio tools. You can create portfolios, set allocations, and see the weighted portfolio score.",
    cta: "Unlock Portfolio Tools",
    href: "/pricing",
    placements: ["portfolio"],
    active: true,
    startsAt: null,
    endsAt: null,
    priority: 40,
  },
  {
    id: "beyond-score",
    name: "Better Investment Decisions",
    headline: "Go Beyond a Stock Score",
    description: "Get more powerful tools to evaluate, compare, and understand companies.",
    cta: "Upgrade to Pro",
    href: "/pricing",
    placements: ["stock"],
    active: true,
    startsAt: null,
    endsAt: null,
    priority: 30,
  },
  {
    id: "annual-pro",
    name: "Annual Subscription",
    headline: "Get AssetScore Pro for Less",
    description: `Enjoy the full Pro experience for just ${PRO_ANNUAL_PRICE.label}. That is about 30% less than paying monthly.`,
    cta: "Get Annual Pro",
    href: "/pricing#annual",
    placements: ["account"],
    active: true,
    startsAt: null,
    endsAt: null,
    priority: 60,
  },
  {
    id: "monthly-pro",
    name: "Monthly Subscription",
    headline: "Unlock More With Pro",
    description: `Get unlimited stock evaluations for only ${PRO_MONTHLY_PRICE.label}.`,
    cta: "Explore Pro",
    href: "/pricing#monthly",
    placements: ["stock"],
    active: true,
    startsAt: null,
    endsAt: null,
    priority: 20,
  },
];

const knownIds = new Set(PROMOTIONS.map((campaign) => campaign.id));

export function isPromotionId(value: string) {
  return knownIds.has(value);
}

export function parsePromotionIds(value: string | undefined) {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => knownIds.has(part));
}

export function activePromotions(placement: PromotionPlacement, now = Date.now()) {
  return PROMOTIONS.filter((campaign) => {
    if (!campaign.active || !campaign.placements.includes(placement)) return false;
    if (campaign.startsAt && new Date(campaign.startsAt).getTime() > now) return false;
    if (campaign.endsAt && new Date(campaign.endsAt).getTime() <= now) return false;
    return true;
  }).sort((left, right) => right.priority - left.priority || left.id.localeCompare(right.id));
}

export function choosePromotion(
  campaigns: PromotionCampaign[],
  state: { dismissed: string[]; seen: string[]; turn: number },
) {
  const available = campaigns.filter((campaign) => !state.dismissed.includes(campaign.id));
  if (available.length === 0) return null;
  const unseen = available.filter((campaign) => !state.seen.includes(campaign.id));
  if (unseen.length > 0) return unseen[0];
  const turn = Number.isFinite(state.turn) ? state.turn : 0;
  return available[((turn % available.length) + available.length) % available.length];
}
