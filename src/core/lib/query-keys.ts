export const queryKeys = {
  telemetry: {
    all: ['telemetry'] as const,
    current: (filters: { hours: number; minAnomalies?: number; minFrp?: number }) =>
      [...queryKeys.telemetry.all, 'current', filters] as const,
    detail: (id: string | null) =>
      [...queryKeys.telemetry.all, 'detail', id] as const,
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
