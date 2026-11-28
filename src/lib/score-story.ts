import { PILLAR_COPY } from "@/lib/pillar-copy";
import type { Pillar } from "@/lib/score";

export type ScoreStory = {
  summary: string;
  strengths: Pillar[];
  weaknesses: Pillar[];
  between: Pillar[];
  monitor: { label: string; detail: string }[];
};

export function scoreStory(pillars: Pillar[]): ScoreStory {
  const scored = pillars.filter((pillar): pillar is Pillar & { score: number } => pillar.score != null);
  const missing = pillars.filter((pillar) => pillar.score == null);

  if (scored.length === 0) {
    return {
      summary:
        "The inputs for a score were not returned, so there is no strength or weakness to describe. Missing figures are left out. They are not treated as zero.",
      strengths: [],
      weaknesses: [],
      between: [],
      monitor: missing.map((pillar) => ({ label: pillar.label, detail: pillar.note })),
    };
  }

  const strongest = [...scored].sort((left, right) => right.score - left.score)[0];
  const softest = [...scored].sort((left, right) => left.score - right.score)[0];
  const strengths = scored.filter((pillar) => pillar.score >= 70).sort((left, right) => right.score - left.score);
  const weaknesses = scored.filter((pillar) => pillar.score < 60).sort((left, right) => left.score - right.score);
  const between = scored
    .filter((pillar) => pillar.score >= 60 && pillar.score < 70)
    .sort((left, right) => right.score - left.score);

  const summary =
    strongest.label === softest.label
      ? `${strongest.label} is the only pillar with data, at ${strongest.score}. The overall score is that reading. It describes the latest figures and does not predict the share price.`
      : `${strongest.label} is supporting the score at ${strongest.score}. ${softest.label} is the softest reading at ${softest.score}. The overall score pulls the available pillar scores slightly toward their middle, then rounds that average. It describes those characteristics and does not predict future returns.`;

  const monitor = [
    ...weaknesses.map((pillar) => ({
      label: pillar.label,
      detail: `${PILLAR_COPY[pillar.label].watch} ${pillar.note}`,
    })),
    ...missing.map((pillar) => ({ label: pillar.label, detail: pillar.note })),
  ];

  if (monitor.length === 0) {
    monitor.push({
      label: softest.label,
      detail: `${PILLAR_COPY[softest.label].watch} ${softest.note}`,
    });
  }

  return { strengths, weaknesses, between, summary, monitor };
}
