"use client";

import Link from "next/link";
import { ProEnables } from "@/components/pro-enables";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export function FavoriteButton({
  ticker,
  signedIn,
  initialFavorite,
  canAdd,
  compact = false,
}: {
  ticker: string;
  signedIn: boolean;
  initialFavorite: boolean;
  canAdd: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [needsPro, setNeedsPro] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push(`/login`);
      return;
    }
    if (!canAdd && !favorite) {
      setNeedsPro(true);
      return;
    }
    setPending(true);
    setMessage("");
    const supabase = createSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setPending(false);
      router.push("/login");
      return;
    }

    const result = favorite
      ? await supabase.from("favorite_stocks").delete().eq("user_id", user.id).eq("ticker", ticker)
      : await supabase.from("favorite_stocks").insert({ user_id: user.id, ticker });
    setPending(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    setFavorite(!favorite);
    router.refresh();
  }

  return (
    <div className={compact ? "" : "mt-4"}>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`inline-flex items-center rounded-full border border-line font-medium text-foreground transition hover:bg-white/5 disabled:opacity-60 ${compact ? "h-9 px-3 text-xs" : "h-11 px-5 text-sm"}`}
      >
        {favorite ? "Remove favorite" : "Add favorite"}
      </button>
      {needsPro ? (
        <div className={compact ? "mt-2 max-w-xs" : "mt-3 max-w-xl"}>
          <p className="text-sm leading-6 text-foreground">Save another company with Pro.</p>
          {compact ? null : <ProEnables className="mt-3" />}
          <p className="mt-3 text-sm leading-6 text-muted">
            Pro is {PRO_MONTHLY_PRICE.label}. A paid plan starts only when you subscribe.
          </p>
          <Link href="/pricing" className="mt-3 inline-flex text-sm text-foreground hover:text-accent">
            See AssetScore Pro
          </Link>
        </div>
      ) : null}
      <p aria-live="polite" className="mt-2 min-h-5 text-[13px] text-[#f0a3a8]">
        {message}
      </p>
    </div>
  );
}
