import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <BrandLogo priority />
          <span className="truncate text-sm font-medium tracking-[-0.02em]">
            AssetScore
            <span className="text-muted">.net</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] text-muted md:flex">
          <Link href="/#example" className="transition-colors hover:text-foreground">
            Example
          </Link>
          <Link href="/#features" className="transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/#coverage" className="transition-colors hover:text-foreground">
            Coverage
          </Link>
          <Link href="/about" className="transition-colors hover:text-foreground">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
