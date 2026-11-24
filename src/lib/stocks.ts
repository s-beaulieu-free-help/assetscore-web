export type Pillar = {
  label: "Value" | "Growth" | "Quality" | "Financial Health" | "Momentum";
  score: number;
  note: string;
};

export type Metric = {
  label: string;
  value: string;
  hint: string;
};

export type StockAnalysis = {
  ticker: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  score: number;
  band: string;
  pillars: Pillar[];
  metrics: Metric[];
  reasons: string[];
  history: number[];
  curated: boolean;
};

const labels = ["Value", "Growth", "Quality", "Financial Health", "Momentum"] as const;

const curated: Record<
  string,
  {
    name: string;
    exchange: string;
    price: number;
    change: number;
    pillars: readonly [number, number, number, number, number];
    notes: readonly [string, string, string, string, string];
    metrics: Metric[];
    reasons: string[];
    historyStart: number;
  }
> = {
  NVDA: {
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    price: 142.86,
    change: 1.84,
    pillars: [70, 97, 88, 82, 85],
    notes: [
      "The multiple prices in several years of growth, so value is the constraint.",
      "Data-center demand is still compounding faster than almost any large-cap peer.",
      "Gross margin and returns on capital stay in a class of their own.",
      "Net cash and free cash flow cover the buildout without stretching the balance sheet.",
      "The trend is intact, even after a long run.",
    ],
    metrics: [
      { label: "Market cap", value: "$3.50T", hint: "Illustrative" },
      { label: "P/E", value: "48.6", hint: "Trailing" },
      { label: "Revenue growth", value: "94%", hint: "Year over year" },
      { label: "Gross margin", value: "75.1%", hint: "Latest year" },
      { label: "Free cash flow", value: "$64.2B", hint: "Latest year" },
      { label: "Net cash", value: "$26.8B", hint: "Cash minus debt" },
    ],
    reasons: [
      "Growth at 97 does most of the lifting. The business is still adding revenue faster than the score’s other pillars can keep up with.",
      "Quality at 88 and financial health at 82 keep that growth from looking fragile. Margins are wide, and the balance sheet is not the risk.",
      "Momentum at 85 says the price trend agrees with the operating story. Value at 70 is what holds the composite in the Strong band instead of higher.",
    ],
    historyStart: 88.4,
  },
  AAPL: {
    name: "Apple Inc.",
    exchange: "NASDAQ",
    price: 228.42,
    change: -1.16,
    pillars: [72, 68, 90, 88, 62],
    notes: [
      "The earnings yield is reasonable for a franchise of this durability.",
      "Growth is steady rather than fast, which caps the pillar.",
      "Installed base, margins, and returns on capital are the core of the score.",
      "A large net cash position and recurring cash flow keep the balance sheet quiet.",
      "The price has moved less than the rest of this preview board.",
    ],
    metrics: [
      { label: "Market cap", value: "$3.42T", hint: "Illustrative" },
      { label: "P/E", value: "34.2", hint: "Trailing" },
      { label: "Revenue growth", value: "6%", hint: "Year over year" },
      { label: "Gross margin", value: "46.4%", hint: "Latest year" },
      { label: "Free cash flow", value: "$98.8B", hint: "Latest year" },
      { label: "Net cash", value: "$54.0B", hint: "Cash minus debt" },
    ],
    reasons: [
      "Quality and financial health, at 90 and 88, are why Apple still scores well when growth is ordinary.",
      "Value at 72 does not fight the story. Momentum at 62 is the soft pillar: the price is not confirming a new leg higher.",
      "The composite lands at 76 because two excellent pillars are averaged with three that are merely solid.",
    ],
    historyStart: 198.2,
  },
  MSFT: {
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    price: 428.15,
    change: 2.47,
    pillars: [74, 78, 91, 86, 66],
    notes: [
      "Cash flow yield is fair for a company with this much recurring revenue.",
      "Cloud and productivity growth is healthy, not explosive.",
      "Margins, retention, and returns on capital are the strength.",
      "The balance sheet can fund both buybacks and the AI buildout.",
      "Price momentum is positive, but quieter than the higher-scoring names.",
    ],
    metrics: [
      { label: "Market cap", value: "$3.18T", hint: "Illustrative" },
      { label: "P/E", value: "36.8", hint: "Trailing" },
      { label: "Revenue growth", value: "16%", hint: "Year over year" },
      { label: "Gross margin", value: "69.4%", hint: "Latest year" },
      { label: "Free cash flow", value: "$74.1B", hint: "Latest year" },
      { label: "Net cash", value: "$20.4B", hint: "Cash minus debt" },
    ],
    reasons: [
      "Quality at 91 is the anchor. The score is a statement about the franchise, not about a single product cycle.",
      "Growth at 78 and financial health at 86 support that quality. Neither one is a warning.",
      "Momentum at 66 keeps the average at 79. The operating record is ahead of the recent price trend.",
    ],
    historyStart: 372.5,
  },
  AVGO: {
    name: "Broadcom Inc.",
    exchange: "NASDAQ",
    price: 186.24,
    change: 3.12,
    pillars: [68, 86, 84, 80, 87],
    notes: [
      "The custom-silicon story is already in the multiple.",
      "Software plus AI networking is still growing at a high rate.",
      "Operating margins stayed wide through the VMware integration.",
      "Leverage is real, but cash generation covers it.",
      "The twelve-month trend is one of the stronger ones on this board.",
    ],
    metrics: [
      { label: "Market cap", value: "$872B", hint: "Illustrative" },
      { label: "P/E", value: "42.1", hint: "Trailing" },
      { label: "Revenue growth", value: "44%", hint: "Year over year" },
      { label: "Operating margin", value: "38.6%", hint: "Latest year" },
      { label: "Free cash flow", value: "$21.9B", hint: "Latest year" },
      { label: "Net debt", value: "$58.4B", hint: "Debt minus cash" },
    ],
    reasons: [
      "Growth and momentum, at 86 and 87, are what put Broadcom in the Strong band.",
      "Quality at 84 says the margin structure survived a large acquisition. Financial health at 80 says the debt is visible but serviced.",
      "Value at 68 is the offset. The average of the five pillars is 81.",
    ],
    historyStart: 124.6,
  },
  TSLA: {
    name: "Tesla, Inc.",
    exchange: "NASDAQ",
    price: 248.73,
    change: -4.28,
    pillars: [58, 82, 64, 70, 76],
    notes: [
      "The valuation assumes a software and robotics outcome that is not in current earnings.",
      "Vehicle and energy volumes can still grow from a large base.",
      "Margins have compressed, so quality is no longer a lead pillar.",
      "The balance sheet is fine. It is not the source of the score.",
      "The price swings enough that momentum is only moderately positive.",
    ],
    metrics: [
      { label: "Market cap", value: "$798B", hint: "Illustrative" },
      { label: "P/E", value: "78.4", hint: "Trailing" },
      { label: "Revenue growth", value: "8%", hint: "Year over year" },
      { label: "Operating margin", value: "7.2%", hint: "Latest year" },
      { label: "Free cash flow", value: "$3.6B", hint: "Latest year" },
      { label: "Net cash", value: "$27.1B", hint: "Cash minus debt" },
    ],
    reasons: [
      "Growth at 82 is the pillar doing the work. The other four sit between 58 and 76.",
      "Value at 58 is the drag. A high multiple and thinner auto margins do not support a higher composite.",
      "The average rounds to 70. That is a readable score, not a verdict that the range of outcomes is narrow.",
    ],
    historyStart: 214.9,
  },
};

