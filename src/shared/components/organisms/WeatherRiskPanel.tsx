import { useAtom } from 'jotai';
import { Thermometer, Wind, Droplets, CloudRain, X, ShieldAlert, Compass, Loader2 } from 'lucide-react';
import { activeViewAtom } from '@/state/navigation.atoms';
import { mapFlyToTargetAtom } from '@/state/selection.atoms';
import { useFireEventDetailQuery } from '@/features/telemetry/api/useFireEventDetailQuery';
import { useWeatherSnapshotQuery } from '@/features/telemetry/api/useWeatherSnapshotQuery';
import { useFireEventsQuery } from '@/features/telemetry/api/useFireEventsQuery';
import { calculateFireRisk } from '@/features/telemetry/utils/fire-risk';
import { StatCard } from '../atoms/StatCard';
import { Badge } from '../atoms/Badge';

export function WeatherRiskPanel() {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const [, setFlyTo] = useAtom(mapFlyToTargetAtom);

  const { data: detail } = useFireEventDetailQuery();
  const { data: fireEvents } = useFireEventsQuery();

  // Selected event or highest FRP event coordinates
  const highestFrpEvent = fireEvents?.slice().sort((a, b) => (b.max_frp ?? 0) - (a.max_frp ?? 0))[0];
  const targetCentroid = detail?.centroid ?? highestFrpEvent?.centroid;

  const { data: weather, isLoading, isError } = useWeatherSnapshotQuery(
    targetCentroid?.latitude,
    targetCentroid?.longitude,
  );

  const isOpen = activeView === 'weather';

  if (!isOpen) return null;

  const maxFrp = detail
    ? Math.max(0, ...(detail.anomalies?.map((a) => a.frp ?? 0) ?? [0]))
    : highestFrpEvent?.max_frp ?? 0;

  const risk = calculateFireRisk(
    weather?.temperature_c,
    weather?.relative_humidity_pct,
    weather?.wind_speed_kmh,
    maxFrp,
  );

  return (
    <div className="absolute top-0 right-0 z-20 h-full w-full max-w-md bg-neutral-950/85 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col select-none">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Clima & Risco de Fogo</h3>
            <p className="text-xs text-white/50">Índice de Meteorologia Florestal (FWI)</p>
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
        {/* Selected Event Focus Banner */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">
              Ponto de Referência
            </span>
            <span className="text-sm font-bold text-white block mt-0.5">
              {detail?.municipality ?? highestFrpEvent?.municipality ?? 'Foco Ativo'}
              {(detail?.state || highestFrpEvent?.state) && (
                <span className="text-white/40 font-normal"> — {detail?.state ?? highestFrpEvent?.state}</span>
              )}
            </span>
          </div>

          {targetCentroid && (
            <button
              onClick={() =>
                setFlyTo({
                  latitude: targetCentroid.latitude,
                  longitude: targetCentroid.longitude,
                  zoom: 10,
                })
              }
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all"
            >
              Focar no Mapa
            </button>
          )}
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-white/50 text-xs">
            <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
            <span>Consultando estação meteorológica da API...</span>
          </div>
        )}

        {isError && (
          <div className="py-8 text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl">
            Não foi possível obter a telemetria de clima para este ponto.
          </div>
        )}

        {/* FWI Risk Category Card */}
        {risk && !isLoading && (
          <div
            className={`p-5 rounded-3xl border backdrop-blur-2xl flex flex-col gap-3 transition-all ${
              risk.color === 'red'
                ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.25)]'
                : risk.color === 'orange'
                ? 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.2)]'
                : 'bg-amber-950/40 border-amber-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert
                  className={`w-6 h-6 ${
                    risk.color === 'red' ? 'text-red-400 animate-pulse' : 'text-orange-400'
                  }`}
                />
                <span className="text-xs font-extrabold uppercase tracking-widest text-white/70">
                  Índice de Risco (FWI)
                </span>
              </div>
              <Badge variant={risk.color === 'red' ? 'critical' : 'nominal'} pulse>
                Risco {risk.level}
              </Badge>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white font-mono tracking-tight">
                {risk.fwiScore}
              </span>
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider">
                pontos FWI
              </span>
            </div>

            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {risk.description}
            </p>
          </div>
        )}

        {/* Weather Telemetry Grid */}
        {!isLoading && (
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-white/50">
              Telemetria Meteorológica Real
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Temperatura"
                value={weather?.temperature_c != null ? weather.temperature_c.toFixed(1) : '—'}
                unit="°C"
                color="orange"
                icon={<Thermometer className="w-4 h-4" />}
              />

              <StatCard
                label="Umidade Relativa"
                value={weather?.relative_humidity_pct != null ? weather.relative_humidity_pct.toFixed(0) : '—'}
                unit="%"
                color="sky"
                icon={<Droplets className="w-4 h-4" />}
              />

              <StatCard
                label="Velocidade do Vento"
                value={weather?.wind_speed_kmh != null ? weather.wind_speed_kmh.toFixed(1) : '—'}
                unit="km/h"
                color="amber"
                icon={<Wind className="w-4 h-4" />}
              />

              <StatCard
                label="Precipitação"
                value={weather?.precipitation_mm != null ? weather.precipitation_mm.toFixed(1) : '—'}
                unit="mm"
                color="neutral"
                icon={<CloudRain className="w-4 h-4" />}
              />
            </div>
          </div>
        )}

        {/* Wind Propagation Vector Card */}
        {!isLoading && weather?.wind_speed_kmh != null && (
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-white/60 text-xs font-bold">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Direção e Propagação pelo Vento</span>
              </div>
              {weather.wind_direction_10m != null && (
                <span className="text-[10px] font-mono text-white/40">
                  {weather.wind_direction_10m}°
                </span>
              )}
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              Ventos medidos a {weather.wind_speed_kmh.toFixed(1)} km/h na estação de telemetria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
