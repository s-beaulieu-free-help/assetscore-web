import Link from "next/link";
import { HEADLINE_SCORE_SUMMARY } from "@/lib/score";

const sources = [
  { pillar: "Value", source: "Annual price-to-earnings ratio. A lower positive multiple scores higher. Negative earnings keep Value low." },
  { pillar: "Growth", source: "Year-over-year revenue growth from the latest annual comparison. Faster growth scores higher." },
  { pillar: "Quality", source: "Annual net profit margin. A wider margin scores higher." },
  {
    pillar: "Financial Health",
    source: "Annual current ratio and debt compared with equity. When both exist, the pillar is their average. When only one exists, that one is the pillar.",
  },
  {
    pillar: "Momentum",
    source: "Latest quote price between the 52-week low and high. A price near the high scores higher. If that range is missing, Momentum can use the change versus an earlier close.",
  },
];

export function HowItsScored({ className = "" }: { className?: string }) {
  return (
    <details className={`rounded-xl border border-line bg-white/[0.03] px-4 py-3 ${className}`}>
      <summary className="cursor-pointer text-sm font-medium tracking-[-0.01em] text-foreground">How it&apos;s scored</summary>
      <div className="mt-3 space-y-3 text-sm leading-6 text-muted">
        <p>
          {HEADLINE_SCORE_SUMMARY}
        </p>
        <p>The figures are the latest quote and the latest annual statements.</p>
        <ul className="space-y-2">
          {sources.map((item) => (
            <li key={item.pillar}>
              <span className="text-foreground">{item.pillar}.</span> {item.source}
            </li>
          ))}
        </ul>
        <p>
          Banks and insurers leave out Quality and Financial Health. Real estate investment trusts leave out Value,
          Quality, and Financial Health. An omitted pillar is excluded from the average.
        </p>
        <p>
          <Link href="/methodology" className="text-foreground hover:text-accent">
            Full methodology
          </Link>
        </p>
      </div>
    </details>
  );
}
