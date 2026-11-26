import { NextResponse } from "next/server";
import { loadAccess } from "@/lib/billing/access";
import {
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
    return NextResponse.json({ message: "The Stock Screener is included with AssetScore Pro." }, { status: 403 });
  }
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const dataset = loadScreenerDataset();
  const filters = filtersFromSearch(params, params.preset);
  const sort = (["score", "symbol", "name", "price", "marketCap"] as const).includes(params.sort as ScreenerSort)
    ? (params.sort as ScreenerSort)
    : "score";
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
