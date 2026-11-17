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
  },
  system: {
    health: ['system', 'health'] as const,
  },
} as const;
