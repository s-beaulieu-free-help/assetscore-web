"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";

let client: SupabaseClient | null = null;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 20000);
  init?.signal?.addEventListener("abort", () => controller.abort(), { once: true });
  return fetch(input, { ...init, signal: controller.signal }).finally(() => window.clearTimeout(timer));
}

export function createSupabaseBrowser() {
  if (client) return client;
  const env = supabaseEnv();
  if (!env) {
    throw new Error("Supabase is not configured.");
  }
  client = createBrowserClient(env.url, env.key, {
    global: { fetch: fetchWithTimeout },
  });
  return client;
}
