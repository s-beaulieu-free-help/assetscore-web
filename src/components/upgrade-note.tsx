import { ProEnables } from "@/components/pro-enables";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UpgradeLink } from "@/components/upgrade-link";
import { PRO_MONTHLY_PRICE } from "@/lib/billing/plans";

export function UpgradeNote({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Pro</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted">{copy}</p>
        <ProEnables className="mt-6 max-w-xl" />
        <p className="mt-6 max-w-xl text-sm leading-6 text-muted">
          Pro is {PRO_MONTHLY_PRICE.label}. A paid plan starts only when you subscribe.
        </p>
        <UpgradeLink href="/pricing" className="mt-8 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink">
          See AssetScore Pro
        </UpgradeLink>
      </main>
      <SiteFooter />
    </div>
  );
}
