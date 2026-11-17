import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/lib/query-keys';
import { apiClient } from '@/core/lib/api-client';
import { SatelliteListSchema } from '../schemas/telemetry.schema';
import type { SatelliteList } from '../schemas/telemetry.schema';

export function useSatellitesQuery() {
  return useQuery({
    queryKey: queryKeys.telemetry.satellites,
    queryFn: async (): Promise<SatelliteList> => {
      const response = await apiClient.get('/api/v1/anomalies/satellites', { params: { days: 30 } });
      return SatelliteListSchema.parse(response.data);
    },
    staleTime: 1000 * 60 * 10,
  });
}
