import { useAtom } from 'jotai';
import { useState, useMemo } from 'react';
import { Search, Flame, ArrowUpDown, X, Filter } from 'lucide-react';
import { useFireEventsQuery } from '@/features/telemetry/api/useFireEventsQuery';
import { selectedEventIdAtom, mapFlyToTargetAtom } from '@/state/selection.atoms';
import { activeViewAtom } from '@/state/navigation.atoms';
import { FireEventRow } from '../molecules/FireEventRow';
import { TimeWindowSelector } from '../molecules/TimeWindowSelector';

export function IncidentsListPanel() {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const [selectedId, setSelectedId] = useAtom(selectedEventIdAtom);
  const [, setFlyTo] = useAtom(mapFlyToTargetAtom);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'frp' | 'anomalies' | 'recent'>('frp');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'contained'>('all');

  const { data: fireEvents, isLoading } = useFireEventsQuery();

  const isOpen = activeView === 'incidents';

  const filteredEvents = useMemo(() => {
    if (!fireEvents) return [];
    return fireEvents
      .filter((e) => {
        if (statusFilter !== 'all' && e.status !== statusFilter) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          e.municipality?.toLowerCase().includes(q) ||
          e.state?.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'frp') return (b.max_frp ?? 0) - (a.max_frp ?? 0);
        if (sortBy === 'anomalies') return b.anomaly_count - a.anomaly_count;
        return (
          new Date(b.last_detected_at).getTime() - new Date(a.last_detected_at).getTime()
        );
      });
  }, [fireEvents, search, sortBy, statusFilter]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 sm:left-auto right-0 z-20 h-full w-full max-w-md bg-neutral-950/85 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col">
      {/* Panel Header */}
      <div className="p-5 border-b border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Focos de Incêndio</h3>
              <p className="text-xs text-white/50">
                {filteredEvents.length} focos detectados na janela atual
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('map')}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Time Selector */}
        <TimeWindowSelector compact />

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por município ou estado (ex: PA, Altamira)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/40 text-xs font-medium focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and Sorting bar */}
        <div className="flex items-center justify-between text-xs pt-1">
          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-white/40" />
            {(['all', 'active', 'contained'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white/20 text-white border border-white/20'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {st === 'all' ? 'Todos' : st === 'active' ? 'Ativos' : 'Contidos'}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-white/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-white/70 text-[11px] font-semibold border-none focus:outline-none cursor-pointer"
            >
              <option value="frp" className="bg-neutral-900 text-white">Maior FRP</option>
              <option value="anomalies" className="bg-neutral-900 text-white">Mais Anomalias</option>
              <option value="recent" className="bg-neutral-900 text-white">Mais Recentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-white/40 animate-pulse">
            Carregando lista de focos...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-xs text-white/40 space-y-1">
            <p className="font-semibold text-white/60">Nenhum foco encontrado</p>
            <p>Tente ajustar os filtros ou selecionar outra janela temporal.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <FireEventRow
              key={evt.id}
              event={evt}
              isSelected={selectedId === evt.id}
              onSelect={(id) => {
                setSelectedId(id);
                setFlyTo({
                  latitude: evt.centroid.latitude,
                  longitude: evt.centroid.longitude,
                  zoom: 9,
                });
              }}
              onFocusOnMap={(lat, lng) => {
                setFlyTo({ latitude: lat, longitude: lng, zoom: 10 });
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
