"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { PromotionCampaign, PromotionPlacement } from "@/lib/promotions";
import { isPromotionId, parsePromotionIds } from "@/lib/promotions";

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function writeCookie(name: string, value: string, persistent: boolean) {
  const lifetime = persistent ? "; max-age=15552000" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax${lifetime}`;
}

export function HousePromotion({
  placement,
  campaign,
  campaignIds,
}: {
  placement: PromotionPlacement;
  campaign: PromotionCampaign;
  campaignIds: string[];
}) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const key = `promo-impression:${campaign.id}:${placement}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const seenName = `promo_seen_${placement}`;
    let seen = parsePromotionIds(readCookie(seenName));
    if (!seen.includes(campaign.id)) seen = [...seen, campaign.id];
    const remaining = campaignIds.filter((id) => !seen.includes(id));
    writeCookie(seenName, remaining.length === 0 ? "" : seen.join(","), false);

    void fetch("/api/promotions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "impression", campaignId: campaign.id, placement }),
    });
  }, [campaign.id, campaignIds, placement]);

  function dismiss() {
    const dismissed = parsePromotionIds(readCookie("promo_dismissed"));
    writeCookie("promo_dismissed", [...new Set([...dismissed, campaign.id])].join(","), true);
    setHidden(true);
    router.refresh();
  }

  function trackClick() {
    if (!isPromotionId(campaign.id)) return;
    writeCookie("promo_campaign", campaign.id, true);
    void fetch("/api/promotions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "click", campaignId: campaign.id, placement }),
    });
  }

  if (hidden) return null;

  return (
    <aside
      aria-label={campaign.name}
      className="mt-8 rounded-2xl border border-line bg-card px-6 py-6"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{campaign.name}</p>
          <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">{campaign.headline}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{campaign.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Link
            href={campaign.href}
            onClick={trackClick}
            className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink transition hover:brightness-110"
          >
            {campaign.cta}
          </Link>
          <button type="button" onClick={dismiss} className="text-sm text-muted hover:text-foreground">
            Dismiss
          </button>
        </div>
      </div>
    </aside>
  );
}
