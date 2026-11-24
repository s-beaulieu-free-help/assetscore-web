const rankings = [
  { ticker: "NVDA", name: "NVIDIA", score: 84, band: "Strong" },
  { ticker: "AVGO", name: "Broadcom", score: 81, band: "Strong" },
  { ticker: "MSFT", name: "Microsoft", score: 79, band: "Solid" },
  { ticker: "AAPL", name: "Apple", score: 76, band: "Solid" },
];

export function TopRated() {
  return (
    <section id="top-rated" className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
              Preview board
            </p>
            <h2 className="mt-4 text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] sm:text-4xl">
              Top rated assets
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted">
            Illustrative scores for this public preview. They are not live market
            data and they are not a recommendation.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl border border-line bg-card">
          <div className="hidden grid-cols-[4.5rem_7rem_1fr_9rem_6rem_3.5rem] gap-4 border-b border-line px-6 py-3 font-mono text-[10px] tracking-[0.16em] text-muted uppercase sm:grid">
            <span>Rank</span>
            <span>Ticker</span>
            <span>Name</span>
            <span>Score</span>
            <span>Band</span>
            <span className="text-right">0–100</span>
          </div>
          <ol>
            {rankings.map((asset, index) => (
              <li
                key={asset.ticker}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line px-5 py-4 last:border-b-0 sm:grid-cols-[4.5rem_7rem_1fr_9rem_6rem_3.5rem] sm:px-6"
              >
                <span className="font-mono text-[13px] text-muted tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium tracking-[-0.02em]">{asset.ticker}</span>
                <span className="hidden text-sm text-muted sm:block">{asset.name}</span>
                <span className="hidden h-1 overflow-hidden rounded-full bg-white/8 sm:block">
                  <span
                    className="bar-fill block h-full rounded-full bg-gradient-to-r from-accent-2 to-accent"
                    style={{ width: `${asset.score}%`, animationDelay: `${index * 80}ms` }}
                  />
                </span>
                <span className="hidden text-[13px] text-muted sm:block">{asset.band}</span>
                <span className="text-right font-mono text-base tabular-nums">{asset.score}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
