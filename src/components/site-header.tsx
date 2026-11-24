import { BrandLogo } from "@/components/brand-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center justify-between gap-4 px-6">
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <BrandLogo priority />
          <span className="truncate text-sm font-medium tracking-[-0.02em]">
            AssetScore
            <span className="text-muted">.net</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-[13px] text-muted md:flex">
          <a href="#example" className="transition-colors hover:text-foreground">
            Example
          </a>
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#coverage" className="transition-colors hover:text-foreground">
            Coverage
          </a>
        </nav>
        <a
          href="#analyze"
          className="inline-flex h-9 shrink-0 items-center rounded-full bg-accent px-3.5 text-[13px] font-medium text-ink transition hover:brightness-110"
        >
          Analyze a Stock
        </a>
      </div>
    </header>
  );
}
