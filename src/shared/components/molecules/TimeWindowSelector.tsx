import { Clock } from 'lucide-react';
import { useAtom } from 'jotai';
import { timeWindowHoursAtom } from '@/state/filters.atoms';

const TIME_FILTERS = [
  { label: '24h', value: 24 },
  { label: '48h', value: 48 },
  { label: '7 dias', value: 168 },
  { label: '30 dias', value: 720 },
];

interface TimeWindowSelectorProps {
  compact?: boolean;
  className?: string;
}

export function TimeWindowSelector({ compact = false, className = '' }: TimeWindowSelectorProps) {
  const [timeWindow, setTimeWindow] = useAtom(timeWindowHoursAtom);

  return (
    <div
      className={`flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl ${className}`}
    >
      {!compact && (
        <div className="px-2.5 flex items-center gap-2 text-white/50 border-r border-white/10 shrink-0">
          <Clock className="w-4 h-4 text-red-400" />
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">
            Janela
          </span>
        </div>
      )}
      <div className="flex gap-1">
        {TIME_FILTERS.map((filter) => {
          const isActive = timeWindow === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => setTimeWindow(filter.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                  : 'text-white/70 hover:bg-white/10 border border-transparent'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
