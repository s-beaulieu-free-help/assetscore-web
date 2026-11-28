import type { Metadata } from "next";
import Link from "next/link";
import { ProEnables } from "@/components/pro-enables";
import { UpgradeLink } from "@/components/upgrade-link";
import { FavoriteButton } from "@/components/favorite-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { deleteScreen, saveScreen } from "@/app/screener/actions";
import { recordDailyCount } from "@/lib/analytics";
import { loadAccess } from "@/lib/billing/access";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { MATRIX_SPLIT, QUADRANTS, discoverStocks, matrixPoints, quadrantFor, type QuadrantId } from "@/lib/screener-discovery";
import { scoreTextClass } from "@/lib/score";
import { loadScoreHistory } from "@/lib/score-history";
import {
  FILTER_HELP,
  RESULT_COLUMNS,
  SCREENER_INDEXES,
  SCREENER_NUMERIC_KEYS,
  SCREENER_PRESETS,
  SCREENER_SORTS,
  SCREENER_VIEWS,
  applyScreener,
  canUseScreener,
  columnsFromSearch,
  filtersFromSearch,
  filtersFromStored,
  loadScreenerDataset,
  pageScreener,
  presetAvailable,
  screenerQuery,
  screenerView,
  searchScreener,
  sortFromStored,
  sortScreener,
  type ResultColumnId,
  type ScreenerFilters,
  type ScreenerRow,
  type ScreenerSort,
  type ScreenerView,
} from "@/lib/screener";
import { shareMetadata } from "@/lib/seo";
import { formatMoney } from "@/lib/stocks";
import { createSupabaseServer } from "@/lib/supabase/server";
import { loadViewer } from "@/lib/viewer";

export const dynamic = "force-dynamic";

const title = "Stock Screener — screen stocks by financial metrics";
const description =
  "A financial stock screener for S&P 500, Nasdaq 100, and Dow Jones companies. Filter by AssetScore, pillar scores, price-to-earnings, and the other figures in the daily dataset.";

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

const viewLabels: Record<ScreenerView, string> = {
  quick: "Quick Screening",
  filters: "Advanced Filters",
  rankings: "AssetScore Rankings",
  matrix: "Quality vs. Momentum",
  discovery: "Stock Discovery",
};

export async function generateMetadata(): Promise<Metadata> {
  const access = await loadAccess();
  return shareMetadata({
    title,
    description,
    path: "/screener",
    robots: canUseScreener(access) ? { index: false, follow: false } : { index: true, follow: true },
  });
}

