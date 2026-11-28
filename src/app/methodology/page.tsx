import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PILLAR_COPY } from "@/lib/pillar-copy";
import { bandFor, HEADLINE_SCORE_SUMMARY, type PillarLabel } from "@/lib/score";
import { shareMetadata } from "@/lib/seo";

const title = "Stock scoring methodology · AssetScore";
const description =
  "How AssetScore turns annual figures and the latest quote into a 0–100 stock score, how missing financial data is handled, and why a high score is not a forecast.";

export const metadata: Metadata = shareMetadata({ title, description, path: "/methodology" });

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
          AssetScore describes company characteristics from the latest quote and the latest annual figures. It is not a
          prediction of future returns, and it is not investment advice.
        </p>

        <section className="mt-12">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">The overall score</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            {HEADLINE_SCORE_SUMMARY} The middle score is the median. With an odd count, that is the center value. With
            an even count, it is the average of the two center values. The median and the adjusted scores are not
            rounded. The average of the adjusted scores is rounded, then kept between 0 and 100.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            One available pillar is the AssetScore, with no pull toward a middle. Two available pillars move toward
            their midpoint, so their average does not change before that final rounding. A high overall score does not
            mean every pillar is strong. For example, pillar scores of 90, 80, 75, 70, and 20 have a median of 75.
            After each score moves 15% of the way toward 75, they average 68.2, which rounds to 68. The 90 does not
            erase the 20, and the 20 is not left as extreme as it started.
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
          <h2 className="text-2xl font-medium tracking-[-0.03em]">How Financial Metrics Become Scores</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            Each pillar starts from a reported figure, is rounded, and is kept between 0 and 100. The mapping below is
            the one a stock page uses now. Banks, insurers, and real estate investment trusts leave out ratios that do
            not fit those industries.
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
            <li>Value uses the annual price-to-earnings ratio. A lower positive multiple scores higher. Negative earnings keep Value low.</li>
            <li>Growth uses year-over-year revenue growth. Faster growth scores higher. A decline scores lower.</li>
            <li>Quality uses the annual net profit margin. A wider margin scores higher. A loss scores lower.</li>
            <li>
              Financial Health uses the annual current ratio and debt compared with equity. A higher current ratio raises
              that part of the score. More debt relative to equity lowers the other part. When both figures exist, the
              pillar is their average. When only one exists, that one is the pillar.
            </li>
            <li>
              Momentum uses the latest price compared with the 52-week low and high. A price near the high scores higher.
              A price near the low scores lower. If that range is missing and at least 40 closing prices exist, Momentum
              uses the change versus an earlier close.
            </li>
          </ul>
          <h3 className="mt-8 text-xl font-medium tracking-[-0.03em]">Pillar formulas</h3>
          <p className="mt-4 text-sm leading-7 text-muted">
            Value starts at 100 when the annual price-to-earnings ratio is 8 and falls by 1.6 points for each multiple
            above 8, with a floor of 0. A negative multiple scores 12. Growth is 50 plus 80 times the revenue growth
            rate as a decimal, so 15% growth is 0.15. Quality is 35 plus 140 times the net profit margin as a decimal.
            Financial Health scores the current ratio as 20 plus 40 times that ratio, and debt-to-equity as 88 minus 18
            times that ratio. Each of those two parts is rounded and kept between 0 and 100, then the pillar is the
            rounded average of the parts that were returned. Momentum is the price position from the 52-week low to the
            high, scaled from 0 to 100. When that range is missing, at least 40 closes exist, and an earlier close is
            available, Momentum is 50 plus 120 times the price change versus that earlier close. Every pillar is
            rounded and kept between 0 and 100 before the overall score is calculated.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            Banks and insurers keep Value, Growth, and Momentum. Quality and Financial Health are omitted. Real estate
            investment trusts keep Growth and Momentum. Value, Quality, and Financial Health are omitted. Other
            financial companies stay on the operating-company formulas. The omitted ratios are not replaced with
            another number. Capital ratios, underwriting results, and funds from operations are not in the data
            AssetScore stores today.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            Rankings and the screener use this same overall-score calculation on the pillar scores already in the daily
            file. Older rows in score history stay as they were stored. They are not recalculated.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            The available pillar scores contribute equally to the overall AssetScore after the median adjustment. A
            company can outrank another because its earnings multiple,
            revenue change, profit margin, balance sheet, or price position is different. One strong pillar does not
            erase a weak one when both have data.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            A high score means the available pillars average higher. A low score means they average lower. On a stock
            page, the explanation names that company&apos;s own strongest and softest pillars, so two companies are not
            described with the same sentence.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            Quantitative scoring has limits. It does not include dividends, analyst opinions, or a target price. Annual
            statements and the quote can come from different periods. A missing figure narrows the average instead of
            filling in a guess. The result describes the latest available inputs. It is not a prediction of the share
            price and it is not investment advice.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-medium tracking-[-0.03em]">Missing data</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            If a figure is not returned, the page says so and that pillar is omitted from the headline score when it has
            nothing to score. For an operating company, Financial Health can still be scored from whichever of the
            current ratio or debt to equity was returned. Amounts are shown in US dollars. A dash is a missing figure,
            not a zero. A pillar left out because of the industry is also excluded, and the page says why.
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
