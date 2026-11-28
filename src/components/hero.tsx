import Link from "next/link";
import { ScoreCard } from "@/components/score-card";
import { SearchWidget } from "@/components/search-widget";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";

export function Hero({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_top,rgba(215,242,92,0.08),transparent_58%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(244,245,247,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,245,247,0.035)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-16 px-6 pt-20 pb-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.9fr)] lg:gap-20 lg:pt-28 lg:pb-32">
        <div>
          <h1 className="rise max-w-[11ch] text-[3rem] leading-[0.94] font-medium tracking-[-0.05em] text-balance sm:text-6xl lg:text-[4.6rem]">
            Know What{" "}
            <span className="font-serif font-normal tracking-[-0.03em] text-accent">You Own.</span>
          </h1>
          <p className="rise mt-7 max-w-[36rem] text-[17px] leading-8 text-foreground" style={{ animationDelay: "80ms" }}>
            <strong className="font-bold">One</strong> Score. The <strong className="font-bold">New Way</strong> to View Your Investments.
          </p>
          <p className="rise mt-3 max-w-[36rem] text-sm leading-6 text-muted" style={{ animationDelay: "100ms" }}>
            Five dimensions of financial analysis. One intelligent score. A clearer view of every investment.
          </p>
          <div className="rise mt-8" style={{ animationDelay: "140ms" }}>
            <SearchWidget prompt={signedIn ? "Look up a company." : "Try a company before you create an account."} />
          </div>
          {signedIn ? null : (
            <p className="mt-6 max-w-xl text-sm leading-6 text-muted">
              <Link href="/register" className="text-foreground underline decoration-white/25 underline-offset-4 hover:text-accent">
                Create a free account
              </Link>{" "}
              when you want to keep going. 30 days of Pro. No credit card. No automatic charge. Then{" "}
              <span className="text-foreground">{PRO_MONTHLY_PRICE.label}</span> only if you choose it.
            </p>
          )}
          <nav className="rise mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted" style={{ animationDelay: "180ms" }} aria-label="AssetScore tools">
            <Link href="/#evaluate" className="hover:text-foreground">Stock Analysis</Link>
            <Link href="/#portfolio" className="hover:text-foreground">Portfolio Analysis</Link>
            <Link href="/#compare" className="hover:text-foreground">Stock Comparison</Link>
            <Link href="/screener" className="hover:text-foreground">Stock Screener</Link>
            <Link href="/rankings/sp500" className="hover:text-foreground">Financial Quality Rankings</Link>
          </nav>
        </div>
        <ScoreCard />
      </div>
    </section>
  );
}
