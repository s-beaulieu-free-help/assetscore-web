"use client";

import { useEffect } from "react";

export function CenterHashTarget() {
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      const target = document.getElementById(id);
      if (!target) {
        if (tries > 15) window.clearInterval(timer);
        return;
      }
      const rect = target.getBoundingClientRect();
      const header = 88;
      const available = window.innerHeight - header;
      const targetTop = header + (available - rect.height) / 2;
      const delta = rect.top - targetTop;
      if (Math.abs(delta) > 8) window.scrollBy({ top: delta, behavior: "auto" });
      if (Math.abs(delta) <= 8 || tries > 15) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}
