export function parseTicker(value: string) {
  const ticker = value.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9.-]{0,9}$/.test(ticker)) return null;
  return ticker;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatChange(change: number, price: number) {
  const prior = price - change;
  const percent = prior === 0 ? 0 : (change / prior) * 100;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
}
