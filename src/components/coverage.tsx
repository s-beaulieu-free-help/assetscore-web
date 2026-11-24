const markets = [
  {
    name: "Stocks",
    status: "In preview",
    copy: "Individual companies, read as one score plus the five pillars behind it.",
  },
  {
    name: "ETFs",
    status: "Next",
    copy: "Index funds and other baskets, scored on the same 0 to 100 scale as a single stock.",
  },
  {
    name: "Crypto",
    status: "Next",
    copy: "Major digital assets with the same plain-language score used for equities.",
  },
  {
    name: "Real Estate",
    status: "Next",
    copy: "Property exposure and REITs, summarized without a separate model to learn.",
  },
];

export function Coverage() {
  return (
    <section id="coverage" className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 lg:py-28">
        <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
          Future coverage
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">
          One score, across the assets people actually hold.
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {markets.map((market) => (
            <article
              key={market.name}
              className="group relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-white/[0.05] to-transparent p-6 sm:p-8"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -bottom-10 font-serif text-8xl text-white/[0.04] transition duration-500 group-hover:text-accent/10"
              >
                {market.name.slice(0, 1)}
              </div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-2xl font-medium tracking-tight">{market.name}</h3>
                <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] tracking-wide text-muted uppercase">
                  {market.status}
                </span>
              </div>
              <p className="relative mt-4 max-w-sm text-sm leading-6 text-muted">{market.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
