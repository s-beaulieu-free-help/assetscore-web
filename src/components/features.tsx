import { HowItsScored } from "@/components/how-its-scored";

const features = [
  {
    title: "Simple",
    line: "One score instead of hundreds of metrics",
    detail:
      "Value, growth, quality, financial health, and momentum collapse into a single number from 0 to 100.",
  },
  {
    title: "Fast",
    line: "Evaluate an asset in seconds",
    detail:
      "Type a ticker and read the score before a spreadsheet finishes loading. Built for people who invest after work, not only for full-time analysts.",
  },
  {
    title: "Transparent",
    line: "See exactly how the score is calculated",
    detail:
      "The headline score is the rounded average of the pillars that have data. Each included pillar has equal weight. Open How it's scored for the figure behind each pillar.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:py-32">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
          Why AssetScore
        </p>
        <h2 className="mt-4 max-w-xl text-[2rem] leading-[1.1] font-medium tracking-[-0.035em] text-balance sm:text-4xl">
          A score you can explain to yourself in one sitting.
        </h2>
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="bg-background px-7 py-8 sm:px-8 sm:py-10">
              <h3 className="text-2xl font-medium tracking-[-0.03em]">{feature.title}</h3>
              <p className="mt-4 text-[15px] leading-7 text-foreground">{feature.line}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{feature.detail}</p>
              {feature.title === "Transparent" ? <HowItsScored className="mt-5" /> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
