const signals = [
  { value: "0–100", label: "One scale for every asset" },
  { value: "5 pillars", label: "Value, growth, quality, health, momentum" },
  { value: "Seconds", label: "Read a score without a spreadsheet" },
  { value: "No advice", label: "Informational analysis only" },
] as const;

export function Trust() {
  return (
    <section aria-label="How AssetScore works" className="border-t border-line">
      <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 md:grid-cols-4">
        {signals.map((signal) => (
          <div
            key={signal.value}
            className="border-line px-6 py-8 odd:border-r md:border-r md:py-10 md:last:border-r-0 [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0"
          >
            <dt className="font-mono text-[15px] tracking-tight text-foreground">
              {signal.value}
            </dt>
            <dd className="mt-2 max-w-[16rem] text-sm leading-6 text-muted">{signal.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
