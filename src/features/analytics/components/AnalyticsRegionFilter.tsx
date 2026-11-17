import { useAtom } from 'jotai';
import { analyticsRegionAtom } from '@/state/analytics.atoms';
import { BIOMES, BRAZIL_STATES } from '@/state/filters.atoms';
import type { Biome, BrazilState } from '@/state/filters.atoms';
import { useMunicipalitiesQuery } from '../api/useMunicipalitiesQuery';

const FIELD_CLASS =
  'w-full px-2.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/50 disabled:opacity-40 [color-scheme:dark]';
const OPTION_CLASS = 'bg-neutral-900 text-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 min-w-0">
      <span className="block text-[9px] font-extrabold uppercase tracking-widest text-white/40">{label}</span>
      {children}
    </label>
  );
}

export function AnalyticsRegionFilter() {
  const [region, setRegion] = useAtom(analyticsRegionAtom);
  const { data: municipalities, isFetching } = useMunicipalitiesQuery(region.state);

  return (
    <div className="grid grid-cols-[4.5rem_1fr_1fr] gap-2">
      <Field label="UF">
        <select
          value={region.state ?? ''}
          onChange={(e) =>
            setRegion({ ...region, state: (e.target.value || null) as BrazilState | null, ibgeCode: null })
          }
          className={FIELD_CLASS}
        >
          <option value="" className={OPTION_CLASS}>Brasil</option>
          {BRAZIL_STATES.map((uf) => (
            <option key={uf} value={uf} className={OPTION_CLASS}>{uf}</option>
          ))}
        </select>
      </Field>
      <Field label="Município">
        <select
          value={region.ibgeCode ?? ''}
          onChange={(e) => setRegion({ ...region, ibgeCode: e.target.value || null })}
          disabled={!region.state || isFetching}
          className={FIELD_CLASS}
        >
          <option value="" className={OPTION_CLASS}>
            {region.state ? (isFetching ? 'Carregando…' : 'Todos') : 'Escolha a UF'}
          </option>
          {(municipalities ?? []).map((m) => (
            <option key={m.ibge_code} value={m.ibge_code} className={OPTION_CLASS}>{m.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Bioma">
        <select
          value={region.biome ?? ''}
          onChange={(e) => setRegion({ ...region, biome: (e.target.value || null) as Biome | null })}
          className={FIELD_CLASS}
        >
          <option value="" className={OPTION_CLASS}>Todos</option>
          {BIOMES.map((name) => (
            <option key={name} value={name} className={OPTION_CLASS}>{name}</option>
          ))}
        </select>
      </Field>
    </div>
  );
}
