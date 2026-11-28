import { NextResponse } from "next/server";
import { recordConsentedEvent } from "@/lib/analytics";
import { loadAccess } from "@/lib/billing/access";
import { afterSignupPath } from "@/lib/guest-stock";
import { safeAppPath } from "@/lib/safe-path";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const safeNext = safeAppPath(url.searchParams.get("next") || undefined, "/account");
  const destination = url.searchParams.get("signup") === "1" ? afterSignupPath(safeNext) : safeNext;
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
    if (url.searchParams.get("signup") === "1") {
      await recordConsentedEvent("registration_completed");
      const access = await loadAccess();
      if (access.isTrialActive) await recordConsentedEvent("trial_started");
    }
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
