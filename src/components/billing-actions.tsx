"use client";

import { useState } from "react";

const buttonClass = "inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-ink disabled:opacity-60";
const quietClass = "inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm text-foreground disabled:opacity-60";

export function BillingActions({
  showMonthly = false,
  showPortal = false,
}: {
  showMonthly?: boolean;
  showPortal?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState("");

  async function open(path: string, body: Record<string, string> | null, key: string) {
    if (key === "month") {
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ event: "upgrade_click" }),
      });
    }
    setPending(key);
    setMessage("");
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body ? JSON.stringify(body) : "{}",
      });
      const payload = (await response.json().catch(() => null)) as { url?: string; message?: string } | null;
      if (!response.ok || !payload?.url) {
        setMessage(payload?.message || "Billing is unavailable.");
        setPending("");
        return;
      }
      window.location.assign(payload.url);
    } catch {
      setMessage("Billing is unavailable.");
      setPending("");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {showMonthly ? (
          <button type="button" className={buttonClass} disabled={Boolean(pending)} onClick={() => open("/api/stripe/checkout", { interval: "month" }, "month")}>
            {pending === "month" ? "Opening checkout…" : "Subscribe — $5.99 US/month"}
          </button>
        ) : null}
        {showPortal ? (
          <button type="button" className={quietClass} disabled={Boolean(pending)} onClick={() => open("/api/stripe/portal", null, "portal")}>
            {pending === "portal" ? "Opening billing…" : "Manage Subscription"}
          </button>
        ) : null}
      </div>
      <p className="mt-3 min-h-5 text-[13px] text-muted">{message}</p>
    </div>
  );
}
