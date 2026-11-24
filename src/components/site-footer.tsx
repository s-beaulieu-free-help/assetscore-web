export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-tight">AssetScore.net</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
            Score any investment in seconds.
          </p>
        </div>
        <p className="max-w-sm text-xs leading-5 text-muted">
          AssetScore provides informational analysis only and does not provide
          investment advice.
        </p>
      </div>
    </footer>
  );
}
