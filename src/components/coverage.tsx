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
      <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
          Future coverage
        </p>
        <h2 className="mt-4 max-w-2xl text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-4xl">
          One score, across the assets people actually hold.
        </h2>
        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {markets.map((market, index) => (
            <article
              key={market.name}
              className="rounded-2xl border border-line bg-card px-7 py-7 sm:px-8 sm:py-8"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[11px] tracking-[0.16em] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
                  {market.status}
                </span>
              </div>
              <h3 className="mt-8 text-2xl font-medium tracking-[-0.03em]">{market.name}</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted">{market.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
