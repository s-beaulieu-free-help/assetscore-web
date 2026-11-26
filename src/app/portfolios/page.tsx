import type { Metadata } from "next";
import Link from "next/link";
import { PromotionSlot } from "@/components/promotion-slot";
import { loadAccess } from "@/lib/billing/access";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import { CreatePortfolioForm } from "@/components/portfolio-editor";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { loadViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Portfolios · AssetScore" };

export default async function PortfoliosPage() {
  const [{ supabase, user }, access] = await Promise.all([loadViewer(), loadAccess()]);
  const { data } =
    supabase && user
      ? await supabase
          .from("portfolios")
          .select("id, name, is_public, status")
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
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
              Portfolios are private until you mark one public. A new portfolio starts as a draft.
            </p>
            {access.canCreatePortfolio ? (
              <CreatePortfolioForm />
            ) : (
              <p className="mt-6 max-w-xl text-sm leading-6 text-muted">
                Unlock complete portfolio analysis with AssetScore Pro. Pro is {PRO_MONTHLY_PRICE.label}. Portfolios you
                already saved stay available.{" "}
                <Link href="/pricing" className="text-foreground hover:text-accent">
                  See Pro plans
                </Link>
                .
              </p>
            )}
            <ul className="mt-10 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
              {data?.length ? (
                data.map((portfolio) => (
                  <li key={portfolio.id}>
                    <Link href={`/portfolios/${portfolio.id}`} className="flex items-center justify-between gap-4 px-5 py-5 hover:bg-white/[0.02] sm:px-6">
                      <span>
                        <span className="block text-lg font-medium">{portfolio.name}</span>
                        <span className="mt-1 block text-sm text-muted">
                          {portfolio.status === "complete" ? "Complete" : "Draft"} · {portfolio.is_public ? "Public" : "Private"}
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
            . You can still browse stock scores without an account.
          </p>
        )}
        <PromotionSlot placement="portfolio" enabled={access.shouldDisplayAds} />
      </main>
      <SiteFooter />
    </div>
  );
}
