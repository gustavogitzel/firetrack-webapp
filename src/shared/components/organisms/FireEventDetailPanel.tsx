import { useAtom } from 'jotai';
import { useMemo } from 'react';
import {
  X,
  Flame,
  MapPin,
  Clock,
  Zap,
  ShieldAlert,
  Loader2,
  Satellite,
  Camera,
  Newspaper,
} from 'lucide-react';
import { selectedEventIdAtom, streetViewTargetAtom, mapFlyToTargetAtom } from '@/state/selection.atoms';
import { useFireEventDetailQuery } from '@/features/telemetry/api/useFireEventDetailQuery';
import { useFireNewsQuery } from '@/features/telemetry/api/useFireNewsQuery';
import { useFireImagesQuery } from '@/features/telemetry/api/useFireImagesQuery';
import { StatCard } from '../atoms/StatCard';
import { AnomalyTimelineItem } from '../molecules/AnomalyTimelineItem';
import { SatelliteBreakdown } from '../molecules/SatelliteBreakdown';
import { NewsArticleCard } from '../molecules/NewsArticleCard';
import { FireImageGallery } from '../molecules/FireImageGallery';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export function FireEventDetailPanel() {
  const [selectedId, setSelectedId] = useAtom(selectedEventIdAtom);
  const [, setStreetViewTarget] = useAtom(streetViewTargetAtom);
  const [, setFlyTo] = useAtom(mapFlyToTargetAtom);
  const { data: detail, isLoading, isError } = useFireEventDetailQuery();

  const sortedAnomalies = useMemo(() => {
    if (!detail?.anomalies) return [];
    return [...detail.anomalies].sort(
      (a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime(),
    );
  }, [detail?.anomalies]);

  const eventDate = sortedAnomalies[0]?.detected_at;
  const { data: newsArticles } = useFireNewsQuery(
    detail?.municipality,
    detail?.state,
    eventDate,
  );
  const { data: fireImages } = useFireImagesQuery(
    detail?.municipality,
    detail?.state,
    eventDate,
    detail?.centroid,
  );

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
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSelectedId(null)}
      />

      {/* Slide-over Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col bg-neutral-950/90 backdrop-blur-3xl border-l border-white/10 shadow-2xl">
          {/* Drawer Header */}
          <div className="shrink-0 px-6 pt-6 pb-4 border-b border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Evento de Incêndio</h2>
                  <p className="text-xs text-white/40 font-mono mt-0.5">
                    ID: {selectedId?.slice(0, 13)}…
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

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
                <span className="text-sm text-white/50 font-medium">Carregando detalhes do satélite…</span>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <ShieldAlert className="w-8 h-8 text-red-400" />
                <span className="text-sm text-white/60">Não foi possível carregar os detalhes do evento.</span>
              </div>
            )}

            {detail && !isLoading && (
              <>
                {/* Location Card */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-white/50">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-extrabold uppercase tracking-widest">
                      Localização
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">
                      {detail.municipality ?? 'Município desconhecido'}
                      {detail.state && (
                        <span className="text-white/50 font-normal"> — {detail.state}</span>
                      )}
                    </p>
                    <p className="text-xs text-white/40 font-mono mt-1">
                      Lat: {detail.centroid.latitude.toFixed(5)}, Lng: {detail.centroid.longitude.toFixed(5)}
                    </p>
                  </div>

                  {/* Action Buttons for Ground Perspective */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <button
                      onClick={() => {
                        setFlyTo({
                          latitude: detail.centroid.latitude,
                          longitude: detail.centroid.longitude,
                          zoom: 16,
                          pitch: 65,
                          bearing: 35,
                        });
                      }}
                      className="py-2.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Flame className="w-4 h-4 text-red-400" />
                      <span>Visão 3D de Chão</span>
                    </button>

                    <button
                      onClick={() => {
                        setStreetViewTarget({
                          latitude: detail.centroid.latitude,
                          longitude: detail.centroid.longitude,
                          locationName: `${detail.municipality ?? 'Foco de Incêndio'} - ${detail.state ?? ''}`,
                        });
                      }}
                      className="py-2.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Camera className="w-4 h-4 text-sky-400" />
                      <span>Visão 360° HD</span>
                    </button>
                  </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    label="Anomalias"
                    value={detail.anomaly_count}
                    color="red"
                    icon={<Flame className="w-4 h-4" />}
                  />
                  <StatCard
                    label="FRP Máx"
                    value={maxFrp.toFixed(1)}
                    unit="MW"
                    color="orange"
                    icon={<Zap className="w-4 h-4" />}
                  />
                  <StatCard
                    label="FRP Médio"
                    value={avgFrp.toFixed(1)}
                    unit="MW"
                    color="amber"
                    icon={<Zap className="w-4 h-4" />}
                  />
                  <StatCard
                    label="Satélites"
                    value={Object.keys(satelliteStats).length}
                    color="sky"
                    icon={<Satellite className="w-4 h-4" />}
                  />
                </div>

                {/* Satellite breakdown */}
                <SatelliteBreakdown
                  satelliteCounts={satelliteStats}
                  totalAnomalies={detail.anomaly_count}
                />

                {/* Regional & Satellite Images Gallery */}
                <FireImageGallery
                  images={fireImages || []}
                  locationName={detail.municipality ?? undefined}
                />

                {/* News and Media for the region */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-white/50 px-1">
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-extrabold uppercase tracking-widest text-sky-400">
                        Notícias & Imprensa Regional
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {newsArticles && newsArticles.length > 0 ? (
                      newsArticles.map((article) => (
                        <NewsArticleCard key={article.id} article={article} />
                      ))
                    ) : (
                      <p className="text-xs text-white/40 italic p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                        Nenhuma matéria de imprensa encontrada para esta região no momento.
                      </p>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-white/50 px-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-extrabold uppercase tracking-widest">
                        Histórico de Detecções
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">
                      {sortedAnomalies.length} registros
                    </span>
                  </div>

                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 divide-y divide-white/5 overflow-hidden">
                    {sortedAnomalies.map((anomaly, idx) => (
                      <AnomalyTimelineItem key={anomaly.id} anomaly={anomaly} index={idx} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          {detail && (
            <div className="shrink-0 px-6 py-4 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] text-white/40">
                <span>
                  Mais recente:{' '}
                  {sortedAnomalies[0] && timeAgo(sortedAnomalies[0].detected_at)}
                </span>
                <span className="font-mono text-white/30">{selectedId?.slice(0, 10)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
