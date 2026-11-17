import type { TelemetryFilters } from '@/state/filters.atoms';

export const queryKeys = {
  telemetry: {
    all: ['telemetry'] as const,
    current: (filters: TelemetryFilters) =>
      [...queryKeys.telemetry.all, 'current', filters] as const,
    detail: (id: string | null) =>
      [...queryKeys.telemetry.all, 'detail', id] as const,
    hotspots: (filters: TelemetryFilters) =>
      [...queryKeys.telemetry.all, 'hotspots', filters] as const,
    lastUpdate: ['telemetry', 'last-update'] as const,
    satellites: ['telemetry', 'satellites'] as const,
  },
  spatial: {
    all: ['spatial'] as const,
    municipality: (ibgeCode: number) =>
      [...queryKeys.spatial.all, 'municipality', ibgeCode] as const,
    municipalities: (state: string) => [...queryKeys.spatial.all, 'municipalities', state] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    history: (params: Record<string, string | number | undefined>) =>
      [...queryKeys.analytics.all, 'history', params] as const,
    causes: (params: Record<string, string | number | undefined>) =>
      [...queryKeys.analytics.all, 'causes', params] as const,
  },
  system: {
    health: ['system', 'health'] as const,
  },
} as const;
