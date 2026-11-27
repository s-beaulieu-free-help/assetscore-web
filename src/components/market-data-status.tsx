/** Stock-page last-updated time. */
export function formatFetchedAt(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
  }).format(new Date(iso));
}

export function MarketDataSource({ fetchedAt }: { fetchedAt: string | null }) {
  return (
    <div className="mt-3">
      <p className="text-xs text-muted">
        Last Updated:{" "}
        {fetchedAt ? (
          <time className="font-mono text-foreground/85" dateTime={fetchedAt}>
            {formatFetchedAt(fetchedAt)}
          </time>
        ) : (
          <span className="font-mono text-foreground/85">—</span>
        )}
      </p>
    </div>
  );
}
