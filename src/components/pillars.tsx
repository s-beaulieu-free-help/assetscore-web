const pillars = [
  {
    title: "Value",
    detail:
      "Value asks whether the price is high or low compared with the company’s earnings. A lower price-to-earnings reading scores higher. If earnings are negative, value stays low.",
  },
  {
    title: "Growth",
    detail:
      "Growth looks at how much revenue changed from the prior year. Faster sales growth raises the score. A decline in sales lowers it.",
  },
  {
    title: "Quality",
    detail:
      "Quality looks at profitability. It measures how much of each dollar of sales the company keeps as profit. A wider profit margin scores higher.",
  },
  {
    title: "Financial Health",
    detail:
      "Financial health looks at the balance sheet. It combines how comfortably short-term assets cover short-term bills with how much debt the company carries compared with its equity.",
  },
  {
    title: "Momentum",
    detail:
      "Momentum looks at the share price, not the financial statements. It measures where today’s price sits between the low and the high of the past year.",
  },
];

export function Pillars() {
  return (
    <section id="pillars" className="scroll-mt-24 border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">How a stock is scored</p>
        <h2 className="mt-4 max-w-xl text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] sm:text-4xl">
          Five ways to read a company.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
          The AssetScore is the rounded average of the pillars that have data, on a scale from 0 to 100. A missing
          input is left out of the average. The score is an explanation of the numbers, not a recommendation to buy or
          sell.
        </p>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className={`rounded-2xl border border-line bg-card px-6 py-7 ${index < 3 ? "lg:col-span-2" : "lg:col-span-3"}`}
            >
              <h3 className="text-xl font-medium tracking-[-0.03em]">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{pillar.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
