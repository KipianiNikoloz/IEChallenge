import React from "react";

type Point = { x: number; y: number; id: string; belowCutoff: boolean };

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function cutoffY(x: number): number {
  // Slightly steeper sigmoid for a clearer S-curve; lift it so the cutoff sits higher.
  const y = sigmoid(1.2 * x) + 0.15;
  return Math.min(1, y);
}

type ScatterProps = {
  points: Point[];
  width?: number;
  height?: number;
};

export function UtilityScatter({ points, width = 360, height = 220 }: ScatterProps) {
  const padding = 24;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(0, ...xs, -4);
  const maxX = Math.max(...xs, 4);
  const minY = Math.min(0, ...ys, -0.5);
  const maxY = Math.max(...ys, 1.5);

  const scaleX = (x: number) => {
    if (maxX === minX) return width / 2;
    return padding + ((x - minX) / (maxX - minX)) * (width - padding * 2);
  };
  const scaleY = (y: number) => {
    if (maxY === minY) return height / 2;
    return height - padding - ((y - minY) / (maxY - minY)) * (height - padding * 2);
  };

  const curvePoints = [];
  for (let x = minX; x <= maxX; x += (maxX - minX) / 40) {
    const y = cutoffY(x);
    curvePoints.push(`${scaleX(x)},${scaleY(y)}`);
  }

  return (
    <svg width={width} height={height} role="img" aria-label="Utility scatter plot">
      <rect x={0} y={0} width={width} height={height} fill="var(--bg)" rx={10} />
      <line
        x1={padding}
        y1={scaleY(0)}
        x2={width - padding}
        y2={scaleY(0)}
        stroke="var(--border)"
        strokeDasharray="4 4"
      />
      <line
        x1={scaleX(0)}
        y1={padding}
        x2={scaleX(0)}
        y2={height - padding}
        stroke="var(--border)"
        strokeDasharray="4 4"
      />
      <polyline
        fill="none"
        stroke="var(--muted)"
        strokeWidth={1.5}
        points={curvePoints.join(" ")}
      />
      {points.map((p) => (
        <circle
          key={p.id}
          cx={scaleX(p.x)}
          cy={scaleY(p.y)}
          r={6}
          fill={p.belowCutoff ? "var(--accent)" : "var(--text)"}
          opacity={0.9}
        />
      ))}
    </svg>
  );
}

type HistogramBin = { label: string; count: number };

type HistogramProps = {
  bins: HistogramBin[];
  width?: number;
  height?: number;
};

export function UtilityHistogram({ bins, width = 360, height = 220 }: HistogramProps) {
  const padding = 24;
  const maxCount = Math.max(...bins.map((b) => b.count), 1);
  const barWidth = (width - padding * 2) / bins.length;

  return (
    <svg width={width} height={height} role="img" aria-label="Utility histogram">
      <rect x={0} y={0} width={width} height={height} fill="var(--bg)" rx={10} />
      {bins.map((bin, idx) => {
        const barHeight = ((height - padding * 2) * bin.count) / maxCount;
        const x = padding + idx * barWidth;
        const y = height - padding - barHeight;
        const isRisk = bin.label.includes("<1");
        return (
          <g key={bin.label}>
            <rect
              x={x + 4}
              width={barWidth - 8}
              y={y}
              height={barHeight}
              fill={isRisk ? "var(--accent)" : "var(--text)"}
              opacity={0.85}
              rx={4}
            />
            <text
              x={x + barWidth / 2}
              y={height - padding + 14}
              textAnchor="middle"
              fontSize="10"
              fill="var(--muted)"
            >
              {bin.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function buildHistogram(distances: number[]): { label: string; count: number }[] {
  if (distances.length === 0) return [];
  const max = Math.max(...distances, 2);
  const step = Math.max(0.5, Math.round(max * 2) / 10);
  const bins: { label: string; min: number; max: number; count: number }[] = [];
  for (let start = 0; start < max + step; start += step) {
    bins.push({
      label: `${start.toFixed(1)}-${(start + step).toFixed(1)}`,
      min: start,
      max: start + step,
      count: 0,
    });
  }
  distances.forEach((d) => {
    const bin = bins.find((b) => d >= b.min && d < b.max) ?? bins[bins.length - 1];
    bin.count += 1;
  });
  // Mark risk bin(s) with label hints
  return bins.map((b) => ({
    label: b.max <= 1 ? `<1` : b.label,
    count: b.count,
  }));
}
