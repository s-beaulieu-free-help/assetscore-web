import type { Metadata } from "next";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { deleteScreen, saveScreen } from "@/app/screener/actions";
import { loadAccess } from "@/lib/billing/access";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import {
  SCREENER_INDEXES,
  SCREENER_PRESETS,
  applyScreener,
  canUseScreener,
  filtersFromSearch,
  filtersFromStored,
  loadScreenerDataset,
  pageScreener,
  presetAvailable,
  screenerQuery,
  sortScreener,
  type ScreenerFilters,
  type ScreenerSort,
} from "@/lib/screener";
import { formatMoney } from "@/lib/stocks";
import { createSupabaseServer } from "@/lib/supabase/server";
import { loadViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";

const title = "Stock Screener — Find Stocks by Financial Health and AssetScore";
const description =
  "Discover stocks using AssetScore's five financial pillars, valuation metrics, growth indicators, and financial health filters.";

const notices: Record<string, string> = {
  saved: "Screen saved.",
  updated: "Screen updated.",
  deleted: "Screen deleted.",
  name: "Choose a name between 1 and 60 characters.",
  migration: "Saved screens are not available until the database migration is applied.",
  unavailable: "Saved screens are unavailable until the account database is configured.",
  error: "The screen could not be saved.",
  locked: "The screener is included with AssetScore Pro.",
};

export async function generateMetadata(): Promise<Metadata> {
  const access = await loadAccess();
  return {
    title,
    description,
    robots: canUseScreener(access) ? { index: false, follow: false } : { index: true, follow: true },
  };
}

function numberInput(name: keyof ScreenerFilters, label: string, value: number | null) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <input
        name={name}
        type="number"
        defaultValue={value ?? ""}
        className="mt-1 h-10 w-full rounded-xl border border-line bg-white/[0.03] px-3 text-sm text-foreground"
      />
    </label>
  );
}

