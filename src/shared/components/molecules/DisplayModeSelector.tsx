import { Layers } from 'lucide-react';
import { useAtom, useAtomValue } from 'jotai';
import {
  HOTSPOTS_MAX_HOURS,
  mapDisplayModeAtom,
  timeWindowHoursAtom,
} from '@/state/filters.atoms';
import type { MapDisplayMode } from '@/state/filters.atoms';

const MODES: { label: string; value: MapDisplayMode }[] = [
  { label: 'Eventos', value: 'events' },
  { label: 'Focos', value: 'hotspots' },
];

export function DisplayModeSelector() {
  const [mode, setMode] = useAtom(mapDisplayModeAtom);
  const hours = useAtomValue(timeWindowHoursAtom);
  const isCapped = mode === 'hotspots' && hours > HOTSPOTS_MAX_HOURS;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-xl">
        <div className="px-2.5 flex items-center gap-2 text-white/50 border-r border-white/10 shrink-0">
          <Layers className="w-4 h-4 text-red-400" />
          <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">
            Exibir
          </span>
        </div>
        <div className="flex gap-1">
          {MODES.map((option) => {
            const isActive = mode === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setMode(option.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                    : 'text-white/70 hover:bg-white/10 border border-transparent'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      {isCapped && (
        <span className="px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-[10px] font-semibold text-white/60">
          Focos individuais limitados às últimas {HOTSPOTS_MAX_HOURS}h
        </span>
      )}
    </div>
  );
}
