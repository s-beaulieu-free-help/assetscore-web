import { UpgradeLink } from "@/components/upgrade-link";
import {
  SCREENER_INDEXES,
  SCREENER_PRESETS,
  applyScreener,
  loadScreenerDataset,
  presetAvailable,
  type ScreenerFilters,
  type ScreenerRow,
} from "@/lib/screener";
import { scoreTextClass } from "@/lib/score";
import { formatMoney } from "@/lib/stocks";

const EXAMPLE_PRESET = "high-quality";

const FILTER_FIELDS: Array<{ key: keyof ScreenerFilters; label: string; field: keyof ScreenerRow | "score" }> = [
  { key: "scoreMin", label: "Minimum AssetScore", field: "score" },
  { key: "scoreMax", label: "Maximum AssetScore", field: "score" },
  { key: "valueMin", label: "Minimum Value", field: "value" },
  { key: "growthMin", label: "Minimum Growth", field: "growth" },
  { key: "qualityMin", label: "Minimum Quality", field: "quality" },
  { key: "healthMin", label: "Minimum Financial Health", field: "health" },
  { key: "momentumMin", label: "Minimum Momentum", field: "momentum" },
  { key: "peMin", label: "Minimum P/E", field: "pe" },
  { key: "peMax", label: "Maximum P/E", field: "pe" },
];

function exampleFilters(presetFilters: Partial<ScreenerFilters>): ScreenerFilters {
  return {
    indexes: SCREENER_INDEXES.map((index) => index.id),
    scoreMin: null,
    scoreMax: null,
    valueMin: null,
    valueMax: null,
    growthMin: null,
    growthMax: null,
    qualityMin: null,
    qualityMax: null,
    healthMin: null,
    healthMax: null,
    momentumMin: null,
    momentumMax: null,
    peMin: null,
    peMax: null,
    revenueGrowthMin: null,
    debtToEquityMax: null,
    currentRatioMin: null,
    marginMin: null,
    marginMax: null,
    marketCapMin: null,
    marketCapMax: null,
    priceMin: null,
    priceMax: null,
    revenueGrowthMax: null,
    debtToEquityMin: null,
    currentRatioMax: null,
    ...presetFilters,
  };
}

export function ScreenerShowcase() {
  const dataset = loadScreenerDataset();
  const preset = SCREENER_PRESETS.find((item) => item.id === EXAMPLE_PRESET);
  const filters = exampleFilters(preset && presetAvailable(preset, dataset.available) ? preset.filters : { scoreMin: 75 });
  const rows = applyScreener(dataset.rows, filters, dataset.available)
    .sort((left, right) => right.score - left.score || left.symbol.localeCompare(right.symbol))
    .slice(0, 4);
  const updated = dataset.publishedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
      }).format(new Date(dataset.publishedAt))
    : null;
  const fields = FILTER_FIELDS.filter((field) => field.field === "score" || dataset.available.has(field.field));

  return (
    <section id="screener" className="border-t border-line">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-24 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:py-32">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Discover · Stock Screener</p>
          <h2 className="mt-4 text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-4xl">
            Find Stocks That Match Your Criteria
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Screen companies using financial indicators and AssetScore ratings. Discover potential opportunities across
            major US stock indexes.
          </p>
          <p className="mt-4 text-sm leading-6 text-muted">
            Filter by index, overall AssetScore, Value, Growth, Quality, Financial Health, Momentum, and
            price-to-earnings. The Stock Screener is included with the 30-day Pro trial and with Pro at $5.99 US/month.
          </p>
          <UpgradeLink
            href="/pricing"
            className="mt-8 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink transition hover:brightness-110"
          >
            Start Your Free 30-Day Trial
          </UpgradeLink>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <p className="text-sm font-medium">Stock Screener</p>
            <p className="text-xs text-muted">{updated ? `Published ${updated}` : "Daily dataset"}</p>
          </div>
          <fieldset disabled className="bg-panel px-4 py-4">
            <legend className="text-sm font-medium">Filters</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {SCREENER_PRESETS.filter((item) => presetAvailable(item, dataset.available)).map((item) => (
                <span
                  key={item.id}
                  className={`rounded-full border px-3 py-1.5 text-xs ${item.id === EXAMPLE_PRESET ? "border-accent text-foreground" : "border-line text-muted"}`}
                >
                  {item.name}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              {SCREENER_INDEXES.map((index) => (
                <label key={index.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked readOnly />
                  {index.name}
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map((field) => {
                const value = filters[field.key];
                return (
                  <label key={field.key} className="block text-xs text-muted">
                    {field.label}
                    <input
                      readOnly
                      value={typeof value === "number" ? value : ""}
                      className="mt-1 h-10 w-full rounded-xl border border-line bg-background px-3 text-sm text-foreground"
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="overflow-x-auto border-t border-line">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-4 py-3 font-normal">Company</th>
                  <th className="px-4 py-3 font-normal">AssetScore</th>
                  <th className="px-4 py-3 font-normal">Quality</th>
                  <th className="px-4 py-3 font-normal">Health</th>
                  <th className="px-4 py-3 font-normal">Price</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-4 py-5 text-muted" colSpan={5}>
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
                      <td className="px-4 py-3">
                        <span className={`font-mono tabular-nums ${scoreTextClass(row.score)}`}>{row.score}</span>
                        <span className="mt-1 block text-xs text-muted">{row.band}</span>
                      </td>
                      <td className={`px-4 py-3 font-mono tabular-nums ${row.quality == null ? "" : scoreTextClass(row.quality)}`}>{row.quality ?? "—"}</td>
                      <td className={`px-4 py-3 font-mono tabular-nums ${row.health == null ? "" : scoreTextClass(row.health)}`}>{row.health ?? "—"}</td>
                      <td className="px-4 py-3 font-mono tabular-nums">{row.price == null ? "—" : formatMoney(row.price)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-4 py-3 text-xs leading-5 text-muted">
            Preview of the Pro screener. Highest Quality Stocks is filled in: overall score above 75, Quality above 80, and
            Financial Health above 70. The rows are companies from the published dataset that meet those filters.
          </p>
        </div>
      </div>
    </section>
  );
}
