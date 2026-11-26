"use client";

import { useEffect } from "react";

export function VisitBeacon() {
  useEffect(() => {
    if (!document.cookie.includes("analytics_consent=granted")) return;
    if (sessionStorage.getItem("assetscore_site_view")) return;
    sessionStorage.setItem("assetscore_site_view", "1");
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "site_view" }),
    });
  }, []);

  return null;
}