export default async function ScreenerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  await recordDailyCount("screener_page_view");
  const [{ user }, access] = await Promise.all([loadViewer(), loadAccess()]);
  const allowed = canUseScreener(access);
  const noticeKey = typeof params.notice === "string" ? params.notice : "";
  const dataset = loadScreenerDataset();
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

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Pro</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Stock Screener</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
          Find companies in the daily S&amp;P 500, Nasdaq 100, and Dow Jones dataset. These screens describe published
          figures. They are not investment recommendations, and they are not a live quote.
        </p>
        <p className="mt-3 text-sm text-muted">
          {updated ? `Last published update: ${updated}.` : "No published dataset is available yet."} Opening or filtering
          the screener does not request new market data.
        </p>
        {notices[noticeKey] ? <p className="mt-4 text-sm text-foreground">{notices[noticeKey]}</p> : null}
        {allowed ? (
          <ScreenerTool params={params} userId={user?.id ?? null} signedIn={Boolean(user)} canAdd={access.canAddFavorite} />
        ) : (
          <Preview datasetRows={dataset.rows} available={dataset.available} free={access.isFree} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Preview({
  datasetRows,
  available,
  free,
}: {
  datasetRows: ScreenerRow[];
  available: Set<keyof ScreenerRow>;
  free: boolean;
}) {
  return (
    <section className="mt-8">
      <div className="grid gap-3 sm:grid-cols-2">
        {SCREENER_PRESETS.filter((preset) => preset.featured).map((preset) => {
          const ready = presetAvailable(preset, available);
          const count = ready ? applyScreener(datasetRows, filtersFromSearch({}, preset.id), available).length : null;
          return (
            <article key={preset.id} className="rounded-2xl border border-line bg-card p-5">
              <h2 className="text-lg font-medium">{preset.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{preset.description}</p>
              <p className="mt-3 font-mono text-sm tabular-nums">{count == null ? "Unavailable in this dataset" : `${count} companies`}</p>
            </article>
          );
        })}
      </div>
      <div className="mt-6 max-w-2xl">
        <p className="text-sm leading-6 text-foreground">Discover companies matching your criteria.</p>
        <p className="mt-3 text-sm leading-6 text-muted">
          The counts above are the published screens. The company list opens with Pro.
          {free
            ? ` Your trial has ended. Pro is ${PRO_MONTHLY_PRICE.label}. A paid plan starts only when you subscribe.`
            : " A new account includes 30 days with no credit card and no automatic charge."}
        </p>
        <ProEnables className="mt-4" />
      </div>
      {free ? (
        <UpgradeLink href="/pricing" className="mt-4 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink">
          See AssetScore Pro
        </UpgradeLink>
      ) : (
        <UpgradeLink href="/register?next=/screener" className="mt-4 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink">
          Create a free account
        </UpgradeLink>
      )}
    </section>
  );
}

async function ScreenerTool({
  params,
  userId,
  signedIn,
  canAdd,
}: {
  params: Record<string, string | string[] | undefined>;
  userId: string | null;
  signedIn: boolean;
  canAdd: boolean;
}) {
  const dataset = loadScreenerDataset();
  const view = screenerView(typeof params.view === "string" ? params.view : "quick");
  const presetId = typeof params.preset === "string" ? params.preset : null;
  const filters = filtersFromSearch(params, presetId);
  const queryText = typeof params.q === "string" ? params.q : "";
  const sort = SCREENER_SORTS.includes(params.sort as ScreenerSort) ? (params.sort as ScreenerSort) : "score";
  const direction = params.dir === "asc" ? "asc" : "desc";
  const columns = columnsFromSearch(params).filter((column) => {
    const field = RESULT_COLUMNS.find((item) => item.id === column)?.field;
    return field === "indexes" || (field != null && dataset.available.has(field));
  });
  const quadrant = QUADRANTS.some((item) => item.id === params.quadrant) ? (params.quadrant as QuadrantId) : null;
  const filtered = sortScreener(searchScreener(applyScreener(dataset.rows, filters, dataset.available), queryText), sort, direction);
  const matrixSource = quadrant ? filtered.filter((row) => quadrantFor(row) === quadrant) : filtered;
  const listed = view === "matrix" && quadrant ? matrixSource : filtered;
  const page = pageScreener(listed, Number(typeof params.page === "string" ? params.page : "1"));
  const favorites = await favoriteTickers(userId, page.rows.map((row) => row.symbol));
  const extra = { view, sort, dir: direction, cols: columns.join(","), ...(queryText ? { q: queryText } : {}), ...(quadrant ? { quadrant } : {}) };
  const screens = view === "filters" ? await loadScreens(userId) : null;
  const featured = SCREENER_PRESETS.filter((preset) => preset.featured);

  return (
    <>
      <nav className="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Screener sections">
        {SCREENER_VIEWS.map((item) => (
          <Link
            key={item}
            href={`/screener?${screenerQuery(filters, { ...extra, view: item })}`}
            aria-current={view === item ? "page" : undefined}
            className={`h-10 shrink-0 rounded-full px-4 text-sm leading-10 ${view === item ? "bg-foreground text-background" : "border border-line text-muted"}`}
          >
            {viewLabels[item]}
          </Link>
        ))}
      </nav>

      {view === "quick" ? (
        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          {featured.map((preset) => {
            const ready = presetAvailable(preset, dataset.available);
            const count = ready ? applyScreener(dataset.rows, filtersFromSearch({}, preset.id), dataset.available).length : null;
            return (
              <article key={preset.id} className="rounded-2xl border border-line bg-card p-5">
                <h2 className="text-lg font-medium">{preset.name}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{preset.description}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{preset.criteria}</p>
                <p className="mt-3 font-mono text-sm tabular-nums">{count == null ? "This dataset does not have every figure" : `${count} companies`}</p>
                {ready ? (
                  <Link href={`/screener?preset=${preset.id}&view=quick`} className="mt-4 inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-medium text-ink">
                    View matches
                  </Link>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : null}

      {view === "filters" ? <FilterForm filters={filters} columns={columns} queryText={queryText} sort={sort} direction={direction} /> : null}

      {view === "rankings" ? (
        <p className="mt-6 max-w-3xl text-sm leading-6 text-muted">
          Rank is the position in this sorted list. It is not the AssetScore. Choose a column heading to sort. A blank cell means the figure was not in the published dataset.
        </p>
      ) : null}

      {view === "matrix" ? <Matrix rows={filtered} filters={filters} extra={extra} active={quadrant} /> : null}

      {view === "discovery" ? <Discovery rows={dataset.rows} /> : null}

      {view === "discovery" || (view === "quick" && !presetId) || (view === "matrix" && !quadrant) ? null : (
        <Results
          pageRows={page.rows}
          page={page.page}
          pages={page.pages}
          pageSize={page.pageSize}
          total={page.total}
          columns={columns}
          filters={filters}
          sort={sort}
          direction={direction}
          extra={extra}
          signedIn={signedIn}
          canAdd={canAdd}
          favorites={favorites}
          queryText={queryText}
        />
      )}

      {screens ? <SavedScreens screens={screens} filters={filters} sort={sort} direction={direction} /> : null}
    </>
  );
}

function FilterForm({
  filters,
  columns,
  queryText,
  sort,
  direction,
}: {
  filters: ScreenerFilters;
  columns: ResultColumnId[];
  queryText: string;
  sort: ScreenerSort;
  direction: "asc" | "desc";
}) {
  const groups: Array<{ title: string; help: string; fields: Array<{ key: (typeof SCREENER_NUMERIC_KEYS)[number]; label: string }> }> = [
    {
      title: "AssetScore",
      help: FILTER_HELP.score,
      fields: [
        ["scoreMin", "Minimum AssetScore"],
        ["scoreMax", "Maximum AssetScore"],
        ["valueMin", "Minimum Value"],
        ["valueMax", "Maximum Value"],
        ["growthMin", "Minimum Growth"],
        ["growthMax", "Maximum Growth"],
        ["healthMin", "Minimum Financial Health"],
        ["healthMax", "Maximum Financial Health"],
        ["qualityMin", "Minimum Quality"],
        ["qualityMax", "Maximum Quality"],
        ["momentumMin", "Minimum Momentum"],
        ["momentumMax", "Maximum Momentum"],
      ].map(([key, label]) => ({ key: key as (typeof SCREENER_NUMERIC_KEYS)[number], label })),
    },
    {
      title: "Growth and profitability",
      help: `${FILTER_HELP.revenueGrowth} ${FILTER_HELP.netMargin} Earnings growth, operating margin, return on equity, and return on assets are not in this dataset.`,
      fields: [
        ["revenueGrowthMin", "Minimum revenue growth (0.10 = 10%)"],
        ["revenueGrowthMax", "Maximum revenue growth (0.10 = 10%)"],
        ["marginMin", "Minimum net margin (0.15 = 15%)"],
        ["marginMax", "Maximum net margin (0.15 = 15%)"],
      ].map(([key, label]) => ({ key: key as (typeof SCREENER_NUMERIC_KEYS)[number], label })),
    },
    {
      title: "Financial health",
      help: `${FILTER_HELP.health} ${FILTER_HELP.debtToEquity} ${FILTER_HELP.currentRatio} Cash flow is not in this dataset.`,
      fields: [
        ["debtToEquityMin", "Minimum debt to equity"],
        ["debtToEquityMax", "Maximum debt to equity"],
        ["currentRatioMin", "Minimum current ratio"],
        ["currentRatioMax", "Maximum current ratio"],
      ].map(([key, label]) => ({ key: key as (typeof SCREENER_NUMERIC_KEYS)[number], label })),
    },
    {
      title: "Valuation and market",
      help: `${FILTER_HELP.pe} ${FILTER_HELP.marketCap} Forward P/E, price to sales, PEG, EV/EBITDA, and volume are not in this dataset.`,
      fields: [
        ["peMin", "Minimum P/E"],
        ["peMax", "Maximum P/E"],
        ["marketCapMin", "Minimum market cap"],
        ["marketCapMax", "Maximum market cap"],
        ["priceMin", "Minimum price"],
        ["priceMax", "Maximum price"],
      ].map(([key, label]) => ({ key: key as (typeof SCREENER_NUMERIC_KEYS)[number], label })),
    },
  ];

  return (
    <form action="/screener" className="mt-6 rounded-2xl border border-line bg-panel p-5">
      <input type="hidden" name="view" value="filters" />
      <input type="hidden" name="indexesSet" value="1" />
      <input type="hidden" name="sort" value={sort} />
      <input type="hidden" name="dir" value={direction} />
      <fieldset>
        <legend className="text-sm font-medium">Index membership</legend>
        <div className="mt-3 flex flex-wrap gap-4">
          {SCREENER_INDEXES.map((index) => (
            <label key={index.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="indexes" value={index.id} defaultChecked={filters.indexes.includes(index.id)} />
              {index.name}
            </label>
          ))}
        </div>
      </fieldset>
      {groups.map((group) => (
        <details key={group.title} className="mt-4" open={group.title === "AssetScore"}>
          <summary className="cursor-pointer text-sm font-medium">{group.title}</summary>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{group.help}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {group.fields.map((field) => (
              <label key={field.key} className="block text-xs text-muted">
                {field.label}
                <input
                  name={field.key}
                  type="number"
                  step="any"
                  defaultValue={filters[field.key] ?? ""}
                  className="mt-1 h-10 w-full rounded-xl border border-line bg-background px-3 text-sm text-foreground"
                />
              </label>
            ))}
          </div>
        </details>
      ))}
      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Visible columns</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {RESULT_COLUMNS.map((column) => (
            <label key={column.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="cols" value={column.id} defaultChecked={columns.includes(column.id)} />
              {column.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="mt-4 block text-xs text-muted">
        Search ticker or company
        <input name="q" defaultValue={queryText} className="mt-1 h-10 w-full max-w-sm rounded-xl border border-line bg-background px-3 text-sm text-foreground" />
      </label>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {SCREENER_NUMERIC_KEYS.filter((key) => typeof filters[key] === "number").map((key) => (
          <span key={key} className="rounded-full border border-line px-3 py-1 text-xs text-muted">
            {key} {filters[key] as number}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="submit" className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink">
          Apply filters
        </button>
        <Link href="/screener?view=filters" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm">
          Clear all filters
        </Link>
      </div>
    </form>
  );
}

function Matrix({
  rows,
  filters,
  extra,
  active,
}: {
  rows: ScreenerRow[];
  filters: ScreenerFilters;
  extra: Record<string, string>;
  active: QuadrantId | null;
}) {
  const matrix = matrixPoints(rows);
  return (
    <section className="mt-6">
      <p className="max-w-3xl text-sm leading-6 text-muted">
        Each point is one company. The horizontal position is the existing Quality score. The vertical position is the existing Momentum score. The split is 70. A company missing either score is counted as missing and is not plotted.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,28rem)_1fr]">
        <svg viewBox="-18 -10 132 128" role="img" aria-label="Quality and momentum matrix. Quality runs from 0 to 100 left to right. Momentum runs from 0 to 100 bottom to top. The quadrant split is 70." className="w-full rounded-2xl border border-line bg-card">
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(244,245,247,0.16)" />
          <line x1={MATRIX_SPLIT} y1="0" x2={MATRIX_SPLIT} y2="100" stroke="rgba(244,245,247,0.18)" />
          <line x1="0" y1={100 - MATRIX_SPLIT} x2="100" y2={100 - MATRIX_SPLIT} stroke="rgba(244,245,247,0.18)" />
          {[0, 20, 40, 60, 80, 100].map((value) => (
            <line key={`momentum-tick-${value}`} x1="-1.2" y1={100 - value} x2="0" y2={100 - value} stroke="rgba(244,245,247,0.22)" />
          ))}
          {[0, MATRIX_SPLIT, 100].map((value) => (
            <g key={`momentum-${value}`} className="fill-muted font-mono">
              <line x1="-2.2" y1={100 - value} x2="0" y2={100 - value} stroke="rgba(244,245,247,0.4)" />
              <text x="-3.2" y={100 - value} textAnchor="end" dominantBaseline="middle" fontSize="3.5">
                {value}
              </text>
            </g>
          ))}
          <text x="-50" y="-13" transform="rotate(-90)" textAnchor="middle" fontSize="3.6" className="fill-muted">
            Momentum
          </text>
          {[0, 20, 40, 60, 80, 100].map((value) => (
            <line key={`quality-tick-${value}`} x1={value} y1="100" x2={value} y2="101.2" stroke="rgba(244,245,247,0.22)" />
          ))}
          {[0, MATRIX_SPLIT, 100].map((value) => (
            <g key={`quality-${value}`} className="fill-muted font-mono">
              <line x1={value} y1="100" x2={value} y2="102.2" stroke="rgba(244,245,247,0.4)" />
              <text x={value} y="107" textAnchor="middle" fontSize="3.5">
                {value}
              </text>
            </g>
          ))}
          <text x="50" y="114" textAnchor="middle" fontSize="3.6" className="fill-muted">
            Quality
          </text>
          {matrix.points.map((point) => (
            <a key={point.symbol} href={`/stocks/${point.symbol}`}>
              <circle cx={point.quality} cy={100 - point.momentum} r="1.5" fill={point.quadrant === active || active == null ? "#d7f25c" : "rgba(244,245,247,0.28)"}>
                <title>{`${point.symbol} ${point.name}. Quality ${point.quality}. Momentum ${point.momentum}.`}</title>
              </circle>
            </a>
          ))}
        </svg>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUADRANTS.map((item) => (
            <Link key={item.id} href={`/screener?${screenerQuery(filters, { ...extra, view: "matrix", quadrant: item.id })}`} className="rounded-2xl border border-line bg-card p-4">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
              <p className="mt-3 font-mono text-sm tabular-nums">{matrix.counts[item.id]} companies</p>
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">{matrix.missing} companies are not plotted because Quality or Momentum is missing. Select a quadrant to open its companies.</p>
    </section>
  );
}

function Discovery({ rows }: { rows: ScreenerRow[] }) {
  const observations = loadScoreHistory().map((item) => ({
    symbol: item.symbol,
    asOf: item.asOf,
    methodologyVersion: item.methodologyVersion,
    growth: item.growth,
    health: item.health,
  }));
  const categories = discoverStocks(rows, observations);
  return (
    <div className="mt-6 space-y-4">
      {categories.map((category) => (
        <section key={category.id} className="rounded-2xl border border-line bg-card p-5">
          <h2 className="text-lg font-medium">{category.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{category.explanation}</p>
          {category.unavailableReason ? <p className="mt-3 text-sm leading-6 text-muted">{category.unavailableReason}</p> : null}
          {category.rows.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm">
              {category.rows.map((row) => (
                <li key={row.symbol}>
                  <Link href={`/stocks/${row.symbol}`} className="font-medium hover:text-accent">
                    {row.symbol}
                  </Link>{" "}
                  <span className="text-muted">{row.name}. {row.reason}</span>
                </li>
              ))}
            </ul>
          ) : category.available ? (
            <p className="mt-3 text-sm text-muted">No company in the published dataset meets this rule.</p>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function Results({
  pageRows,
  page,
  pages,
  pageSize,
  total,
  columns,
  filters,
  sort,
  direction,
  extra,
  signedIn,
  canAdd,
  favorites,
  queryText,
}: {
  pageRows: ScreenerRow[];
  page: number;
  pages: number;
  pageSize: number;
  total: number;
  columns: ResultColumnId[];
  filters: ScreenerFilters;
  sort: ScreenerSort;
  direction: "asc" | "desc";
  extra: Record<string, string>;
  signedIn: boolean;
  canAdd: boolean;
  favorites: Set<string>;
  queryText: string;
}) {
  const query = screenerQuery(filters, extra);
  return (
    <section className="mt-6">
      <form action="/screener" className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="indexesSet" value="1" />
        {filters.indexes.map((index) => (
          <input key={index} type="hidden" name="indexes" value={index} />
        ))}
        {SCREENER_NUMERIC_KEYS.map((key) => (typeof filters[key] === "number" ? <input key={key} type="hidden" name={key} value={filters[key] as number} /> : null))}
        <input type="hidden" name="view" value={extra.view ?? "filters"} />
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={direction} />
        <input type="hidden" name="cols" value={columns.join(",")} />
        <input name="q" defaultValue={queryText} placeholder="Search ticker or company" className="h-11 flex-1 rounded-xl border border-line bg-white/[0.03] px-3 text-sm" />
        <button type="submit" className="h-11 rounded-full border border-line px-5 text-sm">
          Search
        </button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-normal">Rank</th>
              <th className="px-4 py-3 font-normal">
                <SortLink label="Company" column="name" sort={sort} direction={direction} filters={filters} extra={extra} />
              </th>
              <th className="px-4 py-3 font-normal">
                <SortLink label="AssetScore" column="score" sort={sort} direction={direction} filters={filters} extra={extra} />
              </th>
              {columns.map((column) => {
                const defined = RESULT_COLUMNS.find((item) => item.id === column);
                if (!defined || defined.id === "indexes") return <th key={column} className="px-4 py-3 font-normal">Indexes</th>;
                return (
                  <th key={column} className="px-4 py-3 font-normal">
                    <SortLink label={defined.label} column={defined.field as ScreenerSort} sort={sort} direction={direction} filters={filters} extra={extra} />
                  </th>
                );
              })}
              <th className="px-4 py-3 font-normal"> </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-5 text-muted">
                  No companies match. Remove a filter or choose another index.
                </td>
              </tr>
            ) : (
              pageRows.map((row, index) => (
                <tr key={row.symbol} className="border-b border-line last:border-b-0">
                  <td className="px-4 py-3 font-mono text-muted tabular-nums">{(page - 1) * pageSize + index + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/stocks/${row.symbol}`} className="font-medium hover:text-accent">
                      {row.name}
                    </Link>
                    <span className="mt-1 block text-muted">{row.symbol}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-base tabular-nums ${scoreTextClass(row.score)}`}>{row.score}</span>
                    <span className="mt-1 block text-xs text-muted">{row.band}</span>
                  </td>
                  {columns.map((column) => {
                    const scoreColumn = column === "value" || column === "growth" || column === "quality" || column === "health" || column === "momentum";
                    const score = scoreColumn ? row[column] : null;
                    return (
                      <td key={column} className={`px-4 py-3 font-mono tabular-nums ${typeof score === "number" ? scoreTextClass(score) : ""}`}>
                        {column === "indexes"
                          ? row.indexes.map((item) => SCREENER_INDEXES.find((index) => index.id === item)?.name ?? item).join(", ")
                          : formatColumn(row, column)}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <FavoriteButton ticker={row.symbol} signedIn={signedIn} canAdd={canAdd} initialFavorite={favorites.has(row.symbol)} compact />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <p>
          {total} companies · page {page} of {pages}
        </p>
        <div className="flex gap-4">
          {page > 1 ? <Link href={`/screener?${query}&page=${page - 1}`}>Previous</Link> : null}
          {page < pages ? <Link href={`/screener?${query}&page=${page + 1}`}>Next</Link> : null}
        </div>
      </div>
    </section>
  );
}

function SortLink({
  label,
  column,
  sort,
  direction,
  filters,
  extra,
}: {
  label: string;
  column: ScreenerSort;
  sort: ScreenerSort;
  direction: "asc" | "desc";
  filters: ScreenerFilters;
  extra: Record<string, string>;
}) {
  if (!SCREENER_SORTS.includes(column)) return <span>{label}</span>;
  const next = sort === column && direction === "desc" ? "asc" : "desc";
  return (
    <Link href={`/screener?${screenerQuery(filters, { ...extra, sort: column, dir: next })}`}>
      {label}
      {sort === column ? (direction === "asc" ? " ↑" : " ↓") : ""}
    </Link>
  );
}

function formatColumn(row: ScreenerRow, column: ResultColumnId) {
  if (column === "indexes") return "";
  const value = row[column];
  if (typeof value !== "number") return "—";
  if (column === "revenueGrowth" || column === "netMargin") return `${(value * 100).toFixed(1)}%`;
  if (column === "price") return formatMoney(value);
  if (column === "marketCap") return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  if (column === "pe" || column === "debtToEquity" || column === "currentRatio") return value.toFixed(2);
  return String(value);
}

function SavedScreens({
  screens,
  filters,
  sort,
  direction,
}: {
  screens: Array<{ id: string; name: string; filters: unknown }> | null;
  filters: ScreenerFilters;
  sort: ScreenerSort;
  direction: "asc" | "desc";
}) {
  if (screens == null) return <p className="mt-8 text-sm text-muted">Saved screens are unavailable until the account database is configured.</p>;
  return (
    <section className="mt-8">
      <h2 className="text-lg font-medium">Saved screens</h2>
      <p className="mt-2 text-sm leading-6 text-muted">A saved screen stores the filter settings, not a copy of the financial data. It remains if Pro ends, and it opens again with Pro.</p>
      {screens.length === 0 ? <p className="mt-3 text-sm text-muted">No saved screens yet.</p> : null}
      <ul className="mt-3 space-y-2">
        {screens.map((screen) => {
          const stored = filtersFromStored(screen.filters);
          const storedSort = sortFromStored(screen.filters);
          return (
            <li key={screen.id} className="flex flex-wrap items-center gap-3 text-sm">
              {stored ? (
                <Link href={`/screener?${screenerQuery(stored, { view: "filters", sort: storedSort.sort, dir: storedSort.direction })}`} className="hover:text-accent">
                  {screen.name}
                </Link>
              ) : (
                <span>{screen.name}</span>
              )}
              <form action={saveScreen}>
                <ScreenFields filters={filters} sort={sort} direction={direction} />
                <input type="hidden" name="screenId" value={screen.id} />
                <input type="hidden" name="name" value={screen.name} />
                <button type="submit" className="text-muted hover:text-foreground">
                  Replace with current filters
                </button>
              </form>
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
        <ScreenFields filters={filters} sort={sort} direction={direction} />
        <input name="name" placeholder="Name this screen" className="h-11 flex-1 rounded-xl border border-line bg-white/[0.03] px-3 text-sm" />
        <button type="submit" className="h-11 rounded-full border border-line px-5 text-sm">
          Save current filters
        </button>
      </form>
    </section>
  );
}

function ScreenFields({ filters, sort, direction }: { filters: ScreenerFilters; sort: ScreenerSort; direction: "asc" | "desc" }) {
  return (
    <>
      <input type="hidden" name="indexesSet" value="1" />
      <input type="hidden" name="sort" value={sort} />
      <input type="hidden" name="dir" value={direction} />
      {filters.indexes.map((index) => (
        <input key={index} type="hidden" name="indexes" value={index} />
      ))}
      {SCREENER_NUMERIC_KEYS.map((key) => (typeof filters[key] === "number" ? <input key={key} type="hidden" name={key} value={filters[key] as number} /> : null))}
    </>
  );
}

async function favoriteTickers(userId: string | null, symbols: string[]) {
  if (!userId || symbols.length === 0) return new Set<string>();
  const supabase = await createSupabaseServer();
  if (!supabase) return new Set<string>();
  const { data } = await supabase.from("favorite_stocks").select("ticker").eq("user_id", userId).in("ticker", symbols);
  return new Set((data ?? []).map((row) => String(row.ticker).toUpperCase()));
}

async function loadScreens(userId: string | null) {
  if (!userId) return [];
  const supabase = await createSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase.from("saved_screens").select("id, name, filters").eq("user_id", userId).order("updated_at", { ascending: false });
  if (error) return null;
  return data ?? [];
}
