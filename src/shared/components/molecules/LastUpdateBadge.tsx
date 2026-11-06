import { Database, Loader2 } from 'lucide-react';
import { useLastUpdateQuery } from '@/features/telemetry/api/useLastUpdateQuery';
import {
  HOTSPOT_SOURCE_COLORS,
  HOTSPOT_SOURCE_LABELS,
  formatDateTime,
} from '@/features/telemetry/utils/hotspot-labels';

interface LastUpdateBadgeProps {
  isFetching: boolean;
}

export function LastUpdateBadge({ isFetching }: LastUpdateBadgeProps) {
  const { data, isError } = useLastUpdateQuery();

  const label = data?.last_updated_at
    ? `Base atualizada em ${formatDateTime(data.last_updated_at)}`
    : isError
      ? 'Última atualização indisponível'
      : data
        ? 'Base ainda sem dados'
        : 'Consultando última atualização...';

  return (
    <div className="flex flex-col gap-1.5 text-white/70 bg-black/60 backdrop-blur-xl px-3.5 py-2.5 rounded-2xl border border-white/10 shadow-lg">
      <div className="flex items-center gap-2">
        {isFetching ? (
          <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
        ) : (
          <Database className="w-4 h-4 text-red-400" />
        )}
        <span className="text-xs font-semibold tracking-wide">{label}</span>
      </div>
      {data?.sources.map((source) => (
        <div key={source.source} className="flex items-center gap-2 pl-6 text-[10px] text-white/50">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: HOTSPOT_SOURCE_COLORS[source.source] ?? '#ffffff' }}
          />
          <span>
            {HOTSPOT_SOURCE_LABELS[source.source] ?? source.source}: gravado em{' '}
            {formatDateTime(source.last_ingested_at)} · última detecção{' '}
            {formatDateTime(source.last_detected_at)}
          </span>
        </div>
      ))}
    </div>
  );
}
