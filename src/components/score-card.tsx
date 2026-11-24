const pillars = [
  { label: "Value", score: 70 },
  { label: "Growth", score: 97 },
  { label: "Quality", score: 88 },
  { label: "Financial Health", score: 82 },
  { label: "Momentum", score: 85 },
] as const;

function barClass(score: number) {
  if (score >= 90) return "from-accent-2 to-accent";
  if (score >= 80) return "from-[#9adf6a] to-accent";
  return "from-[#e2c15a] to-[#d6f25c]";
}

export function ScoreCard() {
  return (
    <article
      id="example"
      className="rise relative w-full overflow-hidden rounded-3xl border border-line bg-card p-6 shadow-[0_30px_80px_-40px_rgba(214,242,92,0.45)] sm:p-7"
      style={{ animationDelay: "160ms" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 size-56 rounded-full bg-accent/15 blur-3xl"
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
              Example · NASDAQ
            </p>
            <h2 className="mt-2 text-2xl font-medium tracking-tight">NVDA</h2>
            <p className="text-sm text-muted">NVIDIA Corporation</p>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-wide text-muted uppercase">AssetScore</p>
            <p className="font-mono text-5xl font-medium tracking-tighter text-accent tabular-nums">
              84
            </p>
            <p className="text-xs text-muted">out of 100</p>
          </div>
        </div>

        <ul className="mt-8 space-y-4">
          {pillars.map((pillar, index) => (
            <li key={pillar.label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span>{pillar.label}</span>
                <span className="font-mono text-muted tabular-nums">{pillar.score}</span>
              </div>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-white/8"
                role="meter"
                aria-label={pillar.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pillar.score}
              >
                <div
                  className={`bar-fill h-full rounded-full bg-gradient-to-r ${barClass(pillar.score)}`}
                  style={{
                    width: `${pillar.score}%`,
                    animationDelay: `${220 + index * 80}ms`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs leading-5 text-muted">
          Illustrative composite. The headline score sits beside the five pillars
          investors can inspect: value, growth, quality, financial health, and
          momentum.
        </p>
      </div>
    </article>
  );
}
