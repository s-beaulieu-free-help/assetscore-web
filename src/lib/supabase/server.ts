import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "@/lib/supabase/env";
import { wantsStaySignedIn, withSessionLifetime } from "@/lib/supabase/stay-signed-in";

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
          const stay = wantsStaySignedIn(cookieStore.getAll());
          for (const { name, value, options } of withSessionLifetime(cookiesToSet, stay)) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot always write cookies. Middleware refreshes the session.
        }
      },
    },
  });
}
