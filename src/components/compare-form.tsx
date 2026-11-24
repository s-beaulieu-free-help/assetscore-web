"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const tickerPattern = /^[A-Z][A-Z0-9.-]{0,9}$/;

export function CompareForm({ ticker }: { ticker: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const symbol = value.trim().toUpperCase();
    if (!symbol) {
      setMessage("Enter a second ticker to compare.");
      return;
    }
    if (!tickerPattern.test(symbol)) {
      setMessage("Use a ticker symbol such as AAPL or MSFT.");
      return;
    }
    if (symbol === ticker) {
      setMessage(`Choose a symbol other than ${ticker}.`);
      return;
    }
    router.push(`/compare/${ticker}/${symbol}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-xl">
      <label htmlFor="compare-ticker" className="text-sm text-muted">
        Compare {ticker} with
      </label>
      <div className="mt-3 flex flex-col gap-2 rounded-xl border border-line bg-white/[0.03] p-1.5 sm:flex-row sm:items-center">
        <input
          id="compare-ticker"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Enter ticker symbol"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          maxLength={12}
          className="h-11 w-full bg-transparent px-3 text-[15px] text-foreground outline-none placeholder:text-muted/70"
        />
        <button
          type="submit"
          className="h-11 shrink-0 rounded-lg bg-accent px-5 text-sm font-medium text-ink transition hover:brightness-110"
        >
          Compare
        </button>
      </div>
      <p aria-live="polite" className="mt-3 min-h-5 text-[13px] leading-5 text-muted">
        {message}
      </p>
    </form>
  );
}
