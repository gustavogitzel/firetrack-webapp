import { useDerivedMetrics } from '@/features/dashboard/hooks/useDerivedMetrics';
import { Flame, AlertTriangle, Loader2 } from 'lucide-react';
import { TimeWindowSelector } from '../molecules/TimeWindowSelector';
import { StatCard } from '../atoms/StatCard';

export function MapOverlay() {
  const { metrics, isFetching } = useDerivedMetrics();

  return (
    <div className="absolute top-0 left-0 z-10 w-full h-full pointer-events-none p-4 md:p-6 flex flex-col justify-between">
      {/* Top Floating Controls */}
      <div className="flex justify-between items-start pointer-events-none">
        {/* Left Side: Sync indicator if fetching */}
        <div className="pointer-events-auto">
          {isFetching && (
            <div className="flex items-center gap-2 text-white/70 bg-black/60 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-white/10 shadow-lg">
              <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
              <span className="text-xs font-semibold tracking-wider">
                Atualizando telemetria orbital...
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Time Filter Selector */}
        <div className="pointer-events-auto">
          <TimeWindowSelector />
        </div>
      </div>

      {/* Bottom Floating KPI Dashboard */}
      <div className="pointer-events-auto max-w-sm w-full space-y-3">
        <div className="p-4 rounded-[2rem] bg-black/50 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/50 block">
              Focos no Período
            </span>
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2 mt-0.5">
              {metrics.totalEvents}
              <span className="text-sm font-semibold text-white/40 tracking-normal">
                eventos de incêndio
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              label="Anomalias"
              value={metrics.totalAnomalies}
              color="red"
              icon={<Flame className="w-4 h-4" />}
            />
            <StatCard
              label="FRP Máx"
              value={metrics.maxFrp.toFixed(1)}
              unit="MW"
              color="orange"
              icon={<AlertTriangle className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
