"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function readConsent() {
  const match = document.cookie.match(/(?:^|; )analytics_consent=(granted|denied)/);
  return match?.[1] ?? null;
}

export function AnalyticsConsent() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() == null);
  }, []);

  function choose(value: "granted" | "denied") {
    document.cookie = `analytics_consent=${value}; path=/; max-age=31536000; samesite=lax`;
    setVisible(false);
    if (value === "granted") {
      if (!sessionStorage.getItem("assetscore_site_view")) {
        sessionStorage.setItem("assetscore_site_view", "1");
        void fetch("/api/analytics", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ event: "site_view" }),
        });
      }
      router.refresh();
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-background/95 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-muted">
          AssetScore can count visits, product steps, and Pro promotion views so we can see where people stop. These
          counts do not include your name, email, portfolio, or payment details.{" "}
          <Link href="/privacy" className="text-foreground hover:text-accent">
            Privacy
          </Link>
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-medium text-ink"
          >
            Allow counts
          </button>
        </div>
      </div>
    </div>
  );
}