export default async function ScreenerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [{ user }, access] = await Promise.all([loadViewer(), loadAccess()]);
  const allowed = canUseScreener(access);
  const noticeKey = typeof params.notice === "string" ? params.notice : "";
  const notice = notices[noticeKey] ?? "";

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Pro</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.045em] sm:text-5xl">
          {allowed ? "Stock Screener" : access.isFree ? "Discover Your Next Investment" : "Stock Screener"}
        </h1>
        {allowed ? (
          <ScreenerTool params={params} userId={user?.id ?? null} notice={notice} />
        ) : (
          <UpgradeCopy free={access.isFree} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function UpgradeCopy({ free }: { free: boolean }) {
  return (
    <>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
        {free
          ? "Find stocks that match your investment criteria using AssetScore's financial scoring system and advanced screening filters."
          : "The Stock Screener is included with an AssetScore Pro trial or a paid Pro plan."}
      </p>
      <p className="mt-4 text-sm text-foreground">
        {PRO_MONTHLY_PRICE.label}.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/pricing" className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink">
          Unlock AssetScore Pro
        </Link>
        {free ? null : (
          <Link href="/register" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm">
            Create a free account
          </Link>
        )}
      </div>
    </>
  );
}

async function ScreenerTool({
  params,
  userId,
  notice,
}: {
  params: Record<string, string | string[] | undefined>;
  userId: string | null;
  notice: string;
}) {
  const dataset = loadScreenerDataset();
  const presetId = typeof params.preset === "string" ? params.preset : null;
  const filters = filtersFromSearch(params, presetId);
  const sort = (["score", "symbol", "name", "price", "marketCap"] as const).includes(params.sort as ScreenerSort)
    ? (params.sort as ScreenerSort)
    : "score";
  const direction = params.dir === "asc" ? "asc" : "desc";
  const filtered = sortScreener(applyScreener(dataset.rows, filters, dataset.available), sort, direction);
  const page = pageScreener(filtered, Number(typeof params.page === "string" ? params.page : "1"));
  const updated = dataset.publishedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
        timeZoneName: "short",
      }).format(new Date(dataset.publishedAt))
    : null;
  const screens = await loadScreens(userId);
  const showPillars = ["value", "growth", "quality", "health", "momentum"].some((field) => dataset.available.has(field as "value"));
  const query = screenerQuery(filters, { sort, dir: direction });

  return (
    <>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
        AssetScore Stock Screener helps you discover companies matching your investment criteria. Screening results are
        based on the latest available daily dataset and are not investment recommendations.
      </p>
      <p className="mt-3 text-sm text-muted">{updated ? `Data last updated: ${updated}` : "No published dataset is available yet."}</p>
      {dataset.fullUniverse ? null : (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          This published snapshot includes the top-rated names from each index and their overall AssetScore. Pillar,
          valuation, growth, and market-cap filters stay off until the next publish stores those fields. Missing values
          are left blank and are not treated as zero.
        </p>
      )}
      {notice ? <p className="mt-4 text-sm text-foreground">{notice}</p> : null}

      <div className="mt-8 flex flex-wrap gap-2">
        {SCREENER_PRESETS.map((preset) =>
          presetAvailable(preset, dataset.available) ? (
            <Link
              key={preset.id}
              href={`/screener?preset=${preset.id}`}
              className="rounded-full border border-line px-3 py-2 text-sm hover:text-accent"
            >
              {preset.name}
            </Link>
          ) : (
            <span key={preset.id} className="rounded-full border border-line px-3 py-2 text-sm text-muted" title={preset.description}>
              {preset.name} unavailable
            </span>
          ),
        )}
      </div>

      <form action="/screener" className="mt-8 rounded-2xl border border-line bg-card p-5">
        <input type="hidden" name="indexesSet" value="1" />
        <fieldset>
          <legend className="text-sm font-medium">Indexes</legend>
          <div className="mt-3 flex flex-wrap gap-4">
            {SCREENER_INDEXES.map((index) => (
              <label key={index.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="indexes" value={index.id} defaultChecked={filters.indexes.includes(index.id)} />
                {index.name}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {numberInput("scoreMin", "Minimum AssetScore", filters.scoreMin)}
          {numberInput("scoreMax", "Maximum AssetScore", filters.scoreMax)}
          {dataset.available.has("value") ? numberInput("valueMin", "Minimum Value", filters.valueMin) : null}
          {dataset.available.has("growth") ? numberInput("growthMin", "Minimum Growth", filters.growthMin) : null}
          {dataset.available.has("quality") ? numberInput("qualityMin", "Minimum Quality", filters.qualityMin) : null}
          {dataset.available.has("health") ? numberInput("healthMin", "Minimum Financial Health", filters.healthMin) : null}
          {dataset.available.has("momentum") ? numberInput("momentumMin", "Minimum Momentum", filters.momentumMin) : null}
          {dataset.available.has("pe") ? numberInput("peMin", "Minimum P/E", filters.peMin) : null}
          {dataset.available.has("pe") ? numberInput("peMax", "Maximum P/E", filters.peMax) : null}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="submit" className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink">
            Apply filters
          </button>
          <Link href="/screener" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm">
            Clear all filters
          </Link>
        </div>
      </form>

      {screens ? (
        <section className="mt-8">
          <h2 className="text-lg font-medium">Saved screens</h2>
          {screens.length === 0 ? <p className="mt-2 text-sm text-muted">No saved screens yet.</p> : null}
          <ul className="mt-3 space-y-2">
            {screens.map((screen) => {
              const stored = filtersFromStored(screen.filters);
              return (
                <li key={screen.id} className="flex flex-wrap items-center gap-3 text-sm">
                  {stored ? (
                    <Link href={`/screener?${screenerQuery(stored)}`} className="hover:text-accent">
                      {screen.name}
                    </Link>
                  ) : (
                    <span>{screen.name}</span>
                  )}
                  <form action={deleteScreen}>
                    <input type="hidden" name="screenId" value={screen.id} />
                    <button type="submit" className="text-muted hover:text-foreground">
                      Delete
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
          <form action={saveScreen} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="indexesSet" value="1" />
            {filters.indexes.map((index) => (
              <input key={index} type="hidden" name="indexes" value={index} />
            ))}
            {(
              [
                "scoreMin",
                "scoreMax",
                "valueMin",
                "growthMin",
                "qualityMin",
                "healthMin",
                "momentumMin",
                "peMin",
                "peMax",
              ] as const
            ).map((key) =>
              typeof filters[key] === "number" ? <input key={key} type="hidden" name={key} value={filters[key] as number} /> : null,
            )}
            <input name="name" placeholder="Name this screen" className="h-11 flex-1 rounded-xl border border-line bg-white/[0.03] px-3 text-sm" />
            <button type="submit" className="h-11 rounded-full border border-line px-5 text-sm">
              Save current filters
            </button>
          </form>
        </section>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-normal">
                <Link href={`/screener?${screenerQuery(filters, { sort: "symbol", dir: sort === "symbol" && direction === "asc" ? "desc" : "asc" })}`}>Company</Link>
              </th>
              <th className="px-4 py-3 font-normal">Indexes</th>
              <th className="px-4 py-3 font-normal">
                <Link href={`/screener?${screenerQuery(filters, { sort: "score", dir: sort === "score" && direction === "desc" ? "asc" : "desc" })}`}>AssetScore</Link>
              </th>
              {showPillars ? <th className="px-4 py-3 font-normal">Pillars</th> : null}
              {dataset.available.has("price") ? <th className="px-4 py-3 font-normal">Price</th> : null}
              <th className="px-4 py-3 font-normal"> </th>
            </tr>
          </thead>
          <tbody>
            {page.rows.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-muted" colSpan={6}>
                  No companies in the published dataset match these filters.
                </td>
              </tr>
            ) : (
              page.rows.map((row) => (
                <tr key={row.symbol} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3">
                    <Link href={`/stocks/${row.symbol}`} className="font-medium hover:text-accent">
                      {row.symbol}
                    </Link>
                    <span className="mt-1 block text-muted">{row.name}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {row.indexes.map((index) => SCREENER_INDEXES.find((item) => item.id === index)?.name ?? index).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono tabular-nums">{row.score}</span>
                    <span className="mt-1 block text-xs text-muted">{row.band}</span>
                  </td>
                  {showPillars ? (
                    <td className="px-4 py-3 text-xs text-muted">
                      {[
                        ["Value", row.value],
                        ["Growth", row.growth],
                        ["Quality", row.quality],
                        ["Health", row.health],
                        ["Momentum", row.momentum],
                      ]
                        .map(([label, value]) => `${label} ${value == null ? "—" : value}`)
                        .join(" · ")}
                    </td>
                  ) : null}
                  {dataset.available.has("price") ? (
                    <td className="px-4 py-3 font-mono tabular-nums">{row.price == null ? "—" : formatMoney(row.price)}</td>
                  ) : null}
                  <td className="px-4 py-3">
                    <FavoriteButton ticker={row.symbol} signedIn canAdd initialFavorite={false} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <p>
          {page.total} companies · page {page.page} of {page.pages}
        </p>
        <div className="flex gap-4">
          {page.page > 1 ? <Link href={`/screener?${query}&page=${page.page - 1}`}>Previous</Link> : null}
          {page.page < page.pages ? <Link href={`/screener?${query}&page=${page.page + 1}`}>Next</Link> : null}
        </div>
      </div>
    </>
  );
}

async function loadScreens(userId: string | null) {
  if (!userId) return [];
  const supabase = await createSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase.from("saved_screens").select("id, name, filters").eq("user_id", userId).order("updated_at", { ascending: false });
  if (error) return null;
  return data ?? [];
}
