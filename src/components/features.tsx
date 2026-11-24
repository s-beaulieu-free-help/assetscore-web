const features = [
  {
    index: "01",
    title: "Simple",
    line: "One score instead of hundreds of metrics",
    detail:
      "Value, growth, quality, financial health, and momentum collapse into a single number from 0 to 100.",
  },
  {
    index: "02",
    title: "Fast",
    line: "Evaluate an asset in seconds",
    detail:
      "Type a ticker and read the score before a spreadsheet finishes loading. Built for people who invest after work, not only for full-time analysts.",
  },
  {
    index: "03",
    title: "Transparent",
    line: "See exactly how the score is calculated",
    detail:
      "Every AssetScore shows the five pillars beside the headline number, so a high score is something you can question, not a black box.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 lg:py-28">
        <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
          Why AssetScore
        </p>
        <h2 className="mt-3 max-w-xl text-3xl font-medium tracking-tight sm:text-4xl">
          A score you can explain to yourself in one sitting.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-3xl border border-line bg-white/[0.02] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-white/20"
            >
              <p className="font-mono text-xs text-accent">{feature.index}</p>
              <h3 className="mt-6 text-2xl font-medium tracking-tight">{feature.title}</h3>
              <p className="mt-3 text-base leading-7 text-foreground">{feature.line}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{feature.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
