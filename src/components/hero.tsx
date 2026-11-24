import { ScoreCard } from "@/components/score-card";
import { SearchWidget } from "@/components/search-widget";

export function Hero() {
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
            Score any investment{" "}
            <span className="font-serif font-normal tracking-[-0.03em] text-accent">
              in seconds
            </span>
          </h1>
          <p
            className="rise mt-7 max-w-[34rem] text-[17px] leading-8 text-muted"
            style={{ animationDelay: "80ms" }}
          >
            AssetScore transforms complex financial data into a simple score that
            helps investors identify opportunities faster.
          </p>
          <div
            className="rise mt-10 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "140ms" }}
          >
            <a
              href="#top-rated"
              className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-medium text-foreground transition hover:bg-white/5"
            >
              See Top Rated Assets
            </a>
          </div>
          <div className="rise mt-10" style={{ animationDelay: "200ms" }}>
            <SearchWidget />
          </div>
        </div>
        <ScoreCard />
      </div>
    </section>
  );
}
