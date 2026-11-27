/** Stock-page live badge and last-updated time. */
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

export function LiveDataBadge({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] uppercase ${
        live
          ? "border-accent-2/35 bg-accent-2/10 text-accent-2"
          : "border-[#f0a3a8]/40 bg-[#f0a3a8]/10 text-[#f0a3a8]"
      }`}
    >
      <span className="relative flex size-1.5" aria-hidden="true">
        {live ? <span className="live-ping absolute inline-flex size-full rounded-full bg-accent-2 opacity-70" /> : null}
        <span className={`relative inline-flex size-1.5 rounded-full ${live ? "bg-accent-2" : "bg-[#f0a3a8]"}`} />
      </span>
      {live ? "LIVE DATA" : "DATA UNAVAILABLE"}
    </span>
  );
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
