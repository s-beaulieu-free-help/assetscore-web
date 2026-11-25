import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";

export function createSupabaseAdmin() {
  const env = supabaseEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env || !key) return null;
  return createClient(env.url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
