"use client";

import { FormEvent, useState } from "react";

export function SearchWidget() {
  const [ticker, setTicker] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const symbol = ticker.trim().toUpperCase();

    if (!symbol) {
      setMessage("Enter a ticker symbol to continue.");
      return;
    }

    setTicker(symbol);
    setMessage(
      `${symbol} is queued for scoring. Live analysis opens in the next release. The NVDA card shows the score format.`,
    );
  }

  return (
    <form id="analyze" onSubmit={onSubmit} className="w-full max-w-xl">
      <label htmlFor="ticker" className="sr-only">
        Ticker symbol
      </label>
      <div className="flex flex-col gap-2 rounded-xl border border-line bg-white/[0.03] p-1.5 transition focus-within:border-white/20 sm:flex-row sm:items-center">
        <input
          id="ticker"
          name="ticker"
          value={ticker}
          onChange={(event) => setTicker(event.target.value)}
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
      <p aria-live="polite" className="mt-3 min-h-5 text-[13px] leading-5 text-muted">
        {message}
      </p>
    </form>
  );
}
