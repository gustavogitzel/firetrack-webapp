import { useAtom } from 'jotai';
import { useMemo } from 'react';
import {
  AlertTriangle,
  Volume2,
  VolumeX,
  Flame,
  X,
  Check,
  Zap,
} from 'lucide-react';
import { watchZoneConfigAtom } from '@/state/alerts.atoms';
import { activeViewAtom } from '@/state/navigation.atoms';
import { selectedEventIdAtom, mapFlyToTargetAtom } from '@/state/selection.atoms';
import { useFireEventsQuery } from '@/features/telemetry/api/useFireEventsQuery';
import { Badge } from '../atoms/Badge';

const ALL_STATES = ['PA', 'MT', 'AM', 'RO', 'MA', 'MS', 'BA', 'TO', 'GO'];

export function AlertsHubPanel() {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const [watchConfig, setWatchConfig] = useAtom(watchZoneConfigAtom);
  const [, setSelectedId] = useAtom(selectedEventIdAtom);
  const [, setFlyTo] = useAtom(mapFlyToTargetAtom);

  const { data: fireEvents } = useFireEventsQuery();

  const isOpen = activeView === 'alerts';

  // Filter events matching watched zones or critical threshold
  const criticalAlerts = useMemo(() => {
    if (!fireEvents) return [];
    return fireEvents.filter((ev) => {
      const isWatchedState = ev.state ? watchConfig.states.includes(ev.state) : false;
      const isHighFrp = (ev.max_frp ?? 0) >= watchConfig.minFrpThreshold;
      return isWatchedState || isHighFrp;
    });
  }, [fireEvents, watchConfig]);

  // Audio alert trigger using Web Audio API synthesis
  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  };

  if (!isOpen) return null;

  const toggleState = (st: string) => {
    const exists = watchConfig.states.includes(st);
    setWatchConfig({
      ...watchConfig,
      states: exists
        ? watchConfig.states.filter((s) => s !== st)
        : [...watchConfig.states, st],
    });
  };

  return (
    <div className="absolute top-0 right-0 z-20 h-full w-full max-w-md bg-neutral-950/85 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col select-none">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Central de Alertas</h3>
            <p className="text-xs text-white/50">Zonas de observação & emergência</p>
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
        {/* Watch Zones Configuration */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">
                Zonas de Observação por Estado (Watch Zones)
              </span>
              <span className="text-[10px] text-white/40 block mt-0.5">
                Selecione os estados monitorados para alertas prioritários.
              </span>
            </div>

            <button
              onClick={() => {
                const nextAudio = !watchConfig.audioEnabled;
                setWatchConfig({ ...watchConfig, audioEnabled: nextAudio });
                if (nextAudio) playAlertSound();
              }}
              title="Sons de Alerta"
              className={`p-2 rounded-xl border transition-all ${
                watchConfig.audioEnabled
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-white/5 text-white/40 border-white/10'
              }`}
            >
              {watchConfig.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ALL_STATES.map((st) => {
              const active = watchConfig.states.includes(st);
              return (
                <button
                  key={st}
                  onClick={() => toggleState(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    active
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                      : 'bg-white/5 text-white/40 hover:text-white border border-transparent'
                  }`}
                >
                  <span>{st}</span>
                  {active && <Check className="w-3 h-3 text-orange-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Threshold setting */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              Limiar de FRP Crítico (MW)
            </span>
            <span className="text-xs font-mono font-bold text-orange-400">
              {watchConfig.minFrpThreshold} MW
            </span>
          </div>

          <div className="flex gap-2">
            {[40, 60, 80, 100].map((val) => (
              <button
                key={val}
                onClick={() => setWatchConfig({ ...watchConfig, minFrpThreshold: val })}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  watchConfig.minFrpThreshold === val
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/5 text-white/40 border border-transparent'
                }`}
              >
                &gt;{val} MW
              </button>
            ))}
          </div>
        </div>

        {/* Critical Alerts Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white/50">
              Feed de Alertas Ativos ({criticalAlerts.length})
            </h4>
            {watchConfig.audioEnabled && (
              <button
                onClick={playAlertSound}
                className="text-[10px] text-amber-400 font-semibold hover:underline"
              >
                Testar Alerta Sonoro
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {criticalAlerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-white/40">
                Nenhum alerta crítico ativo no momento.
              </div>
            ) : (
              criticalAlerts.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedId(ev.id);
                    setFlyTo({
                      latitude: ev.centroid.latitude,
                      longitude: ev.centroid.longitude,
                      zoom: 10,
                    });
                  }}
                  className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-all cursor-pointer select-none space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-white">
                          {ev.municipality ?? 'Município Desconhecido'} — {ev.state ?? 'BR'}
                        </h5>
                        <span className="text-[10px] text-white/40 font-mono">
                          {ev.anomaly_count} anomalias detectadas
                        </span>
                      </div>
                    </div>

                    <Badge variant={(ev.max_frp ?? 0) > 80 ? 'critical' : 'active'}>
                      {(ev.max_frp ?? 0) > 80 ? 'Crítico' : 'Alerta'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                    <span className="text-orange-400 font-mono font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {ev.max_frp ? ev.max_frp.toFixed(1) : '—'} MW
                    </span>
                    <span className="text-white/40 text-[10px]">Clique para focar</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
