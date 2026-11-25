"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export function FavoriteButton({
  ticker,
  signedIn,
  initialFavorite,
  canAdd,
}: {
  ticker: string;
  signedIn: boolean;
  initialFavorite: boolean;
  canAdd: boolean;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push(`/login`);
      return;
    }
    if (!canAdd && !favorite) {
      router.push("/pricing");
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
    <div className="mt-4">
      {signedIn && !canAdd && !favorite ? (
        <Link
          href="/pricing"
          className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-medium text-foreground transition hover:bg-white/5"
        >
          Upgrade to save favorites
        </Link>
      ) : (
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-medium text-foreground transition hover:bg-white/5 disabled:opacity-60"
        >
          {favorite ? "Remove favorite" : "Add favorite"}
        </button>
      )}
      <p aria-live="polite" className="mt-2 min-h-5 text-[13px] text-[#f0a3a8]">
        {message}
      </p>
    </div>
  );
}
