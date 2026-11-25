import Link from "next/link";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Trust } from "@/components/trust";
import { loadAccess } from "@/lib/billing/access";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { loadViewer, viewerName } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ user, profile }, access] = await Promise.all([loadViewer(), loadAccess()]);
  const name = user ? viewerName(profile) : null;

  return (
    <div id="top">
      <SiteHeader />
      <main>
        <p className="border-b border-line">
          <span className="mx-auto block w-full max-w-6xl px-6 py-4 text-sm leading-6 text-muted">
            {name ? (
              <span className="text-foreground">
                Welcome {name}
                {access.trialEnded && access.isFree
                  ? `. Your 30-day AssetScore Pro trial has ended. Upgrade for just ${PRO_MONTHLY_PRICE.label} to continue enjoying unlimited stock analysis and complete portfolio management.`
                  : ""}
              </span>
            ) : (
              <>
                <Link href="/register" className="text-foreground hover:text-accent">
                  Create your free account
                </Link>{" "}
                to manage your portfolios, analyze unlimited stocks, and unlock the full AssetScore experience.
              </>
            )}
          </span>
        </p>
        <Hero />
        <Trust />
        <Features />
      </main>
      <SiteFooter />
    </div>
  );
}
