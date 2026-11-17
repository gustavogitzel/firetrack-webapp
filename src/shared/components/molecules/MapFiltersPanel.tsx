import { useEffect, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import {
  BIOMES,
  BRAZIL_STATES,
  biomeFilterAtom,
  clearMapFiltersAtom,
  dateRangeAtom,
  municipalityFilterAtom,
  satelliteFilterAtom,
  stateFilterAtom,
} from '@/state/filters.atoms';
import type { Biome, BrazilState } from '@/state/filters.atoms';
import { useSatellitesQuery } from '@/features/telemetry/api/useSatellitesQuery';
import { HOTSPOT_SOURCE_LABELS } from '@/features/telemetry/utils/hotspot-labels';

const FIELD_CLASS =
  'w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-white placeholder-white/30 focus:outline-none focus:border-red-500/50 [color-scheme:dark]';
const OPTION_CLASS = 'bg-neutral-900 text-white';

function todayIso(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="block text-[9px] font-extrabold uppercase tracking-widest text-white/40">{label}</span>
      {children}
    </label>
  );
}

export function MapFiltersPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useAtom(dateRangeAtom);
  const [state, setState] = useAtom(stateFilterAtom);
  const [municipality, setMunicipality] = useAtom(municipalityFilterAtom);
  const [satellite, setSatellite] = useAtom(satelliteFilterAtom);
  const [biome, setBiome] = useAtom(biomeFilterAtom);
  const clearFilters = useSetAtom(clearMapFiltersAtom);
  const { data: satellites, isError: satellitesUnavailable } = useSatellitesQuery();

  const [startDraft, setStartDraft] = useState(dateRange?.start ?? '');
  const [endDraft, setEndDraft] = useState(dateRange?.end ?? '');
  const [municipalityDraft, setMunicipalityDraft] = useState(municipality);
  const [syncedRange, setSyncedRange] = useState(dateRange);

  if (dateRange !== syncedRange) {
    setSyncedRange(dateRange);
    setStartDraft(dateRange?.start ?? '');
    setEndDraft(dateRange?.end ?? '');
  }

  useEffect(() => {
    const timeout = setTimeout(() => setMunicipality(municipalityDraft.trim()), 500);
    return () => clearTimeout(timeout);
  }, [municipalityDraft, setMunicipality]);

  const today = todayIso();
  const isRangeInvalid = Boolean(startDraft && endDraft && startDraft > endDraft);
  const activeCount = [dateRange, state, municipality, satellite, biome].filter(Boolean).length;

  const applyRange = (start: string, end: string) => {
    setStartDraft(start);
    setEndDraft(end);
    if (start && end && start <= end) setDateRange({ start, end });
  };

  const handleClear = () => {
    clearFilters();
    setStartDraft('');
    setEndDraft('');
    setMunicipalityDraft('');
  };

  const sources = [...new Set((satellites ?? []).map((s) => s.source))];

  return (
    <div className="w-72 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-white/50 hover:bg-white/5 transition-colors cursor-pointer"
      >
        <SlidersHorizontal className="w-4 h-4 text-red-400" />
        <span className="text-xs font-bold uppercase tracking-widest">Filtros</span>
        {activeCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-md bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-400">
            {activeCount}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/10">
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Field label="De">
                <input
                  type="date"
                  value={startDraft}
                  max={endDraft || today}
                  onChange={(e) => applyRange(e.target.value, endDraft)}
                  className={FIELD_CLASS}
                />
              </Field>
              <Field label="Até">
                <input
                  type="date"
                  value={endDraft}
                  min={startDraft || undefined}
                  max={today}
                  onChange={(e) => applyRange(startDraft, e.target.value)}
                  className={FIELD_CLASS}
                />
              </Field>
            </div>
            <p className={`text-[10px] ${isRangeInvalid ? 'text-red-400' : 'text-white/40'}`}>
              {isRangeInvalid
                ? 'A data inicial deve ser anterior à final.'
                : dateRange
                  ? 'Período no lugar da janela de tempo.'
                  : 'Escolha as duas datas para usar um período.'}
            </p>
          </div>

          <div className="grid grid-cols-[5rem_1fr] gap-2">
            <Field label="UF">
              <select
                value={state ?? ''}
                onChange={(e) => setState((e.target.value || null) as BrazilState | null)}
                className={FIELD_CLASS}
              >
                <option value="" className={OPTION_CLASS}>Todas</option>
                {BRAZIL_STATES.map((uf) => (
                  <option key={uf} value={uf} className={OPTION_CLASS}>{uf}</option>
                ))}
              </select>
            </Field>
            <Field label="Município">
              <input
                type="text"
                value={municipalityDraft}
                onChange={(e) => setMunicipalityDraft(e.target.value)}
                placeholder="Ex: Altamira"
                className={FIELD_CLASS}
              />
            </Field>
          </div>

          <Field label="Satélite">
            <select
              value={satellite ?? ''}
              onChange={(e) => setSatellite(e.target.value || null)}
              disabled={satellitesUnavailable}
              className={`${FIELD_CLASS} disabled:opacity-40`}
            >
              <option value="" className={OPTION_CLASS}>
                {satellitesUnavailable ? 'Lista indisponível' : 'Todos'}
              </option>
              {sources.map((source) => (
                <optgroup key={source} label={HOTSPOT_SOURCE_LABELS[source] ?? source} className={OPTION_CLASS}>
                  {satellites!
                    .filter((s) => s.source === source)
                    .map((s) => (
                      <option key={`${source}-${s.satellite}`} value={s.satellite} className={OPTION_CLASS}>
                        {s.satellite} ({s.detections.toLocaleString('pt-BR')})
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </Field>

          <Field label="Bioma">
            <select
              value={biome ?? ''}
              onChange={(e) => setBiome((e.target.value || null) as Biome | null)}
              className={FIELD_CLASS}
            >
              <option value="" className={OPTION_CLASS}>Todos</option>
              {BIOMES.map((name) => (
                <option key={name} value={name} className={OPTION_CLASS}>{name}</option>
              ))}
            </select>
          </Field>

          {activeCount > 0 && (
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/10 text-[11px] font-bold text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
