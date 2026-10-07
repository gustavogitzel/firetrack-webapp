import { Flame, MapPin, Zap, Navigation, ChevronRight } from 'lucide-react';
import type { FireEventSummary } from '@/features/telemetry/schemas/telemetry.schema';
import { Badge } from '../atoms/Badge';

interface FireEventRowProps {
  event: FireEventSummary;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onFocusOnMap?: (lat: number, lng: number) => void;
}

export function FireEventRow({
  event,
  isSelected = false,
  onSelect,
  onFocusOnMap,
}: FireEventRowProps) {
  const isHighFrp = event.max_frp && event.max_frp > 80;

  return (
    <div
      onClick={() => onSelect(event.id)}
      className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col gap-2.5 ${
        isSelected
          ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
          : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
      }`}
    >
      {/* Header Line */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`p-1.5 rounded-xl border shrink-0 ${
              isHighFrp
                ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                : 'bg-orange-500/15 text-orange-400 border-orange-500/20'
            }`}
          >
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white tracking-tight truncate">
              {event.municipality ?? 'Município Desconhecido'}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <MapPin className="w-3 h-3 text-red-400/80 shrink-0" />
              <span className="truncate">{event.state ?? 'BR'}</span>
            </div>
          </div>
        </div>

        <Badge variant={event.status === 'active' ? (isHighFrp ? 'critical' : 'active') : event.status} pulse={event.status === 'active'}>
          {event.status === 'active' ? (isHighFrp ? 'Crítico' : 'Ativo') : event.status}
        </Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-black/30 border border-white/5">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
            FRP Máx
          </span>
          <span className="text-sm font-extrabold text-orange-400 font-mono flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {event.max_frp ? event.max_frp.toFixed(1) : '—'} <span className="text-[10px] text-white/40 font-normal">MW</span>
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
            Anomalias
          </span>
          <span className="text-sm font-extrabold text-white font-mono">
            {event.anomaly_count}
          </span>
        </div>
      </div>

      {/* Footer / Quick Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
        <div className="flex gap-1 overflow-hidden">
          {event.satellites?.slice(0, 2).map((sat) => (
            <span
              key={sat}
              className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium text-white/50 bg-white/5 border border-white/5"
            >
              {sat}
            </span>
          ))}
          {event.satellites && event.satellites.length > 2 && (
            <span className="text-[9px] text-white/40 font-mono flex items-center">
              +{event.satellites.length - 2}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onFocusOnMap && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFocusOnMap(event.centroid.latitude, event.centroid.longitude);
              }}
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="Centralizar no Mapa"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}
