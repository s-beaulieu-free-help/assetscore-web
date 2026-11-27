import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { loadScreenerDataset, type ScreenerRow } from "@/lib/screener";
import { shareMetadata } from "@/lib/seo";

const title = "Sample stock reports · AssetScore";
const description =
  "Sample AssetScore reports from the daily published dataset. Each report shows the 0–100 score, the band, and the five pillars for a US-listed company.";

export const metadata: Metadata = shareMetadata({ title, description, path: "/reports" });

const examples = [
  { symbol: "REGN", role: "Strong healthcare company" },
  { symbol: "KO", role: "Solid consumer staple" },
  { symbol: "CAT", role: "Weaker industrial company" },
];

const pillars: Array<{ label: string; key: keyof ScreenerRow }> = [
  { label: "Value", key: "value" },
  { label: "Growth", key: "growth" },
  { label: "Quality", key: "quality" },
  { label: "Financial Health", key: "health" },
  { label: "Momentum", key: "momentum" },
];

function publishedLabel(publishedAt: string | null) {
  if (!publishedAt) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(publishedAt));
}

export default function ReportsPage() {
  const dataset = loadScreenerDataset();
  const bySymbol = new Map(dataset.rows.map((row) => [row.symbol, row]));
  const reports = examples.flatMap((example) => {
    const row = bySymbol.get(example.symbol);
    return row ? [{ ...example, row }] : [];
  });
  const label = publishedLabel(dataset.publishedAt);

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Sample reports</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">How a finished score reads</h1>
        <p className="mt-6 text-sm leading-7 text-muted">
          These reports use the daily published dataset{label ? `, published ${label}` : ""}. The headline number is the
          rounded average of the pillars that have data. Each included pillar has equal weight. A live stock page uses
          the latest quote, so its score can differ from this published snapshot.
        </p>
        {reports.length === 0 ? (
          <p className="mt-10 text-sm leading-7 text-muted">The daily dataset has not been published yet.</p>
        ) : (
          <div className="mt-12 space-y-8">
            {reports.map((report) => (
              <article key={report.symbol} className="rounded-2xl border border-line bg-card px-6 py-7">
                <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{report.role}</p>
                <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em]">
                  <Link href={`/stocks/${report.symbol}`} className="hover:text-accent">
                    {report.row.name}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {report.symbol}
                  <span className="px-2 text-white/20">·</span>
                  {report.row.score} of 100
                  <span className="px-2 text-white/20">·</span>
                  {report.row.band}
                </p>
                <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-5">
                  {pillars.map((pillar) => (
                    <div key={pillar.key}>
                      <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">{pillar.label}</dt>
                      <dd className="mt-1 font-mono text-sm tabular-nums">{report.row[pillar.key] ?? "—"}</dd>
                    </div>
                  ))}
                </dl>
                <Link href={`/stocks/${report.symbol}`} className="mt-5 inline-flex text-sm text-foreground hover:text-accent">
                  Open the live {report.symbol} analysis
                </Link>
              </article>
            ))}
          </div>
        )}
        <p className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/methodology" className="text-foreground hover:text-accent">
            Methodology
          </Link>
          <Link href="/coverage" className="text-foreground hover:text-accent">
            Coverage
          </Link>
          <Link href="/register" className="text-foreground hover:text-accent">
            Create a free account
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
