export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-accent text-sm font-semibold text-ink">
            A
          </span>
          <span className="text-[15px] font-medium tracking-tight">
            AssetScore
            <span className="text-muted">.net</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
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
          className="rounded-full bg-accent px-3.5 py-2 text-sm font-medium text-ink transition hover:brightness-110"
        >
          Analyze a Stock
        </a>
      </div>
    </header>
  );
}
