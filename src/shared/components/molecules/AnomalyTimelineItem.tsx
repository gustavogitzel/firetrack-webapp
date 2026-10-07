import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { AnomalyPoint } from '@/features/telemetry/schemas/telemetry.schema';
import { Badge } from '../atoms/Badge';

interface AnomalyTimelineItemProps {
  anomaly: AnomalyPoint;
  index: number;
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

export function AnomalyTimelineItem({ anomaly, index }: AnomalyTimelineItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left select-none"
      >
        {/* Timeline Indicator */}
        <div className="relative flex flex-col items-center shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-500/20" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-white/90 truncate">
              #{index + 1} — {anomaly.satellite ?? 'Satélite'}
            </span>
            <span className="text-[10px] font-mono text-white/40 shrink-0">
              {formatDateShort(anomaly.detected_at)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {anomaly.frp != null && (
              <span className="text-[11px] text-orange-400 font-mono font-bold">
                {anomaly.frp.toFixed(1)} MW
              </span>
            )}
            <Badge
              variant={
                anomaly.confidence?.toLowerCase() === 'high'
                  ? 'high'
                  : anomaly.confidence?.toLowerCase() === 'nominal'
                  ? 'nominal'
                  : 'neutral'
              }
            >
              {anomaly.confidence ?? 'Desconhecido'}
            </Badge>
          </div>
        </div>

        {/* Chevron */}
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-white/30 shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-white/30 shrink-0" />
        )}
      </button>

      {/* Expanded view */}
      {open && (
        <div className="ml-8 mr-3 my-1 p-3 rounded-xl bg-white/[0.04] border border-white/5 space-y-1.5 text-xs text-white/70">
          <div className="flex justify-between">
            <span className="text-white/40">Latitude</span>
            <span className="font-mono text-white">{anomaly.latitude.toFixed(5)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Longitude</span>
            <span className="font-mono text-white">{anomaly.longitude.toFixed(5)}</span>
          </div>
          {anomaly.source && (
            <div className="flex justify-between">
              <span className="text-white/40">Sensor/Fonte</span>
              <span className="text-white font-medium">{anomaly.source}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-white/40">Horário exato</span>
            <span className="text-white">{formatDateTime(anomaly.detected_at)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
