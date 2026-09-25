import { useAtom } from 'jotai';
import { selectedEventIdAtom } from '@/state/selection.atoms';
import { useFireEventDetailQuery } from '@/features/telemetry/api/useFireEventDetailQuery';
import {
  X,
  Flame,
  MapPin,
  Satellite,
  Clock,
  Zap,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import type { AnomalyPoint } from '@/features/telemetry/schemas/telemetry.schema';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

interface ConfidenceBadgeProps {
  confidence: string | null;
}

function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const c = confidence?.toLowerCase() ?? 'unknown';
  const styles: Record<string, string> = {
    high: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    nominal: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    low: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };
  const style = styles[c] ?? 'bg-white/10 text-white/50 border-white/10';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md border ${style}`}
    >
      {confidence ?? '—'}
    </span>
  );
}

function AnomalyRow({ anomaly, index }: { anomaly: AnomalyPoint; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left"
      >
        {/* Timeline Dot */}
        <div className="relative flex flex-col items-center shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/30" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-white/80 truncate">
              #{index + 1} — {anomaly.satellite ?? 'Desconhecido'}
            </span>
            <span className="text-[10px] text-white/40 shrink-0">
              {formatDateShort(anomaly.detected_at)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {anomaly.frp != null && (
              <span className="text-[10px] text-orange-400 font-mono">
                {anomaly.frp.toFixed(1)} MW
              </span>
            )}
            <ConfidenceBadge confidence={anomaly.confidence} />
          </div>
        </div>

        {/* Expand Icon */}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-white/30 shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white/30 shrink-0" />
        )}
      </button>

      {/* Expanded Details */}
      {open && (
        <div className="ml-8 mr-3 mb-2 p-3 rounded-lg bg-white/5 border border-white/5 space-y-1.5 text-[11px] text-white/60">
          <div className="flex justify-between">
            <span>Latitude</span>
            <span className="font-mono text-white/80">{anomaly.latitude.toFixed(5)}</span>
          </div>
          <div className="flex justify-between">
            <span>Longitude</span>
            <span className="font-mono text-white/80">{anomaly.longitude.toFixed(5)}</span>
          </div>
          {anomaly.source && (
            <div className="flex justify-between">
              <span>Fonte</span>
              <span className="text-white/80">{anomaly.source}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Detecção</span>
            <span className="text-white/80">{formatDateTime(anomaly.detected_at)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function FireEventDetailPanel() {
  const [selectedId, setSelectedId] = useAtom(selectedEventIdAtom);
  const { data: detail, isLoading, isError } = useFireEventDetailQuery();

  const sortedAnomalies = useMemo(() => {
    if (!detail?.anomalies) return [];
    return [...detail.anomalies].sort(
      (a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime(),
    );
  }, [detail?.anomalies]);

  const satelliteStats = useMemo(() => {
    if (!detail?.anomalies) return {};
    const counts: Record<string, number> = {};
    for (const a of detail.anomalies) {
      const sat = a.satellite ?? 'Desconhecido';
      counts[sat] = (counts[sat] ?? 0) + 1;
    }
    return counts;
  }, [detail?.anomalies]);

  const maxFrp = useMemo(() => {
    if (!detail?.anomalies) return 0;
    return Math.max(0, ...detail.anomalies.map((a) => a.frp ?? 0));
  }, [detail?.anomalies]);

  const avgFrp = useMemo(() => {
    if (!detail?.anomalies?.length) return 0;
    const frps = detail.anomalies.filter((a) => a.frp != null).map((a) => a.frp!);
    if (!frps.length) return 0;
    return frps.reduce((sum, v) => sum + v, 0) / frps.length;
  }, [detail?.anomalies]);

  const isOpen = selectedId !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSelectedId(null)}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col bg-neutral-950/80 backdrop-blur-3xl border-l border-white/10 shadow-2xl">
          {/* Header */}
          <div className="shrink-0 px-6 pt-6 pb-4 border-b border-white/5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <Flame className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Evento de Fogo</h2>
                  <p className="text-xs text-white/40 font-mono mt-0.5">
                    {selectedId?.slice(0, 8)}…
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
                <span className="text-sm text-white/40">Carregando detalhes…</span>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <ShieldAlert className="w-8 h-8 text-red-400" />
                <span className="text-sm text-white/40">Erro ao carregar dados</span>
              </div>
            )}

            {detail && !isLoading && (
              <>
                {/* Location Card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-white/50">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Localização
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {detail.municipality ?? 'Município desconhecido'}
                      {detail.state && (
                        <span className="text-white/40 font-normal"> — {detail.state}</span>
                      )}
                    </p>
                    <p className="text-xs text-white/40 font-mono mt-1">
                      {detail.centroid.latitude.toFixed(5)},{' '}
                      {detail.centroid.longitude.toFixed(5)}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Anomaly Count */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-1.5 text-red-400 mb-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Anomalias
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white">{detail.anomaly_count}</p>
                  </div>

                  {/* FRP Max */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-1.5 text-orange-400 mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        FRP Máx
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {maxFrp.toFixed(1)}{' '}
                      <span className="text-xs text-white/40 font-normal">MW</span>
                    </p>
                  </div>

                  {/* FRP Avg */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        FRP Méd
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {avgFrp.toFixed(1)}{' '}
                      <span className="text-xs text-white/40 font-normal">MW</span>
                    </p>
                  </div>

                  {/* Satellites */}
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-1.5 text-sky-400 mb-1">
                      <Satellite className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Satélites
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {Object.keys(satelliteStats).length}
                    </p>
                  </div>
                </div>

                {/* Satellite Breakdown */}
                {Object.keys(satelliteStats).length > 0 && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-white/50">
                      <Satellite className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Detecções por Satélite
                      </span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(satelliteStats)
                        .sort(([, a], [, b]) => b - a)
                        .map(([sat, count]) => {
                          const pct = (count / detail.anomaly_count) * 100;
                          return (
                            <div key={sat}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-white/70 font-medium">{sat}</span>
                                <span className="text-white/40 font-mono">{count}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Anomaly Timeline */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/50 px-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Linha do Tempo
                    </span>
                    <span className="text-[10px] text-white/30 ml-auto">
                      {sortedAnomalies.length} registros
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white/[0.03] border border-white/5 divide-y divide-white/5 overflow-hidden">
                    {sortedAnomalies.map((anomaly, idx) => (
                      <AnomalyRow key={anomaly.id} anomaly={anomaly} index={idx} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {detail && (
            <div className="shrink-0 px-6 py-4 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] text-white/30">
                <span>
                  Última detecção:{' '}
                  {sortedAnomalies[0] && timeAgo(sortedAnomalies[0].detected_at)}
                </span>
                <span className="font-mono">{selectedId?.slice(0, 12)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
