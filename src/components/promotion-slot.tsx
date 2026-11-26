import { cookies } from "next/headers";
import { HousePromotion } from "@/components/house-promotion";
import { activePromotions, choosePromotion, parsePromotionIds, type PromotionPlacement } from "@/lib/promotions";

export async function PromotionSlot({
  placement,
  enabled,
}: {
  placement: PromotionPlacement;
  enabled: boolean;
}) {
  if (!enabled) return null;
  const jar = await cookies();
  const campaigns = activePromotions(placement);
  const campaign = choosePromotion(campaigns, {
    dismissed: parsePromotionIds(jar.get("promo_dismissed")?.value),
    seen: parsePromotionIds(jar.get(`promo_seen_${placement}`)?.value),
    turn: 0,
  });
  if (!campaign) return null;
  return <HousePromotion placement={placement} campaign={campaign} campaignIds={campaigns.map((item) => item.id)} />;
}
