export function AdSlot() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <aside aria-label="Advertisement" className="mt-14 rounded-2xl border border-dashed border-line px-5 py-8 text-center">
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">Advertisement</p>
      {client ? <div className="mt-3 min-h-16" data-ad-client={client} /> : <p className="mt-3 text-xs text-muted">Ad space</p>}
    </aside>
  );
}
