export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-md border border-line bg-card">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <circle cx="7" cy="7" r="5.25" fill="none" stroke="rgba(244,245,247,0.2)" strokeWidth="1.4" />
              <path
                d="M7 1.75a5.25 5.25 0 0 1 4.2 8.4"
                fill="none"
                stroke="#d7f25c"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-sm font-medium tracking-[-0.02em]">
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
          className="inline-flex h-9 items-center rounded-full bg-accent px-3.5 text-[13px] font-medium text-ink transition hover:brightness-110"
        >
          Analyze a Stock
        </a>
      </div>
    </header>
  );
}
