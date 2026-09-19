import { useFireEventsQuery } from '@/features/telemetry/api/useFireEventsQuery';
import type { FireEventSummary } from '@/features/telemetry/schemas/telemetry.schema';

export interface DerivedMetrics {
  totalEvents: number;
  totalAnomalies: number;
  maxFrp: number;
  activeEvents: number;
  containedEvents: number;
  satelliteCounts: Record<string, number>;
  topMunicipalities: Array<{
    name: string;
    state: string;
    anomalyCount: number;
  }>;
}

function computeMetrics(events: FireEventSummary[]): DerivedMetrics {
  const satelliteCounts: Record<string, number> = {};

  let totalAnomalies = 0;
  let maxFrp = 0;
  let activeEvents = 0;
  let containedEvents = 0;

  for (const event of events) {
    totalAnomalies += event.anomaly_count;
    if (event.max_frp != null && event.max_frp > maxFrp) {
      maxFrp = event.max_frp;
    }
    if (event.status === 'active') activeEvents++;
    if (event.status === 'contained') containedEvents++;

    for (const sat of event.satellites ?? []) {
      satelliteCounts[sat] = (satelliteCounts[sat] ?? 0) + 1;
    }
  }

  const topMunicipalities = [...events]
    .filter((e) => e.municipality)
    .sort((a, b) => b.anomaly_count - a.anomaly_count)
    .slice(0, 10)
    .map((e) => ({
      name: e.municipality!,
      state: e.state ?? '--',
      anomalyCount: e.anomaly_count,
    }));

  return {
    totalEvents: events.length,
    totalAnomalies,
    maxFrp,
    activeEvents,
    containedEvents,
    satelliteCounts,
    topMunicipalities,
  };
}

/**
 * Derives KPI metrics from the fire events query cache.
 * Re-computes only when the query data changes.
 */
export function useDerivedMetrics() {
  const { data: events = [], ...queryState } = useFireEventsQuery();
  const metrics = computeMetrics(events);

  return { metrics, ...queryState };
}
