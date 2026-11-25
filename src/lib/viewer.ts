import { cache } from "react";
import { createSupabaseServer } from "@/lib/supabase/server";

export type ViewerProfile = {
  display_name: string | null;
  preferred_language: string | null;
};

export const loadViewer = cache(async function loadViewer() {
  const supabase = await createSupabaseServer();
  if (!supabase) return { supabase: null, user: null, profile: null as ViewerProfile | null };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null as ViewerProfile | null };

  const { data } = await supabase
    .from("profiles")
    .select("display_name, preferred_language")
    .eq("id", user.id)
    .maybeSingle();

  const metadataName =
    typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name.trim() : "";
  let profile = data as ViewerProfile | null;

  if (!profile?.display_name && metadataName) {
    await supabase.from("profiles").update({ display_name: metadataName }).eq("id", user.id);
    profile = { display_name: metadataName, preferred_language: profile?.preferred_language ?? "en" };
  }

  return { supabase, user, profile };
});

export function viewerName(profile: ViewerProfile | null) {
  const name = profile?.display_name?.trim();
  return name || "Member";
}
