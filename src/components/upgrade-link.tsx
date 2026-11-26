"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function UpgradeLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        void fetch("/api/analytics", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ event: "upgrade_click" }),
        });
      }}
    >
      {children}
    </Link>
  );
}
