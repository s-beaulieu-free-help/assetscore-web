import { NextResponse } from "next/server";
import { loadAccess } from "@/lib/billing/access";
import {
  SCREENER_SORTS,
  applyScreener,
  canUseScreener,
  filtersFromSearch,
  loadScreenerDataset,
  pageScreener,
  sortScreener,
  type ScreenerSort,
} from "@/lib/screener";

export async function GET(request: Request) {
  const access = await loadAccess();
  if (!canUseScreener(access)) {
    return NextResponse.json(
      { message: "The Stock Screener is included with an active 30-day Pro trial or AssetScore Pro." },
      { status: 403 },
    );
  }
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const dataset = loadScreenerDataset();
  const filters = filtersFromSearch(params, params.preset);
  const sort = SCREENER_SORTS.includes(params.sort as ScreenerSort) ? (params.sort as ScreenerSort) : "score";
  const direction = params.dir === "asc" ? "asc" : "desc";
  const filtered = sortScreener(applyScreener(dataset.rows, filters, dataset.available), sort, direction);
  const page = pageScreener(filtered, Number(params.page ?? "1"));
  return NextResponse.json({
    publishedAt: dataset.publishedAt,
    total: page.total,
    page: page.page,
    pages: page.pages,
    rows: page.rows,
  });
}
