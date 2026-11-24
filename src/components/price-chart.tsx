type PriceChartProps = {
  points: number[];
  ticker: string;
};

export function PriceChart({ points, ticker }: PriceChartProps) {
  const width = 720;
  const height = 220;
  const low = Math.min(...points);
  const high = Math.max(...points);
  const span = high - low || 1;
  const coordinates = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - 16 - ((point - low) / span) * (height - 32);
    return [x, y] as const;
  });
  const line = coordinates
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const fillId = `price-fill-${ticker}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full sm:h-56" role="img" aria-label={`${ticker} illustrative price path`}>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d7f25c" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#d7f25c" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((level) => (
        <line
          key={level}
          x1="0"
          x2={width}
          y1={height * level}
          y2={height * level}
          stroke="rgba(244,245,247,0.08)"
        />
      ))}
      <path d={area} fill={`url(#${fillId})`} />
      <path d={line} fill="none" stroke="#d7f25c" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
