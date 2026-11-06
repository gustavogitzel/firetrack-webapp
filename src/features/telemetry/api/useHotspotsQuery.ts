import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { HOTSPOTS_MAX_HOURS, telemetryFiltersAtom } from '@/state/filters.atoms';
import { queryKeys } from '@/core/lib/query-keys';
import { apiClient } from '@/core/lib/api-client';
import { HotspotCollectionSchema } from '../schemas/telemetry.schema';
import type { HotspotCollection } from '../schemas/telemetry.schema';

export function useHotspotsQuery(enabled: boolean) {
  const filters = useAtomValue(telemetryFiltersAtom);
  const hours = Math.min(filters.hours, HOTSPOTS_MAX_HOURS);

  return useQuery({
    queryKey: queryKeys.telemetry.hotspots({ hours, biome: filters.biome }),
    queryFn: async (): Promise<HotspotCollection> => {
      const response = await apiClient.get('/api/v1/anomalies/current', {
        params: {
          hours,
          biome: filters.biome ?? undefined,
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
