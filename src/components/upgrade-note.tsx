import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function UpgradeNote({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">Pro</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-medium tracking-[-0.045em] sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-muted">{copy}</p>
        <Link href="/pricing" className="mt-8 inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-ink">
          See Pro plans
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
