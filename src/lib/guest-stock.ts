const TICKER = /^[A-Z][A-Z0-9.-]{0,9}$/;

export const GUEST_STOCK_COOKIE = "as_guest_stock";

export function tickerFromStockPath(path: string) {
  const pathname = path.split("?")[0] ?? "";
  let segment = pathname.match(/^\/stocks\/([^/]+)\/?$/)?.[1];
  if (!segment) return null;
  try {
    segment = decodeURIComponent(segment);
  } catch {
    return null;
  }
  const ticker = segment.trim().toUpperCase();
  if (!TICKER.test(ticker)) return null;
  return ticker;
}

export function guestStockGate(pathname: string, seenRaw: string | undefined, signedIn: boolean) {
  const ticker = tickerFromStockPath(pathname);
  if (!ticker || signedIn) return { action: "continue" as const };
  const seen = seenRaw?.trim().toUpperCase();
  if (seen && TICKER.test(seen) && seen !== ticker) {
    return { action: "register" as const, ticker };
  }
  if (!seen || !TICKER.test(seen)) return { action: "remember" as const, ticker };
  return { action: "continue" as const };
}

export function isPrefetchRequest(getHeader: (name: string) => string | null) {
  const purpose = getHeader("purpose") ?? getHeader("sec-purpose");
  return (
    getHeader("next-router-prefetch") === "1" ||
    getHeader("next-router-segment-prefetch") === "1" ||
    getHeader("x-middleware-prefetch") === "1" ||
    purpose === "prefetch"
  );
}

export function afterSignupPath(next: string) {
  const ticker = tickerFromStockPath(next);
  if (!ticker) return next;
  return `/stocks/${ticker}?welcome=1`;
}
