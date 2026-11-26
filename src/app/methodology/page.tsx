import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PILLAR_COPY } from "@/lib/pillar-copy";
import { bandFor, type PillarLabel } from "@/lib/score";

export const metadata: Metadata = {
  title: "How AssetScore is calculated",
  description:
    "How AssetScore turns annual figures and the latest quote into a 0–100 score, how missing data is handled, and why a high score is not a forecast.",
};

const ORDER: PillarLabel[] = ["Value", "Growth", "Quality", "Financial Health", "Momentum"];

const bands = [
  { from: "90–100", name: bandFor(90) },
  { from: "80–89", name: bandFor(80) },
  { from: "70–79", name: bandFor(70) },
  { from: "60–69", name: bandFor(60) },
  { from: "0–59", name: bandFor(59) },
];

export default function MethodologyPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Methodology</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">How the score is calculated</h1>
        <p className="mt-6 text-sm leading-7 text-muted">
          AssetScore describes company characteristics from the latest Financial Modeling Prep quote and the latest
          annual figures. It is not a prediction of future returns, and it is not investment advice.
        </p>

        <section className="mt-12">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">The overall score</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Five pillars are scored from 0 to 100. The headline score is the rounded average of the pillars that have
            data. Each included pillar has the same weight. A pillar with no input is left out of the average. It is
            not replaced with zero.
          </p>
          <ul className="mt-6 divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {bands.map((band) => (
              <li key={band.from} className="flex items-baseline justify-between gap-4 px-5 py-4">
                <span className="font-mono text-sm tabular-nums">{band.from}</span>
                <span className="text-sm">{band.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 space-y-8">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">The five pillars</h2>
          {ORDER.map((label) => {
            const copy = PILLAR_COPY[label];
            return (
              <article key={label}>
                <h3 className="text-xl font-medium tracking-[-0.03em]">{label}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{copy.measures}</p>
                <p className="mt-3 text-sm leading-7 text-muted">{copy.matters}</p>
                <p className="mt-3 text-sm leading-7 text-muted">{copy.indicators}</p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {copy.high} {copy.low}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">Missing data</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            If a figure is not returned, the page says so and that pillar is omitted from the average when it has
            nothing to score. Financial Health can still be scored from whichever of the current ratio or debt to
            equity was returned. Amounts are shown in US dollars. A dash is a missing figure, not a zero.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            Annual ratios and annual revenue growth can be from a different reporting period than today’s quote. The
            stock page shows when the data was fetched, in US Eastern time. A successful response is reused for about
            five minutes.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">What the score does not do</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            A high score means the available pillars average higher. It does not mean the shares will rise, and a low
            score does not mean they will fall. The score does not include dividends, analyst opinions, or a target
            price.
          </p>
          <p className="mt-6">
            <Link href="/#analyze" className="text-sm text-foreground hover:text-accent">
              Analyze a stock
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
