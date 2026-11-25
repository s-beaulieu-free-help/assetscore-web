import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "@/lib/supabase/env";

export async function createSupabaseServer() {
  const env = supabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot always write cookies. Middleware refreshes the session.
        }
      },
    },
  });
}
