import type { CauseClass } from '../schemas/analytics.schema';

export const CAUSE_CLASS_LABELS: Record<CauseClass, string> = {
  intentional: 'Intencionais',
  accidental: 'Acidentais',
  natural: 'Naturais',
  indeterminate: 'Indeterminadas',
};

export const CAUSE_CLASS_DESCRIPTIONS: Record<CauseClass, string> = {
  intentional: 'Uso deliberado do fogo: limpeza de área, pastagem, caça, vandalismo e outras.',
  accidental: 'Fogo que escapou sem intenção: fagulhas, reignição, aceiro, fogueira, balão.',
  natural: 'Descarga elétrica de raio.',
  indeterminate: 'A brigada não conseguiu determinar a causa.',
};

export const CAUSE_CLASS_COLORS: Record<CauseClass, string> = {
  intentional: '#d95926',
  accidental: '#199e70',
  natural: '#3987e5',
  indeterminate: '#6b6b66',
};

export const HOTSPOT_SERIES_COLOR = '#ef4444';

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function parsePeriod(period: string): { year: number; month: number } {
  const [year, month] = period.split('-').map(Number);
  return { year, month };
}

export function formatPeriod(period: string, granularity: 'month' | 'year'): string {
  const { year, month } = parsePeriod(period);
  return granularity === 'year' ? String(year) : `${MONTHS[month - 1]} ${year}`;
}

export function shortPeriodLabel(period: string, granularity: 'month' | 'year'): string {
  const { year, month } = parsePeriod(period);
  return granularity === 'year' ? `'${String(year).slice(2)}` : MONTHS[month - 1];
}

export function formatCompact(value: number): string {
  if (value >= 1000) {
    const thousands = value / 1000;
    return `${thousands.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`;
  }
  return value.toLocaleString('pt-BR');
}

export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}
