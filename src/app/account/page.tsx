import type { Metadata } from "next";
import Link from "next/link";
import { loadAccess } from "@/lib/billing/access";
import { AccountActivity } from "@/components/account-activity";
import { PromotionSlot } from "@/components/promotion-slot";
import { AccountSettings } from "@/components/account-settings";
import { SubscriptionPanel } from "@/components/subscription-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { loadViewer, viewerName } from "@/lib/viewer";

export const metadata: Metadata = { title: "Account · AssetScore", robots: { index: false, follow: false } };

export default async function AccountPage() {
  const [{ user, profile }, access] = await Promise.all([loadViewer(), loadAccess()]);

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Account</p>
        {user ? (
          <>
            <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{viewerName(profile)}</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
              This name appears on your reviews. Your email is not shown publicly.
            </p>
            <PromotionSlot placement="account" enabled={access.shouldDisplayAds} />
            <AccountActivity />
            <SubscriptionPanel access={access} />
            <AccountSettings
              userId={user.id}
              email={user.email ?? ""}
              displayName={profile?.display_name ?? ""}
              language={profile?.preferred_language ?? "en"}
            />
          </>
        ) : (
          <>
            <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em]">Account</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
              Log in to manage your display name, password, and account. Stock research stays available either way.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/login" className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink">
                Log in
              </Link>
              <Link href="/register" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm">
                Register
              </Link>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
