import { Satellite } from 'lucide-react';
import { ProgressBar } from '../atoms/ProgressBar';

interface SatelliteBreakdownProps {
  satelliteCounts: Record<string, number>;
  totalAnomalies: number;
}

export function SatelliteBreakdown({ satelliteCounts, totalAnomalies }: SatelliteBreakdownProps) {
  const entries = Object.entries(satelliteCounts).sort(([, a], [, b]) => b - a);

  if (entries.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-3">
      <div className="flex items-center gap-2 text-white/50">
        <Satellite className="w-4 h-4 text-sky-400" />
        <span className="text-xs font-extrabold uppercase tracking-widest">
          Detecção por Satélite
        </span>
      </div>

      <div className="space-y-2.5">
        {entries.map(([sat, count]) => {
          const pct = totalAnomalies > 0 ? (count / totalAnomalies) * 100 : 0;
          return (
            <div key={sat} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-white/80">{sat}</span>
                <span className="text-white/40 font-mono">
                  {count} ({pct.toFixed(0)}%)
                </span>
              </div>
              <ProgressBar progress={pct} color="sky" height="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
