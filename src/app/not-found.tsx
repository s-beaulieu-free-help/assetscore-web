import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col justify-center px-6 py-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">404</p>
        <h1 className="mt-4 max-w-xl text-4xl font-medium tracking-[-0.04em]">
          No analysis for that symbol.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted">
          AssetScore looks up any ticker Financial Modeling Prep lists. Check the symbol and try again.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 w-fit items-center rounded-full bg-accent px-5 text-sm font-medium text-ink"
        >
          Back to AssetScore
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
