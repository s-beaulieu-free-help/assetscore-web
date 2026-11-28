"use client";

import { UpgradeLink } from "@/components/upgrade-link";
import { useState } from "react";
import { ScoreGauge } from "@/components/score-gauge";
import { scoreTextClass } from "@/lib/score";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";
import type { PortfolioAnalysis } from "@/lib/portfolio-quality";

export type PortfolioHistoryPoint = {
  snapshotDate: string;
  ops: number | null;
  cqs: number | null;
  pcs: number | null;
  coverage: number | null;
  sectors: { sector: string; allocation: number }[];
  dimensions: { label: string; score: number | null }[];
};

const sections = ["Overview", "Quality", "Diversification", "History", "Methodology"] as const;

function scoreText(score: number | null, status: string) {
  if (score == null) return "Unavailable";
  return status === "partial" ? `${score} · partial` : String(score);
}

function Bar({ label, value, max, suffix = "%" }: { label: string; value: number | null; max: number; suffix?: string }) {
  if (value == null) {
    return (
      <div className="grid grid-cols-[8rem_1fr_4rem] items-center gap-3 text-sm">
        <span className="truncate text-muted">{label}</span>
        <span className="h-2 rounded-full bg-white/10" />
        <span className="text-right font-mono tabular-nums">—</span>
      </div>
    );
  }
  const width = max > 0 ? Math.max(2, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="grid grid-cols-[8rem_1fr_4rem] items-center gap-3 text-sm">
      <span className="truncate text-muted">{label}</span>
      <span className="h-2 overflow-hidden rounded-full bg-white/10">
        <span className="block h-full rounded-full bg-accent" style={{ width: `${width}%` }} />
      </span>
      <span className="text-right font-mono tabular-nums">{suffix === "%" ? `${value.toFixed(1)}%` : value.toFixed(0)}</span>
    </div>
  );
}

