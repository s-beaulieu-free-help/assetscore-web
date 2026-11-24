export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-[-0.02em]">AssetScore.net</p>
            <p className="mt-2 text-sm text-muted">Score any investment in seconds.</p>
          </div>
          <nav className="flex gap-6 text-[13px] text-muted">
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
        </div>
        <p className="mt-12 max-w-md border-t border-line pt-6 text-xs leading-5 text-muted">
          AssetScore provides informational analysis only and does not provide
          investment advice.
        </p>
      </div>
    </footer>
  );
}
