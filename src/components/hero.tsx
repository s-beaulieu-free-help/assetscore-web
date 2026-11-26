import Link from "next/link";
import { ScoreCard } from "@/components/score-card";
import { SearchWidget } from "@/components/search-widget";

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
          <h1 className="rise max-w-[12ch] text-[2.75rem] leading-[0.98] font-medium tracking-[-0.045em] text-balance sm:text-6xl lg:text-[4.25rem]">
            Know what{" "}
            <span className="font-serif font-normal tracking-[-0.03em] text-accent">you own.</span>
          </h1>
          <p className="rise mt-7 max-w-[34rem] text-[17px] leading-8 text-foreground" style={{ animationDelay: "80ms" }}>
            Evaluate stocks. Compare companies. Understand your portfolio.
          </p>
          <p className="rise mt-4 max-w-[34rem] text-[17px] leading-8 text-muted" style={{ animationDelay: "120ms" }}>
            AssetScore transforms complex financial data into clear, understandable scores so you can evaluate the
            quality and financial health of your investments.
          </p>
          <div className="rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "160ms" }}>
            {signedIn ? null : (
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-ink transition hover:brightness-110"
              >
                Start Your 30-Day Free Trial
              </Link>
            )}
            <Link
              href="/#evaluate"
              className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition ${signedIn ? "bg-accent text-ink hover:brightness-110" : "border border-line hover:bg-white/5"}`}
            >
              Explore Stock Analysis
            </Link>
          </div>
          {signedIn ? null : <p className="mt-4 text-sm leading-6 text-muted">30 days of full access. No credit card required.</p>}
          <div className="rise mt-10" style={{ animationDelay: "200ms" }}>
            <SearchWidget />
          </div>
        </div>
        <ScoreCard />
      </div>
    </section>
  );
}
