"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export function RemoveFavorite({ ticker }: { ticker: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function remove() {
    const supabase = createSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("favorite_stocks").delete().eq("user_id", user.id).eq("ticker", ticker);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button type="button" onClick={remove} className="text-sm text-muted hover:text-foreground">
        Remove
      </button>
      {message ? <p className="text-[13px] text-[#f0a3a8]">{message}</p> : null}
    </div>
  );
}