export function PortfolioQualityView({
  analysis,
  advanced,
  history,
}: {
  analysis: PortfolioAnalysis;
  advanced: boolean;
  history: PortfolioHistoryPoint[];
}) {
  const [section, setSection] = useState<(typeof sections)[number]>("Overview");
  const coverage = analysis.company.coverage == null ? "No holdings" : `${analysis.company.coverage.toFixed(1)}% ${analysis.company.coverageBand}`;

  return (
    <section className="mt-10">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={section === item}
            onClick={() => setSection(item)}
            className={`h-10 shrink-0 rounded-full px-4 text-sm ${section === item ? "bg-foreground text-background" : "border border-line text-muted"}`}
          >
            {item}
          </button>
        ))}
      </div>

      {section === "Overview" ? (
        <div className="mt-4 rounded-2xl border border-line bg-card px-6 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              ["Overall", analysis.overall.score, analysis.overall.band],
              ["Company quality", analysis.company.score, analysis.company.status === "partial" ? "Partial coverage" : null],
              ["Construction", analysis.construction.score, null],
            ].map(([label, score, note]) => (
              <div key={String(label)} className="flex flex-col items-center text-center">
                {typeof score === "number" ? <ScoreGauge score={score} size={148} id={`portfolio-${label}`} /> : <p className="grid h-[148px] place-items-center text-sm text-muted">Unavailable</p>}
                <p className="mt-3 text-sm font-medium">{label}</p>
                {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-6 text-muted">
            {analysis.holdings} holding{analysis.holdings === 1 ? "" : "s"} · Allocation entered {analysis.allocationTotal.toFixed(2)}% · Coverage {coverage}
          </p>
          {analysis.overall.reason ? <p className="mt-3 text-sm leading-6 text-muted">{analysis.overall.reason}</p> : null}
          {analysis.allocationTotal > 0 && Math.abs(analysis.allocationTotal - 100) > 0.01 ? (
            <p className="mt-3 text-sm leading-6 text-muted">
              Allocations total {analysis.allocationTotal.toFixed(2)}%. Scores use the allocations you entered and do not fill the difference to 100%.
            </p>
          ) : null}
          <ul className="mt-6 space-y-3">
            {analysis.insights.map((insight) => (
              <li key={insight.title} className="text-sm leading-6">
                <span className="font-medium">{insight.title}</span>
                {advanced ? <span className="mt-1 block text-muted">{insight.explanation}</span> : null}
              </li>
            ))}
          </ul>
          {advanced ? null : (
            <p className="mt-6 text-sm leading-6 text-muted">
              Unlock complete Portfolio Intelligence and understand the quality and construction of your investments. Pro is {PRO_MONTHLY_PRICE.label}. A new account includes a 30-day trial.{" "}
              <UpgradeLink href="/pricing" className="text-foreground underline">
                See AssetScore Pro
              </UpgradeLink>
            </p>
          )}
        </div>
      ) : null}

      {section === "Quality" ? (
        <div className="mt-4 rounded-2xl border border-line bg-card p-6">
          {advanced ? (
            <>
              <h2 className="text-lg font-medium">Company Quality {scoreText(analysis.company.score, analysis.company.status)}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                This is the allocation-weighted average of existing AssetScores. Missing scores are excluded. Coverage is {coverage}. Debt is already part of Financial Health, so it is not scored again.
              </p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {analysis.company.pillars.map((pillar) => (
                  <div key={pillar.label}>
                    <dt className="text-xs text-muted">{pillar.label}</dt>
                    <dd className="mt-1 font-mono text-lg tabular-nums">{pillar.score ?? "—"}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">Strongest scored holdings</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {analysis.company.strongest.map((row) => (
                      <li key={row.ticker}>{row.ticker} · <span className={scoreTextClass(row.score)}>{row.score}</span> · {row.allocation.toFixed(1)}%</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Weakest scored holdings</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {analysis.company.weakest.map((row) => (
                      <li key={row.ticker}>{row.ticker} · <span className={scoreTextClass(row.score)}>{row.score}</span> · {row.allocation.toFixed(1)}%</li>
                    ))}
                  </ul>
                </div>
              </div>
              {analysis.company.missing.length > 0 ? <p className="mt-4 text-sm text-muted">Missing AssetScores: {analysis.company.missing.join(", ")}</p> : null}
              {analysis.company.etfs.length > 0 ? <p className="mt-2 text-sm text-muted">ETFs excluded from company quality: {analysis.company.etfs.map((etf) => `${etf.ticker} ${etf.allocation.toFixed(1)}%`).join(", ")}</p> : null}
              {analysis.stale.length > 0 ? <p className="mt-2 text-sm text-muted">Statements older than 18 months: {analysis.stale.map((row) => `${row.ticker} ${row.statementDate}`).join(", ")}</p> : null}
            </>
          ) : (
            <p className="text-sm leading-6 text-muted">
              Company Quality is {scoreText(analysis.company.score, analysis.company.status)}. The pillar breakdown is part of Pro.{" "}
              <UpgradeLink href="/pricing" className="text-foreground underline">See AssetScore Pro</UpgradeLink>
            </p>
          )}
        </div>
      ) : null}

      {section === "Diversification" ? (
        <div className="mt-4 rounded-2xl border border-line bg-card p-6">
          {advanced ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <p className="text-sm">Stock concentration <span className="font-mono">{analysis.construction.stock.score ?? "—"}</span></p>
                <p className="text-sm">Sector concentration <span className="font-mono">{analysis.construction.sector.score ?? "—"}</span></p>
                <p className="text-sm">Position sizing <span className="font-mono">{analysis.construction.sizing.score ?? "—"}</span></p>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                {analysis.construction.stock.holdings} holdings · Effective holdings {analysis.construction.stock.effectiveHoldings?.toFixed(2) ?? "—"} · HHI {analysis.construction.stock.hhi?.toFixed(4) ?? "—"} · Largest {analysis.construction.stock.largest ? `${analysis.construction.stock.largest.ticker} ${analysis.construction.stock.largest.allocation.toFixed(1)}%` : "—"} · Top 3 {analysis.construction.stock.top3.toFixed(1)}% · Top 5 {analysis.construction.stock.top5.toFixed(1)}% · Above 10% {analysis.construction.sizing.over10} · Above 20% {analysis.construction.sizing.over20}
              </p>
              <h3 className="mt-6 text-sm font-medium">Holdings</h3>
              <div className="mt-3 space-y-2">
                {analysis.construction.sector.allocations.length === 0 && analysis.holdings === 0 ? <p className="text-sm text-muted">No holdings yet.</p> : null}
              </div>
              <HoldingBars analysis={analysis} />
              <h3 className="mt-6 text-sm font-medium">Sectors</h3>
              <div className="mt-3 space-y-2">
                {analysis.construction.sector.allocations.map((sector) => (
                  <Bar key={sector.sector} label={sector.sector} value={sector.allocation} max={analysis.allocationTotal || 100} />
                ))}
                {analysis.construction.sector.unclassifiedAllocation > 0 ? (
                  <Bar label="Unclassified" value={analysis.construction.sector.unclassifiedAllocation} max={analysis.allocationTotal || 100} />
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                {analysis.construction.sector.count} classified sectors · Effective sectors {analysis.construction.sector.effectiveSectors?.toFixed(2) ?? "—"} · Sector HHI {analysis.construction.sector.hhi?.toFixed(4) ?? "—"}. Missing sector labels stay unclassified.
                {analysis.construction.sector.missing.length > 0 ? ` Missing: ${analysis.construction.sector.missing.join(", ")}.` : ""}
              </p>
            </>
          ) : (
            <p className="text-sm leading-6 text-muted">
              Portfolio Construction is {scoreText(analysis.construction.score, analysis.construction.status)}. Sector and position detail is part of Pro.{" "}
              <UpgradeLink href="/pricing" className="text-foreground underline">See AssetScore Pro</UpgradeLink>
            </p>
          )}
        </div>
      ) : null}

      {section === "History" ? (
        <div className="mt-4 rounded-2xl border border-line bg-card p-6">
          {advanced ? (
            history.length === 0 ? (
              <p className="text-sm leading-6 text-muted">No daily snapshot is stored yet. A snapshot is saved once per day when you open this portfolio, using the scores calculated that day.</p>
            ) : (
              <div className="space-y-4">
                {history.map((point) => (
                  <div key={point.snapshotDate}>
                    <p className="font-mono text-xs text-muted">{point.snapshotDate} · methodology {analysis.methodologyVersion}</p>
                    <div className="mt-2 space-y-2">
                      <Bar label="Overall" value={point.ops} max={100} suffix="" />
                      <Bar label="Company" value={point.cqs} max={100} suffix="" />
                      <Bar label="Construction" value={point.pcs} max={100} suffix="" />
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      Coverage {point.coverage == null ? "—" : `${point.coverage.toFixed(1)}%`}
                      {point.dimensions.length > 0 ? ` · ${point.dimensions.map((item) => `${item.label} ${item.score ?? "—"}`).join(" · ")}` : ""}
                      {point.sectors.length > 0 ? ` · ${point.sectors.map((item) => `${item.sector} ${item.allocation.toFixed(1)}%`).join(" · ")}` : ""}
                    </p>
                  </div>
                ))}
                <p className="text-sm leading-6 text-muted">These are the stored values. Opening the portfolio today does not rewrite an earlier date.</p>
              </div>
            )
          ) : (
            <p className="text-sm leading-6 text-muted">
              Historical portfolio scores are kept when a subscription ends and are visible with Pro.{" "}
              <UpgradeLink href="/pricing" className="text-foreground underline">See AssetScore Pro</UpgradeLink>
            </p>
          )}
        </div>
      ) : null}

      {section === "Methodology" ? (
        <div className="mt-4 space-y-4 rounded-2xl border border-line bg-card p-6 text-sm leading-6 text-muted">
          <p>Methodology version {analysis.methodologyVersion}. AssetScore portfolio scores describe company quality and portfolio construction. They do not predict returns or guarantee performance, and they do not recommend buying or selling a security.</p>
          <p>Company Quality is the allocation-weighted average of the existing AssetScore for each company. A holding without a score is left out of the average. Coverage is the scored allocation divided by the allocation you entered. At 90% or more the reading is high coverage. From 70% up to 90% it is partial. Below 70% Company Quality is withheld.</p>
          <p>The pillar figures use the same Value, Growth, Quality, Financial Health, and Momentum scores already on each stock. Financial Health already includes the debt measure, so debt is not added a second time. A pillar that a stock does not have is omitted from that pillar&apos;s average.</p>
          <p>Portfolio Construction is 45% individual-stock concentration, 35% sector concentration, and 20% position sizing. Concentration uses the Herfindahl-Hirschman Index on decimal weights. Effective holdings equal 1 divided by that index. A higher score means broader diversification. It is not the index multiplied by 100. One holding scores 0. Twelve or more equally sized holdings score 100 on the stock-concentration scale.</p>
          <p>Sector groups use the sector already stored for each company. A missing sector is reported as unclassified and is not assigned a made-up sector. If unclassified holdings, including ETFs, are more than 30% of the entered allocation, the sector score and the construction score are withheld.</p>
          <p>Position sizing starts at 100 and subtracts points as the largest holding, the number of holdings above 10% and 20%, and the combined top three and top five grow. The cutoffs are AssetScore product rules, not a universal allocation rule.</p>
          <p>Overall is 60% Company Quality and 40% Portfolio Construction. The blend is shown only when both parts are available. A missing part is not replaced by changing the weights. Bands are Excellent, Very Good, Good, Fair, Weak, and Poor.</p>
          <p>An ETF stays in the allocation and in stock concentration. It does not receive an invented company score or sector. Look-through into an ETF&apos;s holdings is not part of this version.</p>
          <p>A daily snapshot stores the scores calculated that day. A later data update does not recalculate an older snapshot. Changing a holding updates today&apos;s calculation. It does not create a new snapshot for each click.</p>
        </div>
      ) : null}
    </section>
  );
}

function HoldingBars({ analysis }: { analysis: PortfolioAnalysis }) {
  if (analysis.positions.length === 0) return null;
  return (
    <div className="mt-3 space-y-2">
      {analysis.positions.map((row) => (
        <Bar key={row.ticker} label={row.ticker} value={row.allocation} max={analysis.allocationTotal || 100} />
      ))}
    </div>
  );
}
