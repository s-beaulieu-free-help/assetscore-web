import { ScoreCard } from "@/components/score-card";
import { SearchWidget } from "@/components/search-widget";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(214,242,92,0.12),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(244,242,236,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,242,236,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pt-16 pb-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:pt-24 lg:pb-28">
        <div>
          <p className="rise font-mono text-xs tracking-[0.2em] text-accent uppercase">
            Public preview · 0 to 100
          </p>
          <h1 className="rise mt-5 max-w-xl text-[2.7rem] leading-[0.98] font-medium tracking-[-0.045em] sm:text-6xl lg:text-[4.25rem]">
            Score any investment{" "}
            <span className="font-serif font-normal text-accent">in seconds</span>
          </h1>
          <p
            className="rise mt-6 max-w-lg text-lg leading-8 text-muted"
            style={{ animationDelay: "80ms" }}
          >
            AssetScore transforms complex financial data into a simple score that
            helps investors identify opportunities faster.
          </p>
          <div
            className="rise mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "120ms" }}
          >
            <a
              href="#analyze"
              className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-ink transition hover:brightness-110"
            >
              Analyze a Stock
            </a>
            <a
              href="#top-rated"
              className="inline-flex h-12 items-center justify-center rounded-full border border-line px-5 text-sm font-medium text-foreground transition hover:bg-white/5"
            >
              See Top Rated Assets
            </a>
          </div>
          <div className="rise mt-8" style={{ animationDelay: "180ms" }}>
            <SearchWidget />
          </div>
        </div>
        <ScoreCard />
      </div>
    </section>
  );
}
