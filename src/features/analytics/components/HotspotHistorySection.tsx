import { useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { Loader2, Table2 } from 'lucide-react';
import { analyticsRegionAtom, seriesGranularityAtom, seriesYearAtom } from '@/state/analytics.atoms';
import { useHotspotHistoryQuery } from '../api/useHotspotHistoryQuery';
import { formatPeriod, parsePeriod } from '../utils/analytics-labels';
import { HotspotHistoryChart } from './HotspotHistoryChart';

const SELECT_CLASS =
  'px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] font-bold text-white focus:outline-none [color-scheme:dark]';

function yearsBetween(first: string | null, last: string | null): number[] {
  if (!first || !last) return [];
  const start = parsePeriod(first).year;
  const end = parsePeriod(last).year;
  return Array.from({ length: end - start + 1 }, (_, i) => end - i);
}

export function HotspotHistorySection() {
  const region = useAtomValue(analyticsRegionAtom);
  const [granularity, setGranularity] = useAtom(seriesGranularityAtom);
  const [selectedYear, setSelectedYear] = useAtom(seriesYearAtom);
  const [showTable, setShowTable] = useState(false);

  const { data: coverage } = useHotspotHistoryQuery({ state: null, ibgeCode: null, biome: null }, 'year', null);
  const lastYear = coverage?.last_month ? parsePeriod(coverage.last_month).year : null;
  const year = selectedYear ?? lastYear;
  const { data, isLoading, isError, isFetching } = useHotspotHistoryQuery(region, granularity, year);

  const years = yearsBetween(coverage?.first_month ?? null, coverage?.last_month ?? null);
  const points = data?.points ?? [];
  const total = points.reduce((sum, p) => sum + p.hotspots, 0);
  const isEmptyBase = coverage != null && coverage.first_month == null;

  return (
    <section className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-white/50">Série histórica de focos</h4>
          <p className="text-[10px] text-white/40">Satélite de referência do INPE ({data?.satellite ?? 'AQUA_M-T'})</p>
        </div>
        {isFetching && !isLoading && <Loader2 className="w-3.5 h-3.5 text-white/40 animate-spin" />}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex p-0.5 rounded-lg bg-white/[0.05] border border-white/10">
          {(['month', 'year'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setGranularity(option)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                granularity === option ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              {option === 'month' ? 'Mensal' : 'Anual'}
            </button>
          ))}
        </div>
        {granularity === 'month' && years.length > 0 && (
          <select
            value={year ?? ''}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className={SELECT_CLASS}
            aria-label="Ano da série mensal"
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-neutral-900">{y}</option>
            ))}
          </select>
        )}
        <button
          onClick={() => setShowTable(!showTable)}
          aria-pressed={showTable}
          className={`ml-auto flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
            showTable ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
          }`}
        >
          <Table2 className="w-3.5 h-3.5" />
          Tabela
        </button>
      </div>

      {isLoading ? (
        <div className="h-[190px] rounded-xl bg-white/[0.03] animate-pulse" />
      ) : isError ? (
        <p className="py-8 text-center text-xs text-white/50">Não foi possível carregar a série histórica.</p>
      ) : isEmptyBase ? (
        <p className="py-8 text-center text-xs text-white/50">
          A base histórica ainda não foi carregada. Rode o job <code className="text-white/70">hotspot-history</code>.
        </p>
      ) : (
        <>
          <p className="text-[11px] text-white/60">
            <span className="text-lg font-black text-white">{total.toLocaleString('pt-BR')}</span> focos{' '}
            {granularity === 'month' ? `em ${year}` : `de ${years[years.length - 1]} a ${years[0]}`}
          </p>
          {showTable ? (
            <div className="max-h-[190px] overflow-y-auto rounded-xl border border-white/10">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-neutral-900 text-white/40">
                  <tr>
                    <th className="px-3 py-1.5 text-left font-bold">Período</th>
                    <th className="px-3 py-1.5 text-right font-bold">Focos</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((p) => (
                    <tr key={p.period} className="border-t border-white/5 text-white/80">
                      <td className="px-3 py-1">{formatPeriod(p.period, granularity)}</td>
                      <td className="px-3 py-1 text-right font-mono">{p.hotspots.toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <HotspotHistoryChart points={points} granularity={granularity} />
          )}
          <p className="text-[10px] leading-relaxed text-white/40">
            Conta só os focos de um mesmo satélite em todos os anos, então os períodos são comparáveis. Não é o total
            de focos de todos os satélites. A barra mais clara é o período em andamento.
          </p>
        </>
      )}
    </section>
  );
}
