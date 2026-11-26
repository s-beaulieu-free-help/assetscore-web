import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo className="size-8" />
            <span>
              <span className="block text-sm font-medium tracking-[-0.02em]">
                AssetScore.net
              </span>
              <span className="mt-1 block text-sm text-muted">
                Score any investment in seconds.
              </span>
            </span>
          </Link>
          <nav className="flex max-w-full flex-wrap gap-x-6 gap-y-3 text-[13px] text-muted">
            <Link href="/#top" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <Link href="/#features" className="transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/#faq" className="transition-colors hover:text-foreground">
              FAQ
            </Link>
            <Link href="/rankings/sp500" className="transition-colors hover:text-foreground">
              S&P 500 rankings
            </Link>
            <Link href="/rankings/nasdaq100" className="transition-colors hover:text-foreground">
              Nasdaq 100 rankings
            </Link>
            <Link href="/rankings/dow-jones" className="transition-colors hover:text-foreground">
              Dow Jones rankings
            </Link>
            <Link href="/screener" className="transition-colors hover:text-foreground">
              Stock Screener
            </Link>
            <Link href="/methodology" className="transition-colors hover:text-foreground">
              Methodology
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground">
              About
            </Link>
            <Link href="/learn" className="transition-colors hover:text-foreground">
              Learn
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
          </nav>
        </div>
        <p className="mt-12 max-w-md border-t border-line pt-6 text-xs leading-5 text-muted">
          AssetScore provides informational analysis only and does not provide
          investment advice.
        </p>
      </div>
    </footer>
  );
}
