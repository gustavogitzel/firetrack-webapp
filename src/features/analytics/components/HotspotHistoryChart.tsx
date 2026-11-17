import { useEffect, useRef, useState } from 'react';
import type { HotspotSeriesPoint } from '../schemas/analytics.schema';
import {
  HOTSPOT_SERIES_COLOR,
  formatCompact,
  formatPeriod,
  niceMax,
  parsePeriod,
  shortPeriodLabel,
} from '../utils/analytics-labels';

interface HotspotHistoryChartProps {
  points: HotspotSeriesPoint[];
  granularity: 'month' | 'year';
}

const HEIGHT = 190;
const MARGIN = { top: 10, right: 4, bottom: 22, left: 40 };
const MIN_LABEL_SPACING = 30;

function isPartial(period: string, granularity: 'month' | 'year'): boolean {
  const { year, month } = parsePeriod(period);
  const now = new Date();
  if (granularity === 'year') return year === now.getFullYear();
  return year === now.getFullYear() && month === now.getMonth() + 1;
}

function barPath(x: number, y: number, width: number, height: number): string {
  const r = Math.min(4, width / 2, height);
  const bottom = y + height;
  return `M${x},${bottom} V${y + r} Q${x},${y} ${x + r},${y} H${x + width - r} Q${x + width},${y} ${x + width},${y + r} V${bottom} Z`;
}

export function HotspotHistoryChart({ points, granularity }: HotspotHistoryChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const maxValue = niceMax(Math.max(...points.map((p) => p.hotspots), 0));
  const ticks = [0, maxValue / 2, maxValue];
  const band = points.length > 0 ? plotWidth / points.length : 0;
  const barWidth = Math.max(Math.min(band - 2, 28), 1);
  const labelEvery = Math.max(Math.ceil(MIN_LABEL_SPACING / Math.max(band, 1)), 1);
  const y = (value: number) => MARGIN.top + plotHeight - (value / maxValue) * plotHeight;

  const hoveredPoint = hovered != null ? points[hovered] : null;
  const tooltipLeft = hovered != null ? MARGIN.left + band * (hovered + 0.5) : 0;

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: HEIGHT }}>
      {width > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label="Focos de calor por período" onMouseLeave={() => setHovered(null)}>
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={width - MARGIN.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke={tick === 0 ? '#383835' : '#2c2c2a'}
                strokeWidth={1}
              />
              <text
                x={MARGIN.left - 6}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-white/40 text-[9px] font-semibold"
              >
                {formatCompact(tick)}
              </text>
            </g>
          ))}

          {points.map((point, index) => {
            const x = MARGIN.left + band * index + (band - barWidth) / 2;
            const top = y(point.hotspots);
            const height = MARGIN.top + plotHeight - top;
            const partial = isPartial(point.period, granularity);
            const dimmed = hovered != null && hovered !== index;
            return (
              <g key={point.period}>
                {point.hotspots > 0 && (
                  <path
                    d={barPath(x, top, barWidth, height)}
                    fill={HOTSPOT_SERIES_COLOR}
                    fillOpacity={(partial ? 0.45 : 1) * (dimmed ? 0.45 : 1)}
                  />
                )}
                {index % labelEvery === 0 && (
                  <text
                    x={MARGIN.left + band * (index + 0.5)}
                    y={HEIGHT - 6}
                    textAnchor="middle"
                    className="fill-white/40 text-[9px] font-semibold"
                  >
                    {shortPeriodLabel(point.period, granularity)}
                  </text>
                )}
                <rect
                  x={MARGIN.left + band * index}
                  y={MARGIN.top}
                  width={band}
                  height={plotHeight}
                  fill="transparent"
                  onMouseEnter={() => setHovered(index)}
                />
              </g>
            );
          })}
        </svg>
      )}

      {hoveredPoint && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-neutral-900 px-2.5 py-1.5 shadow-xl"
          style={{ left: Math.min(Math.max(tooltipLeft, 60), width - 60) }}
        >
          <span className="block text-[10px] font-semibold text-white/50">
            {formatPeriod(hoveredPoint.period, granularity)}
            {isPartial(hoveredPoint.period, granularity) && ' · parcial'}
          </span>
          <span className="block text-xs font-bold text-white">
            {hoveredPoint.hotspots.toLocaleString('pt-BR')} focos
          </span>
        </div>
      )}
    </div>
  );
}
