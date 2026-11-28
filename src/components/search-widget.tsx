"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const tickerPattern = /^[A-Z][A-Z0-9.-]{0,9}$/;

function placeTicker(behavior: ScrollBehavior) {
  const form = document.getElementById("analyze");
  if (!form) return false;
  const rect = form.getBoundingClientRect();
  const header = 88;
  const available = window.innerHeight - header;
  const targetTop = header + Math.max(16, (available - rect.height) / 2);
  const delta = rect.top - targetTop;
  if (Math.abs(delta) > 8) window.scrollBy({ top: delta, behavior });
  const input = document.getElementById("ticker");
  if (input instanceof HTMLInputElement && document.activeElement !== input) input.focus({ preventScroll: true });
  return Math.abs(delta) <= 8;
}

export function presentTicker() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  placeTicker(reduce ? "auto" : "smooth");
}

export function SearchWidget() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (window.location.hash !== "#analyze") return;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (placeTicker("auto") || tries > 15) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const symbol = ticker.trim().toUpperCase();

    if (!symbol) {
      setMessage("Enter a ticker symbol to continue.");
      return;
    }

    if (!tickerPattern.test(symbol)) {
      setMessage("Use a ticker symbol such as NVDA or AAPL.");
      return;
    }

    setTicker(symbol);
    router.push(`/stocks/${symbol}`);
  }

  return (
    <form id="analyze" onSubmit={onSubmit} className="w-full max-w-xl scroll-mt-28">
      <label htmlFor="ticker" className="sr-only">
        Ticker symbol
      </label>
      <div className="flex flex-col gap-2 rounded-xl border border-line bg-white/[0.03] p-1.5 transition focus-within:border-white/20 sm:flex-row sm:items-center">
        <input
          id="ticker"
          name="ticker"
          value={ticker}
          onChange={(event) => {
            setTicker(event.target.value);
            if (message) setMessage("");
          }}
          placeholder="Enter ticker symbol (AAPL, NVDA, TSLA...)"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          maxLength={12}
          className="h-11 w-full bg-transparent px-3 text-[15px] text-foreground outline-none placeholder:text-muted/70"
        />
        <button
          type="submit"
          className="h-11 shrink-0 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition hover:bg-white"
        >
          Analyze
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {["AAPL", "MSFT", "DELL"].map((symbol) => (
          <Link
            key={symbol}
            href={`/stocks/${symbol}`}
            className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-accent hover:text-foreground"
          >
            {symbol}
          </Link>
        ))}
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-[13px] leading-5 text-muted">
        {message || "US-listed tickers only."}
      </p>
    </form>
  );
}
