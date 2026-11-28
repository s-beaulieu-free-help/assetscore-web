"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MouseEvent, ReactNode } from "react";
import { presentTicker } from "@/components/search-widget";

export function AnalyzeStockLink({ className, children }: { className: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (pathname !== "/") {
      router.push("/#analyze");
      return;
    }
    window.history.replaceState(null, "", "/#analyze");
    presentTicker();
  }

  return (
    <Link href="/#analyze" onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
