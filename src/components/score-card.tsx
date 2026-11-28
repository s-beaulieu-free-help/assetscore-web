import type { ReactNode } from "react";
import Link from "next/link";
import { ScoreGauge } from "@/components/score-gauge";
import { buildStockPage, getFmpSnapshot, type StockPageData } from "@/lib/fmp";
import { scoreTextClass } from "@/lib/score";

function barClass(score: number) {
  if (score >= 90) return "from-accent-2 to-accent";
  if (score >= 80) return "from-[#9adf6a] to-accent";
  return "from-[#e2c15a] to-accent";
}

function ScoreCardFrame({ children }: { children: ReactNode }) {
  return (
    <article
      id="example"
      className="rise relative w-full overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_40px_120px_-64px_rgba(0,0,0,0.9)] transition duration-300 hover:border-white/20"
      style={{ animationDelay: "140ms" }}
    >
      <Link
        href="/stocks/AAPL"
        aria-label="Open the AAPL stock page"
        className="block text-inherit transition hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {children}
      </Link>
    </article>
  );
}

export async function ScoreCard() {
  let stock: StockPageData | null = null;
  try {
    stock = buildStockPage(await getFmpSnapshot("AAPL"));
  } catch {
    stock = null;
  }

  if (!stock || stock.score == null) {
    return (
      <ScoreCardFrame>
        <div className="px-5 py-10 sm:px-6">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">AAPL</p>
          <p className="mt-3 text-sm leading-6 text-muted">The example score could not be loaded.</p>
        </div>
      </ScoreCardFrame>
    );
  }

  return (
    <ScoreCardFrame>
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 sm:px-6">
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Demonstration</p>
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{stock.exchange}</p>
      </div>

      <div className="px-5 py-7 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[1.75rem] font-medium tracking-[-0.04em]">{stock.ticker}</h2>
            <p className="mt-1 text-sm text-muted">{stock.name}</p>
          </div>
          {stock.band ? (
            <p className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
              {stock.band}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex justify-center">
          <ScoreGauge score={stock.score} />
        </div>

        <ul className="mt-8 space-y-3.5">
          {stock.pillars.map((pillar, index) => (
            <li key={pillar.label}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-[13px] text-foreground/90">{pillar.label}</span>
                <span className={`font-mono text-[13px] tabular-nums ${pillar.score == null ? "text-muted" : scoreTextClass(pillar.score)}`}>{pillar.score ?? "—"}</span>
              </div>
              <div
                className="h-1 overflow-hidden rounded-full bg-white/8"
                role={pillar.score == null ? undefined : "meter"}
                aria-label={pillar.label}
                aria-valuemin={pillar.score == null ? undefined : 0}
                aria-valuemax={pillar.score == null ? undefined : 100}
                aria-valuenow={pillar.score ?? undefined}
              >
                <div
                  className={`bar-fill h-full rounded-full bg-gradient-to-r ${barClass(pillar.score ?? 0)}`}
                  style={{
                    width: `${pillar.score ?? 0}%`,
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
          ["Band", stock.band ?? "—"],
          ["Pillars", String(stock.pillars.length)],
          ["Scale", "0–100"],
        ].map(([label, value]) => (
          <div key={label} className="px-4 py-3.5 text-center sm:px-5">
            <dt className="text-[10px] tracking-[0.16em] text-muted uppercase">{label}</dt>
            <dd className="mt-1 font-mono text-sm tracking-tight text-foreground tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </ScoreCardFrame>
  );
}
