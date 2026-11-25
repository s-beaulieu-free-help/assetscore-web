"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parse, serialize } from "cookie";
import { supabaseEnv } from "@/lib/supabase/env";
import { wantsStaySignedIn, withSessionLifetime } from "@/lib/supabase/stay-signed-in";

let client: SupabaseClient | null = null;

function readBrowserCookies() {
  const parsed = parse(document.cookie);
  return Object.keys(parsed).map((name) => ({ name, value: parsed[name] ?? "" }));
}

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
    cookies: {
      getAll() {
        return readBrowserCookies();
      },
      setAll(cookiesToSet) {
        const stay = wantsStaySignedIn(readBrowserCookies());
        for (const cookie of withSessionLifetime(cookiesToSet, stay)) {
          document.cookie = serialize(cookie.name, cookie.value, cookie.options);
        }
      },
    },
  });
  return client;
}
