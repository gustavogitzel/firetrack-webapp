import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/lib/query-keys';
import { apiClient } from '@/core/lib/api-client';
import { LastUpdateSchema } from '../schemas/telemetry.schema';
import type { LastUpdate } from '../schemas/telemetry.schema';

export function useLastUpdateQuery() {
  return useQuery({
    queryKey: queryKeys.telemetry.lastUpdate,
    queryFn: async (): Promise<LastUpdate> => {
      const response = await apiClient.get('/api/v1/anomalies/last-update');
      return LastUpdateSchema.parse(response.data);
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: true,
  });
}
