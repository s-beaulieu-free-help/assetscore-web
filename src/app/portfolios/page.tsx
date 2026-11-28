import type { Metadata } from "next";
import Link from "next/link";
import { ProEnables } from "@/components/pro-enables";
import { UpgradeLink } from "@/components/upgrade-link";
import { PromotionSlot } from "@/components/promotion-slot";
import { loadAccess } from "@/lib/billing/access";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { CreatePortfolioForm } from "@/components/portfolio-editor";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { loadViewer } from "@/lib/viewer";

export const metadata: Metadata = {
  title: "Portfolio analysis · AssetScore",
  description: "Score an investment portfolio from the allocation-weighted average of each holding's AssetScore.",
  robots: { index: false, follow: false },
};

export default async function PortfoliosPage() {
  const [{ supabase, user }, access] = await Promise.all([loadViewer(), loadAccess()]);
  const { data } =
    supabase && user
      ? await supabase
          .from("portfolios")
          .select("id, name, status")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
      : { data: null };

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Portfolios</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Your portfolios</h1>
        {user ? (
          <>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">A new portfolio starts as a draft.</p>
            {access.canCreatePortfolio ? (
              <CreatePortfolioForm />
            ) : (
              <div className="mt-6 max-w-xl">
                <p className="text-sm leading-6 text-foreground">Understand your portfolio&apos;s strengths and weaknesses.</p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Creating another portfolio needs Pro. Portfolios you already saved stay available.
                </p>
                <ProEnables className="mt-4" />
                <p className="mt-4 text-sm leading-6 text-muted">
                  Pro is {PRO_MONTHLY_PRICE.label}. A paid plan starts only when you subscribe. A new account includes 30
                  days with no credit card and no automatic charge.
                </p>
                <UpgradeLink href="/pricing" className="mt-4 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink">
                  See AssetScore Pro
                </UpgradeLink>
              </div>
            )}
            <ul className="mt-10 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
              {data?.length ? (
                data.map((portfolio) => (
                  <li key={portfolio.id}>
                    <Link href={`/portfolios/${portfolio.id}`} className="flex items-center justify-between gap-4 px-5 py-5 hover:bg-white/[0.02] sm:px-6">
                      <span>
                        <span className="block text-lg font-medium">{portfolio.name}</span>
                        <span className="mt-1 block text-sm text-muted">
                          {portfolio.status === "complete" ? "Complete" : "Draft"}
                        </span>
                      </span>
                      <span className="text-sm text-muted">Open</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="px-6 py-6 text-sm text-muted">No portfolios yet.</li>
              )}
            </ul>
          </>
        ) : (
          <p className="mt-6 max-w-xl text-sm leading-6 text-muted">
            Portfolio creation is available after you{" "}
            <Link href="/login" className="text-foreground hover:text-accent">
              log in
            </Link>
            . The first stock you open stays available without an account.
          </p>
        )}
        <PromotionSlot placement="portfolio" enabled={access.shouldDisplayAds} />
      </main>
      <SiteFooter />
    </div>
  );
}
