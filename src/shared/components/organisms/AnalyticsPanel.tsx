import { useAtom } from 'jotai';
import { BarChart3, Flame, Zap, Satellite, Globe, Download, X } from 'lucide-react';
import { useDerivedMetrics } from '@/features/dashboard/hooks/useDerivedMetrics';
import { useFireEventsQuery } from '@/features/telemetry/api/useFireEventsQuery';
import { activeViewAtom } from '@/state/navigation.atoms';
import { StatCard } from '../atoms/StatCard';
import { SatelliteBreakdown } from '../molecules/SatelliteBreakdown';
import { TimeWindowSelector } from '../molecules/TimeWindowSelector';

export function AnalyticsPanel() {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const { metrics } = useDerivedMetrics();
  const { data: fireEvents } = useFireEventsQuery();

  const isOpen = activeView === 'analytics';

  if (!isOpen) return null;

  // Group events by municipality/state for ranking
  const stateRanking = (fireEvents ?? []).reduce<Record<string, { count: number; totalFrp: number }>>(
    (acc, ev) => {
      const state = ev.state ?? 'Outros';
      if (!acc[state]) acc[state] = { count: 0, totalFrp: 0 };
      acc[state].count += 1;
      acc[state].totalFrp += ev.total_frp ?? 0;
      return acc;
    },
    {},
  );

  const sortedStates = Object.entries(stateRanking).sort(([, a], [, b]) => b.count - a.count);

  const satelliteCounts = (fireEvents ?? []).reduce<Record<string, number>>((acc, ev) => {
    ev.satellites?.forEach((sat) => {
      acc[sat] = (acc[sat] ?? 0) + 1;
    });
    return acc;
  }, {});

  return (
    <div className="absolute top-0 right-0 z-20 h-full w-full max-w-md bg-neutral-950/85 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Relatórios & Analytics</h3>
            <p className="text-xs text-white/50">Análise de intensidade radiativa e estatísticas</p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('map')}
          className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <TimeWindowSelector compact />

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total de Eventos"
            value={metrics.totalEvents}
            unit="focos"
            color="red"
            icon={<Flame className="w-4 h-4" />}
          />
          <StatCard
            label="FRP Máximo"
            value={metrics.maxFrp.toFixed(1)}
            unit="MW"
            color="orange"
            icon={<Zap className="w-4 h-4" />}
          />
          <StatCard
            label="Total de Anomalias"
            value={metrics.totalAnomalies}
            unit="pontos"
            color="amber"
            icon={<Globe className="w-4 h-4" />}
          />
          <StatCard
            label="Média Anomalias/Foco"
            value={
              metrics.totalEvents > 0
                ? (metrics.totalAnomalies / metrics.totalEvents).toFixed(1)
                : '0'
            }
            color="sky"
            icon={<Satellite className="w-4 h-4" />}
          />
        </div>

        {/* State Ranking */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-white/50">
            Estados Mais Afetados
          </h4>
          <div className="space-y-2">
            {sortedStates.slice(0, 5).map(([st, data]) => {
              const maxCount = sortedStates[0]?.[1].count ?? 1;
              const pct = (data.count / maxCount) * 100;
              return (
                <div key={st} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white font-bold">{st}</span>
                    <span className="text-white/50 font-mono">
                      {data.count} focos ({data.totalFrp.toFixed(0)} MW)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Satellite Breakdown */}
        <SatelliteBreakdown
          satelliteCounts={satelliteCounts}
          totalAnomalies={metrics.totalAnomalies}
        />

        {/* Export Data Button */}
        <button
          onClick={() => {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fireEvents, null, 2));
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute('href', dataStr);
            dlAnchorElem.setAttribute('download', `firetrack_export_${Date.now()}.json`);
            dlAnchorElem.click();
          }}
          className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Exportar Dados em JSON</span>
        </button>
      </div>
    </div>
  );
}
