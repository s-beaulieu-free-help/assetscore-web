"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

const linkClass = "text-[13px] text-muted transition-colors hover:text-foreground";

export function AccountNav({ name }: { name: string | null }) {
  const router = useRouter();

  async function logout() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!name) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className={linkClass}>
          Log in
        </Link>
        <Link
          href="/register"
          className="inline-flex h-9 items-center rounded-full border border-line px-3 text-[13px] text-foreground transition hover:bg-white/5"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/portfolios" className={linkClass}>
        Portfolios
      </Link>
      <Link href="/account" className={`${linkClass} max-w-28 truncate`}>
        {name}
      </Link>
      <button type="button" onClick={logout} className={linkClass}>
        Log out
      </button>
    </div>
  );
}
