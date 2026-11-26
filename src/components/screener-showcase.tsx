import { UpgradeLink } from "@/components/upgrade-link";
import { SCREENER_INDEXES, loadScreenerDataset } from "@/lib/screener";
import { formatMoney } from "@/lib/stocks";

export function ScreenerShowcase() {
  const dataset = loadScreenerDataset();
  const rows = [...dataset.rows].sort((left, right) => right.score - left.score || left.symbol.localeCompare(right.symbol)).slice(0, 6);
  const updated = dataset.publishedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
      }).format(new Date(dataset.publishedAt))
    : null;

  return (
    <section id="screener" className="border-t border-line">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:py-32">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Pro · Stock Screener</p>
          <h2 className="mt-4 text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-4xl">
            Find Stocks That Match Your Criteria
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Screen companies using financial indicators and AssetScore ratings. Discover potential opportunities across
            major US stock indexes.
          </p>
          <p className="mt-4 text-sm leading-6 text-muted">
            The published screener includes S&amp;P 500, Nasdaq 100, and Dow Jones companies. Filters cover overall
            score, the five pillars, price-to-earnings, and the other figures stored in the daily dataset. The Stock
            Screener is included with the 30-day Pro trial and with Pro at $5.99 US/month.
          </p>
          <UpgradeLink
            href="/pricing"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink transition hover:brightness-110"
          >
            Explore AssetScore Pro
          </UpgradeLink>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <p className="text-sm font-medium">Stock Screener</p>
            <p className="text-xs text-muted">{updated ? `Published ${updated}` : "Daily dataset"}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-4 py-3 font-normal">Company</th>
                  <th className="px-4 py-3 font-normal">Indexes</th>
                  <th className="px-4 py-3 font-normal">AssetScore</th>
                  <th className="px-4 py-3 font-normal">Price</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-muted" colSpan={4}>
                      The daily screener dataset has not been published yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.symbol} className="border-b border-line last:border-b-0">
                      <td className="px-4 py-3">
                        <span className="font-medium">{row.symbol}</span>
                        <span className="mt-1 block text-muted">{row.name}</span>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {row.indexes
                          .map((index) => SCREENER_INDEXES.find((item) => item.id === index)?.name ?? index)
                          .join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono tabular-nums">{row.score}</span>
                        <span className="mt-1 block text-xs text-muted">{row.band}</span>
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums">{row.price == null ? "—" : formatMoney(row.price)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-4 py-3 text-xs leading-5 text-muted">
            These rows are the highest overall scores in the published daily dataset, shown with the same columns as the
            Stock Screener. Full filters stay on the Pro screener.
          </p>
        </div>
      </div>
    </section>
  );
}
