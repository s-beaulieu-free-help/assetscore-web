"use client";

import { useMemo, useRef, useState } from "react";

type PricePoint = {
  date: string;
  price: number;
};

type PriceChartProps = {
  points: PricePoint[];
  ticker: string;
};

const WIDTH = 760;
const HEIGHT = 320;
const PAD = { left: 68, right: 16, top: 16, bottom: 36 };

const RANGES = [
  { id: "1M", label: "1M", days: 31 },
  { id: "3M", label: "3M", days: 93 },
  { id: "6M", label: "6M", days: 186 },
  { id: "1Y", label: "1Y", days: 366 },
  { id: "ALL", label: "All", days: null },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseDay(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function formatDay(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(parseDay(isoDate)));
}

function formatAxisDay(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(parseDay(isoDate)));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function niceStep(rough: number) {
  const power = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / power;
  const nice = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return nice * power;
}

function priceTicks(low: number, high: number) {
  const span = Math.max(high - low, high * 0.02 || 1);
  const step = niceStep(span / 4);
  const start = Math.floor(low / step) * step;
  const end = Math.ceil(high / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step * 0.01; value += step) {
    ticks.push(Number(value.toFixed(6)));
  }
  return { ticks, start, end };
}

function dateTicks(points: PricePoint[]) {
  const count = points.length < 8 ? points.length : 5;
  if (count <= 1) return points.map((_, index) => index);
  return Array.from({ length: count }, (_, index) => Math.round((index / (count - 1)) * (points.length - 1)));
}

export function PriceChart({ points, ticker }: PriceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [range, setRange] = useState<RangeId>("ALL");
  const [custom, setCustom] = useState<[number, number] | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [drag, setDrag] = useState<{ start: number; end: number } | null>(null);

  const windowed = useMemo(() => {
    if (custom) {
      const [from, to] = custom;
      return points.slice(Math.min(from, to), Math.max(from, to) + 1);
    }
    const selected = RANGES.find((item) => item.id === range);
    if (!selected?.days || points.length === 0) return points;
    const last = parseDay(points[points.length - 1].date);
    const cutoff = last - selected.days * 86_400_000;
    const start = points.findIndex((point) => parseDay(point.date) >= cutoff);
    return points.slice(start < 0 ? 0 : start);
  }, [custom, points, range]);

  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const low = Math.min(...windowed.map((point) => point.price));
  const high = Math.max(...windowed.map((point) => point.price));
  const scale = priceTicks(low, high);
  const yTicks = scale.ticks;
  const xTicks = dateTicks(windowed);
  const ySpan = scale.end - scale.start || 1;

  const xFor = (index: number) =>
    PAD.left + (windowed.length <= 1 ? plotWidth / 2 : (index / (windowed.length - 1)) * plotWidth);
  const yFor = (price: number) => PAD.top + (1 - (price - scale.start) / ySpan) * plotHeight;

  const line = windowed
    .map((point, index) => `${index === 0 ? "M" : "L"}${xFor(index).toFixed(1)},${yFor(point.price).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${xFor(windowed.length - 1).toFixed(1)},${PAD.top + plotHeight} L${PAD.left},${PAD.top + plotHeight} Z`;
  const fillId = `price-fill-${ticker}`;
  const hovered = hover == null ? null : windowed[hover];

  function indexAt(clientX: number) {
    const svg = svgRef.current;
    if (!svg || windowed.length === 0) return 0;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * WIDTH;
    const ratio = clamp((x - PAD.left) / plotWidth, 0, 1);
    return Math.round(ratio * (windowed.length - 1));
  }

  function absoluteIndex(localIndex: number) {
    const first = windowed[0];
    const offset = points.findIndex((point) => point.date === first?.date);
    return Math.max(0, offset) + localIndex;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Chart zoom">
          {RANGES.map((item) => {
            const active = custom == null && range === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setCustom(null);
                  setRange(item.id);
                  setHover(null);
                }}
                className={`h-8 rounded-full px-3 font-mono text-[11px] tracking-[0.12em] uppercase ${
                  active
                    ? "bg-accent text-ink"
                    : "border border-line text-muted transition-colors hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <p className="font-mono text-xs text-muted tabular-nums">
          {hovered
            ? `${formatDay(hovered.date)} · ${formatPrice(hovered.price)}`
            : `${formatDay(windowed[0].date)} – ${formatDay(windowed[windowed.length - 1].date)}`}
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-72 w-full touch-none sm:h-80"
        role="img"
        aria-label={`${ticker} closing prices with price and date scales`}
        onPointerDown={(event) => {
          const index = indexAt(event.clientX);
          event.currentTarget.setPointerCapture(event.pointerId);
          setDrag({ start: index, end: index });
        }}
        onPointerMove={(event) => {
          const index = indexAt(event.clientX);
          setHover(index);
          if (drag) setDrag({ start: drag.start, end: index });
        }}
        onPointerUp={() => {
          if (!drag) return;
          const from = Math.min(drag.start, drag.end);
          const to = Math.max(drag.start, drag.end);
          if (to - from >= 4) {
            setCustom([absoluteIndex(from), absoluteIndex(to)]);
            setHover(null);
          }
          setDrag(null);
        }}
        onPointerLeave={() => {
          if (!drag) setHover(null);
        }}
        onDoubleClick={() => {
          setCustom(null);
          setRange("ALL");
          setHover(null);
        }}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d7f25c" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#d7f25c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = yFor(tick);
          return (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={y}
                y2={y}
                stroke="rgba(244,245,247,0.1)"
              />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fill="#8e95a1" fontSize="11" fontFamily="ui-monospace, monospace">
                {formatPrice(tick)}
              </text>
            </g>
          );
        })}

        {xTicks.map((index) => {
          const x = xFor(index);
          const point = windowed[index];
          return (
            <g key={`${point.date}-${index}`}>
              <line
                x1={x}
                x2={x}
                y1={PAD.top}
                y2={PAD.top + plotHeight}
                stroke="rgba(244,245,247,0.08)"
              />
              <text
                x={x}
                y={HEIGHT - 12}
                textAnchor="middle"
                fill="#8e95a1"
                fontSize="11"
                fontFamily="ui-monospace, monospace"
              >
                {formatAxisDay(point.date)}
              </text>
            </g>
          );
        })}

        <line
          x1={PAD.left}
          x2={PAD.left}
          y1={PAD.top}
          y2={PAD.top + plotHeight}
          stroke="rgba(244,245,247,0.18)"
        />
        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={PAD.top + plotHeight}
          y2={PAD.top + plotHeight}
          stroke="rgba(244,245,247,0.18)"
        />

        <path d={area} fill={`url(#${fillId})`} />
        <path d={line} fill="none" stroke="#d7f25c" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />

        {hovered && hover != null ? (
          <g>
            <line
              x1={xFor(hover)}
              x2={xFor(hover)}
              y1={PAD.top}
              y2={PAD.top + plotHeight}
              stroke="#4fd6ae"
              strokeDasharray="3 3"
            />
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={yFor(hovered.price)}
              y2={yFor(hovered.price)}
              stroke="#4fd6ae"
              strokeDasharray="3 3"
            />
            <circle cx={xFor(hover)} cy={yFor(hovered.price)} r="3.5" fill="#d7f25c" />
          </g>
        ) : null}

        {drag && drag.start !== drag.end ? (
          <rect
            x={Math.min(xFor(drag.start), xFor(drag.end))}
            y={PAD.top}
            width={Math.abs(xFor(drag.end) - xFor(drag.start))}
            height={plotHeight}
            fill="rgba(215,242,92,0.12)"
            stroke="#d7f25c"
          />
        ) : null}
      </svg>
      <p className="mt-2 text-xs text-muted">Drag across the chart to zoom. Double-click to reset.</p>
    </div>
  );
}
