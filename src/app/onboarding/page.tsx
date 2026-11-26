import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { recordConsentedEvent } from "@/lib/analytics";

export const metadata: Metadata = { title: "Get started · AssetScore" };

const steps = [
  {
    title: "Evaluate a stock",
    body: "Search for a stock you already own or one you are considering.",
    href: "/#analyze",
    action: "Search stocks",
  },
  {
    title: "Explore the five pillars",
    body: "On a stock page, read Value, Growth, Quality, Financial Health, and Momentum. Each one explains the figure behind it.",
    href: "/methodology",
    action: "Read the methodology",
  },
  {
    title: "Create a portfolio",
    body: "Add the stocks you hold and give each one an allocation.",
    href: "/portfolios",
    action: "Open portfolios",
  },
  {
    title: "Explore portfolio scoring",
    body: "When the allocations total 100%, AssetScore shows the weighted portfolio score and where it is strong or thin.",
    href: "/portfolios",
    action: "Review a portfolio",
  },
  {
    title: "Save favorites",
    body: "Build a watchlist from any stock page. Favorites stay in your account.",
    href: "/favorites",
    action: "Open favorites",
  },
];

export default async function OnboardingPage() {
  await recordConsentedEvent("registration_completed");

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Getting started</p>
        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h1 className="max-w-2xl text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Start with a stock you know.</h1>
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            Skip for now
          </Link>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          Your 30-day Pro trial starts after the email address is confirmed. These steps are optional. You can leave and
          come back whenever you want.
        </p>
        <ol className="mt-10 grid gap-4">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-line bg-card p-6">
              <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Step {index + 1}</p>
              <h2 className="mt-2 text-xl font-medium">{step.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{step.body}</p>
              <Link href={step.href} className="mt-4 inline-flex text-sm text-foreground hover:text-accent">
                {step.action}
              </Link>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </div>
  );
}
