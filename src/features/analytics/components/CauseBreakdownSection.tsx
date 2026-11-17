import { useAtom, useAtomValue } from 'jotai';
import { Loader2 } from 'lucide-react';
import { analyticsRegionAtom, causesYearAtom } from '@/state/analytics.atoms';
import { useCauseBreakdownQuery } from '../api/useCauseBreakdownQuery';
import { CAUSE_CLASSES } from '../schemas/analytics.schema';
import {
  CAUSE_CLASS_COLORS,
  CAUSE_CLASS_DESCRIPTIONS,
  CAUSE_CLASS_LABELS,
} from '../utils/analytics-labels';

const FIRST_SISFOGO_YEAR = 2014;
const TOP_CAUSES = 6;

function percent(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

function capitalize(label: string): string {
  const lower = label.toLocaleLowerCase('pt-BR');
  return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
}

export function CauseBreakdownSection() {
  const region = useAtomValue(analyticsRegionAtom);
  const [year, setYear] = useAtom(causesYearAtom);
  const { data, isLoading, isError, isFetching } = useCauseBreakdownQuery(region, year);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - FIRST_SISFOGO_YEAR + 1 }, (_, i) => currentYear - i);
  const total = data?.total_occurrences ?? 0;
  const classCounts = new Map((data?.classes ?? []).map((c) => [c.cause_class, c.occurrences]));
  const maxCause = data?.causes[0]?.occurrences ?? 1;

  return (
    <section className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-white/50">Causas dos incêndios</h4>
          <p className="text-[10px] text-white/40">Ocorrências registradas pelas brigadas do IBAMA (Sisfogo)</p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && <Loader2 className="w-3.5 h-3.5 text-white/40 animate-spin" />}
          <select
            value={year ?? ''}
            onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
            aria-label="Ano das ocorrências"
            className="px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] font-bold text-white focus:outline-none [color-scheme:dark]"
          >
            <option value="" className="bg-neutral-900">Todos os anos</option>
            {years.map((y) => (
              <option key={y} value={y} className="bg-neutral-900">{y}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 rounded-xl bg-white/[0.03] animate-pulse" />
      ) : isError ? (
        <p className="py-8 text-center text-xs text-white/50">Não foi possível carregar as causas.</p>
      ) : total === 0 ? (
        <p className="py-8 text-center text-xs text-white/50">
          O IBAMA não tem ocorrências registradas para esse filtro.
        </p>
      ) : (
        <>
          <p className="text-[11px] text-white/60">
            <span className="text-lg font-black text-white">{total.toLocaleString('pt-BR')}</span> ocorrências
          </p>

          <ul className="space-y-2.5">
            {CAUSE_CLASSES.map((causeClass) => {
              const count = classCounts.get(causeClass) ?? 0;
              return (
                <li key={causeClass} className="space-y-1" title={CAUSE_CLASS_DESCRIPTIONS[causeClass]}>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-white">
                      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: CAUSE_CLASS_COLORS[causeClass] }} />
                      {CAUSE_CLASS_LABELS[causeClass]}
                    </span>
                    <span className="font-mono text-white/60">
                      <span className="font-bold text-white">{percent(count, total)}</span> · {count.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(count / total) * 100}%`, backgroundColor: CAUSE_CLASS_COLORS[causeClass] }}
                    />
                  </div>
                  <p className="text-[10px] text-white/40">{CAUSE_CLASS_DESCRIPTIONS[causeClass]}</p>
                </li>
              );
            })}
          </ul>

          {data!.causes.length > 0 && (
            <div className="pt-2 space-y-2 border-t border-white/10">
              <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-white/40">Causas mais comuns</h5>
              {data!.causes.slice(0, TOP_CAUSES).map((cause) => (
                <div key={cause.cause_code} className="grid grid-cols-[1fr_5rem_2.5rem] items-center gap-2 text-[11px]">
                  <span className="truncate text-white/80" title={cause.cause_label}>
                    {capitalize(cause.cause_label)}
                  </span>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(cause.occurrences / maxCause) * 100}%`,
                        backgroundColor: CAUSE_CLASS_COLORS[cause.cause_class],
                      }}
                    />
                  </div>
                  <span className="text-right font-mono text-white/60">{cause.occurrences.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] leading-relaxed text-white/40">
            Uma ocorrência com mais de uma causa conta em cada classe, por isso a soma pode passar de 100%. Os dados
            abertos do IBAMA vão de 2015 a 2022 e não têm coordenadas: UF, município e bioma vêm do município da
            ocorrência.
          </p>
        </>
      )}
    </section>
  );
}
