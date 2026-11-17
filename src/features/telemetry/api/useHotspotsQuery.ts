import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { HOTSPOTS_MAX_HOURS, telemetryFiltersAtom } from '@/state/filters.atoms';
import { queryKeys } from '@/core/lib/query-keys';
import { apiClient } from '@/core/lib/api-client';
import { periodParams } from '../utils/period';
import { HotspotCollectionSchema } from '../schemas/telemetry.schema';
import type { HotspotCollection } from '../schemas/telemetry.schema';

export function useHotspotsQuery(enabled: boolean) {
  const filters = useAtomValue(telemetryFiltersAtom);

  return useQuery({
    queryKey: queryKeys.telemetry.hotspots(filters),
    queryFn: async (): Promise<HotspotCollection> => {
      const response = await apiClient.get('/api/v1/anomalies/current', {
        params: {
          ...periodParams(filters, HOTSPOTS_MAX_HOURS),
          biome: filters.biome ?? undefined,
          state: filters.state ?? undefined,
          municipality_name: filters.municipality || undefined,
          satellite: filters.satellite ?? undefined,
        },
      });
      return HotspotCollectionSchema.parse(response.data);
    },
    enabled,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: true,
  });
}
