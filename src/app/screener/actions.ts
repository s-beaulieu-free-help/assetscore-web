"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loadAccess } from "@/lib/billing/access";
import { SCREENER_SORTS, canUseScreener, filtersFromSearch, screenerQuery, type ScreenerSort } from "@/lib/screener";
import { createSupabaseServer } from "@/lib/supabase/server";

function filtersFromForm(form: FormData) {
  const params: Record<string, string> = { indexesSet: "1" };
  const indexes = form.getAll("indexes").map(String);
  if (indexes.length > 0) params.indexes = indexes.join(",");
  for (const [key, value] of form.entries()) {
    if (typeof value === "string" && value !== "" && key !== "indexes" && key !== "name" && key !== "screenId") {
      params[key] = value;
    }
  }
  return filtersFromSearch(params);
}

export async function saveScreen(form: FormData) {
  const access = await loadAccess();
  const filters = filtersFromForm(form);
  const query = screenerQuery(filters);
  if (!canUseScreener(access)) redirect(`/screener?notice=locked`);
  const supabase = await createSupabaseServer();
  if (!supabase) redirect(`/screener?${query}&notice=unavailable`);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 1 || name.length > 60) redirect(`/screener?${query}&notice=name`);
  const screenId = String(form.get("screenId") ?? "");
  const requestedSort = String(form.get("sort") ?? "");
  const sort = SCREENER_SORTS.includes(requestedSort as ScreenerSort) ? requestedSort : "score";
  const dir = form.get("dir") === "asc" ? "asc" : "desc";
  const payload = { name, filters: { ...filters, sort, dir }, updated_at: new Date().toISOString() };
  const result = screenId
    ? await supabase.from("saved_screens").update(payload).eq("id", screenId).eq("user_id", user.id)
    : await supabase.from("saved_screens").insert({ ...payload, user_id: user.id });
  if (result.error) {
    const notice = /saved_screens|schema cache|does not exist/i.test(result.error.message) ? "migration" : "error";
    redirect(`/screener?${query}&notice=${notice}`);
  }
  revalidatePath("/screener");
  redirect(`/screener?${query}&notice=${screenId ? "updated" : "saved"}`);
}

export async function deleteScreen(form: FormData) {
  const access = await loadAccess();
  if (!canUseScreener(access)) redirect("/screener");
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const screenId = String(form.get("screenId") ?? "");
  if (supabase && user && screenId) {
    await supabase.from("saved_screens").delete().eq("id", screenId).eq("user_id", user.id);
  }
  revalidatePath("/screener");
  redirect("/screener?notice=deleted");
}