function bandFor(score: number) {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Solid";
  if (score >= 60) return "Mixed";
  return "Weak";
}

function hash(value: string) {
  let h = 2166136261;
  for (const char of value) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function series(start: number, end: number, seed: number) {
  const count = 18;
  const points: number[] = [];
  let state = seed || 1;

  for (let index = 0; index < count; index += 1) {
    state = (Math.imul(state, 16807) + 11) % 2147483647;
    const progress = index / (count - 1);
    const noise = ((state % 1000) / 1000 - 0.5) * Math.abs(end - start) * 0.16;
    points.push(Number((start + (end - start) * progress + noise).toFixed(2)));
  }

  points[count - 1] = Number(end.toFixed(2));
  return points;
}

function noteFor(label: string, score: number) {
  if (score >= 85) return `${label} is a clear strength in this illustrative profile.`;
  if (score >= 70) return `${label} supports the composite without defining it.`;
  return `${label} is the constraint on the headline score.`;
}

export function parseTicker(value: string) {
  const ticker = value.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9.-]{0,9}$/.test(ticker)) return null;
  return ticker;
}

export function getStock(raw: string): StockAnalysis | null {
  const ticker = parseTicker(raw);
  if (!ticker) return null;

  const known = curated[ticker];
  if (known) {
    const pillars = labels.map((label, index) => ({
      label,
      score: known.pillars[index],
      note: known.notes[index],
    }));
    const score = Math.round(known.pillars.reduce((sum, value) => sum + value, 0) / known.pillars.length);

    return {
      ticker,
      name: known.name,
      exchange: known.exchange,
      price: known.price,
      change: known.change,
      score,
      band: bandFor(score),
      pillars,
      metrics: known.metrics,
      reasons: known.reasons,
      history: series(known.historyStart, known.price, hash(ticker)),
      curated: true,
    };
  }

  const seed = hash(ticker);
  const pillars = labels.map((label, index) => {
    const score = 58 + ((seed >> (index * 5)) % 34);
    return { label, score, note: noteFor(label, score) };
  });
  const score = Math.round(pillars.reduce((sum, pillar) => sum + pillar.score, 0) / pillars.length);
  const price = 18 + (seed % 460) + ((seed >> 8) % 100) / 100;
  const change = Number((((seed % 200) - 90) / 25).toFixed(2));

  return {
    ticker,
    name: `${ticker} Holdings`,
    exchange: "Illustrative",
    price: Number(price.toFixed(2)),
    change,
    score,
    band: bandFor(score),
    pillars,
    metrics: [
      { label: "Market cap", value: "—", hint: "Not in this preview" },
      { label: "P/E", value: "—", hint: "Not in this preview" },
      { label: "Revenue growth", value: "—", hint: "Not in this preview" },
      { label: "Gross margin", value: "—", hint: "Not in this preview" },
      { label: "Free cash flow", value: "—", hint: "Not in this preview" },
      { label: "Net cash", value: "—", hint: "Not in this preview" },
    ],
    reasons: [
      `${ticker} is not in the curated preview set. The score below is a stable illustration so the page layout can be reviewed.`,
      `The headline number is the rounded average of the five pillars: ${pillars.map((pillar) => pillar.score).join(", ")}.`,
      "Replace this profile with a live filing model before treating any figure as analysis.",
    ],
    history: series(price * 0.82, price, seed),
    curated: false,
  };
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatChange(change: number, price: number) {
  const prior = price - change;
  const percent = prior === 0 ? 0 : (change / prior) * 100;
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
}
