import { ScoreGauge } from "@/components/score-gauge";

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
  return "from-[#e2c15a] to-accent";
}

export function ScoreCard() {
  return (
    <article
      id="example"
      className="rise relative w-full overflow-hidden rounded-2xl border border-line bg-card shadow-[0_30px_80px_-48px_rgba(0,0,0,0.85)]"
      style={{ animationDelay: "140ms" }}
    >
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
            Example · NASDAQ
          </p>
        </div>
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
          Preview
        </p>
      </div>

      <div className="px-5 py-7 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[1.75rem] font-medium tracking-[-0.04em]">NVDA</h2>
            <p className="mt-1 text-sm text-muted">NVIDIA Corporation</p>
          </div>
          <p className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
            Strong
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <ScoreGauge score={84} />
        </div>

        <ul className="mt-8 space-y-3.5">
          {pillars.map((pillar, index) => (
            <li key={pillar.label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-foreground/90">{pillar.label}</span>
                <span className="font-mono text-[13px] text-muted tabular-nums">
                  {pillar.score}
                </span>
              </div>
              <div
                className="h-1 overflow-hidden rounded-full bg-white/8"
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
                    animationDelay: `${280 + index * 70}ms`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <dl className="grid grid-cols-3 border-t border-line">
        {[
          ["Band", "80–89"],
          ["Pillars", "5"],
          ["Scale", "0–100"],
        ].map(([label, value]) => (
          <div key={label} className="px-4 py-3.5 text-center sm:px-5">
            <dt className="text-[10px] tracking-[0.16em] text-muted uppercase">{label}</dt>
            <dd className="mt-1 font-mono text-sm tracking-tight text-foreground tabular-nums">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
