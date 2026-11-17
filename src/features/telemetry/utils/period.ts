import type { DateRange, TelemetryFilters } from '@/state/filters.atoms';

const HOUR_MS = 60 * 60 * 1000;

function rangeBounds(range: DateRange): { start: Date; end: Date } {
  return {
    start: new Date(`${range.start}T00:00:00`),
    end: new Date(`${range.end}T23:59:59.999`),
  };
}

export function periodParams(filters: TelemetryFilters, maxHours = Infinity) {
  if (!filters.dateRange) {
    return { hours: Math.min(filters.hours, maxHours) };
  }
  const { start, end } = rangeBounds(filters.dateRange);
  const cappedStart = new Date(Math.max(start.getTime(), end.getTime() - maxHours * HOUR_MS));
  return { start_time: cappedStart.toISOString(), end_time: end.toISOString() };
}

export function periodHours(filters: TelemetryFilters): number {
  if (!filters.dateRange) return filters.hours;
  const { start, end } = rangeBounds(filters.dateRange);
  return (end.getTime() - start.getTime()) / HOUR_MS;
}

const dayFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

export function formatDateRange(range: DateRange): string {
  const { start, end } = rangeBounds(range);
  return `${dayFormatter.format(start)} – ${dayFormatter.format(end)}`;
}
