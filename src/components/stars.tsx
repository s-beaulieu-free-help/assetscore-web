export function Stars({ value, label }: { value: number; label?: string }) {
  const rounded = Math.max(0, Math.min(5, value));
  return (
    <span className="font-mono tracking-[0.12em] text-accent" aria-label={label ?? `${rounded} out of 5 stars`}>
      {"★★★★★".slice(0, Math.round(rounded))}
      <span className="text-white/20">{"★★★★★".slice(Math.round(rounded))}</span>
    </span>
  );
}
