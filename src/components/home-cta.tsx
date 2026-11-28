import Link from "next/link";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";

const points = [
  "Unlimited stock evaluations",
  "Stock Screener",
  "Portfolios and stock comparisons",
  "No credit card, and no automatic charge",
];

export function HomeCta() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
        <h2 className="max-w-2xl text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] sm:text-4xl">
          Take control of your investments.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Create your free account. For 30 days you can run unlimited stock evaluations, use the Stock Screener, create portfolios, and compare stocks.
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {points.map((point) => (
            <li key={point} className="rounded-2xl border border-line bg-card px-5 py-4 text-sm">
              {point}
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-muted">
          The trial starts after you confirm your email. It does not turn into a paid subscription. Pro is{" "}
          {PRO_MONTHLY_PRICE.label} only if you choose it later.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink transition hover:brightness-110"
        >
          Start Your Free 30-Day Trial
        </Link>
      </div>
    </section>
  );
}
