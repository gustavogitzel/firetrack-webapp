import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Play, Pause, RotateCcw, Calendar } from 'lucide-react';
import { timeWindowHoursAtom } from '@/state/filters.atoms';

const PRESET_HOURS = [6, 12, 24, 48, 72, 168, 720];

export function TimelineScroller() {
  const [timeWindow, setTimeWindow] = useAtom(timeWindowHoursAtom);
  const [isPlaying, setIsPlaying] = useState(false);

  // Play/Pause Time Lapse scrubber
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeWindow((current) => {
        const currentIndex = PRESET_HOURS.indexOf(current);
        if (currentIndex === -1 || currentIndex >= PRESET_HOURS.length - 1) {
          return PRESET_HOURS[0];
        }
        return PRESET_HOURS[currentIndex + 1];
      });
    }, 1600);

    return () => clearInterval(interval);
  }, [isPlaying, setTimeWindow]);

  const formatHoursText = (h: number) => {
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    return `${days}d`;
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4 pointer-events-auto select-none">
      <div className="p-3.5 rounded-[2rem] bg-black/70 backdrop-blur-2xl border border-white/15 shadow-2xl flex flex-col gap-2.5 transition-all">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs px-2">
          <div className="flex items-center gap-2 text-white/70">
            <Calendar className="w-4 h-4 text-red-400" />
            <span className="font-bold tracking-tight">Evolução Temporal</span>
            <span className="text-[10px] text-white/40 font-mono">
              (Últimas {formatHoursText(timeWindow)})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pausar Time-Lapse</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Iniciar Time-Lapse</span>
                </>
              )}
            </button>

            <button
              onClick={() => setTimeWindow(24)}
              title="Resetar para 24h"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/50 hover:text-white border border-white/5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Timeline Slider Input */}
        <div className="px-2">
          <input
            type="range"
            min={0}
            max={PRESET_HOURS.length - 1}
            step={1}
            value={PRESET_HOURS.indexOf(timeWindow) !== -1 ? PRESET_HOURS.indexOf(timeWindow) : 2}
            onChange={(e) => {
              const idx = Number(e.target.value);
              setTimeWindow(PRESET_HOURS[idx]);
            }}
            className="w-full accent-red-500 h-2 bg-white/10 rounded-lg cursor-pointer appearance-none focus:outline-none"
          />
        </div>

        {/* Ticks Label */}
        <div className="flex justify-between text-[10px] font-mono font-bold text-white/40 px-2">
          {PRESET_HOURS.map((h) => (
            <button
              key={h}
              onClick={() => setTimeWindow(h)}
              className={`hover:text-white transition-colors cursor-pointer ${
                timeWindow === h ? 'text-red-400 font-extrabold scale-110' : ''
              }`}
            >
              {formatHoursText(h)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
