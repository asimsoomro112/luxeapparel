'use client';

interface MiniChartProps {
  data: number[];
  height?: number;
  color?: string;
  type?: 'bar' | 'line';
}

export default function MiniChart({ data, height = 120, color = 'var(--color-accent)', type = 'bar' }: MiniChartProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const barWidth = 100 / data.length;

  if (type === 'line') {
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (v / max) * 90;
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,100 ${points} 100,100`;

    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#lineGrad)" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
      {data.map((v, i) => {
        const barH = (v / max) * 85;
        const x = i * barWidth + barWidth * 0.15;
        const w = barWidth * 0.7;
        return (
          <rect
            key={i}
            x={x}
            y={100 - barH}
            width={w}
            height={barH}
            rx="1"
            fill={color}
            opacity={0.6 + (i / data.length) * 0.4}
          />
        );
      })}
    </svg>
  );
}
