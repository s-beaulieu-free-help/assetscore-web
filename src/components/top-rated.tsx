const rankings = [
  { ticker: "NVDA", name: "NVIDIA", score: 84 },
  { ticker: "AVGO", name: "Broadcom", score: 81 },
  { ticker: "MSFT", name: "Microsoft", score: 79 },
  { ticker: "AAPL", name: "Apple", score: 76 },
];

export function TopRated() {
  return (
    <section id="top-rated" className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-5 py-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
              Preview board
            </p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">
              Top rated assets
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted">
            Illustrative scores for this public preview. They are not live market
            data and they are not a recommendation.
          </p>
        </div>
        <ol className="mt-10 divide-y divide-line overflow-hidden rounded-2xl border border-line">
          {rankings.map((asset, index) => (
            <li
              key={asset.ticker}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 bg-white/[0.02] px-4 py-4 sm:grid-cols-[3rem_7rem_1fr_8rem_3rem] sm:px-6"
            >
              <span className="font-mono text-sm text-muted tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-medium tracking-tight">{asset.ticker}</span>
              <span className="hidden text-muted sm:block">{asset.name}</span>
              <span className="hidden h-1.5 overflow-hidden rounded-full bg-white/8 sm:block">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-accent-2 to-accent"
                  style={{ width: `${asset.score}%` }}
                />
              </span>
              <span className="font-mono text-lg tabular-nums">{asset.score}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
