import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const supabase = await createSupabaseServer();

  if (supabase) {
    const code = url.searchParams.get("code");
    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    } else if (tokenHash && type) {
      await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as "signup" | "recovery" | "email" | "email_change",
      });
    }
  }

  return NextResponse.redirect(new URL(safeNext, url.origin));
}
