import { useAtom } from 'jotai';
import { timeWindowHoursAtom } from '@/state/filters.atoms';
import { useDerivedMetrics } from '@/features/dashboard/hooks/useDerivedMetrics';
import { Flame, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { FireTrackLogo } from '@/App';

const TIME_FILTERS = [
  { label: '24h', value: 24 },
  { label: '48h', value: 48 },
  { label: '7 dias', value: 168 }, // 24 * 7
  { label: '30 dias', value: 720 }, // 24 * 30
];

export function MapOverlay() {
  const [timeWindow, setTimeWindow] = useAtom(timeWindowHoursAtom);
  const { metrics, isFetching } = useDerivedMetrics();

  return (
    <div className="absolute top-0 left-0 z-10 w-full h-full pointer-events-none p-4 md:p-8 flex flex-col justify-between">

      {/* Top Section: Logo & Time Controls */}
      <div className="flex justify-between items-start pointer-events-none">

        {/* Left Side: Logo */}
        <div className="pointer-events-auto">
          <FireTrackLogo size="sm" />
        </div>

        {/* Right Side: Time Controls (Glassmorphic) */}
        <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl">
          <div className="px-3 flex items-center gap-2 text-white/50 border-r border-white/10">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Janela</span>
          </div>
          {TIME_FILTERS.map((filter) => {
            const isActive = timeWindow === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => setTimeWindow(filter.value)}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${isActive
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'text-white/70 hover:bg-white/10 border border-transparent'
                  }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: KPI Dashboard */}
      <div className="pointer-events-auto max-w-sm w-full space-y-4">

        {/* Loading Indicator */}
        {isFetching && (
          <div className="flex items-center gap-2 text-white/50 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl w-max border border-white/10 shadow-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-semibold tracking-wider">Sincronizando satélites...</span>
          </div>
        )}

        <div className="p-6 rounded-[2rem] bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col gap-6">

          <div>
            <h2 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Visão Geral</h2>
            <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
              {metrics.totalEvents}
              <span className="text-lg font-semibold text-white/40 tracking-normal">eventos</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* Anomalias */}
            <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 text-red-400">
                <Flame className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Anomalias</span>
              </div>
              <div className="text-xl font-bold text-white">
                {metrics.totalAnomalies}
              </div>
            </div>

            {/* FRP Max */}
            <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2 text-orange-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">FRP Máx</span>
              </div>
              <div className="text-xl font-bold text-white">
                {metrics.maxFrp.toFixed(1)} <span className="text-xs text-white/40">MW</span>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
