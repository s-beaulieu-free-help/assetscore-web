import Link from "next/link";
import { AccountNav } from "@/components/account-nav";
import { BrandLogo } from "@/components/brand-logo";

export function SiteHeaderBar({ name, notice = null }: { name: string | null; notice?: string | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[4.25rem] w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <BrandLogo priority />
          <span className="truncate text-sm font-medium tracking-[-0.02em]">
            AssetScore
            <span className="text-muted">.net</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] text-muted md:flex">
          <Link href="/#top" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/#top-rated" className="transition-colors hover:text-foreground">
            Top Rated
          </Link>
          <Link href="/#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/about" className="transition-colors hover:text-foreground">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/#top-rated" className="text-[13px] text-muted transition-colors hover:text-foreground md:hidden">
            Top Rated
          </Link>
          <AccountNav name={name} notice={notice} />
          <Link
            href="/#analyze"
            className="inline-flex h-9 shrink-0 items-center rounded-full bg-accent px-3.5 text-[13px] font-medium text-ink transition hover:brightness-110"
          >
            Analyze a Stock
          </Link>
        </div>
      </div>
    </header>
  );
}
