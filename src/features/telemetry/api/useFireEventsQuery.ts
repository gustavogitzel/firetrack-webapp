import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { telemetryFiltersAtom } from '@/state/filters.atoms';
import { queryKeys } from '@/core/lib/query-keys';
import { apiClient } from '@/core/lib/api-client';
import { FireEventsListSchema } from '../schemas/telemetry.schema';
import type { FireEventSummary } from '../schemas/telemetry.schema';

export function useFireEventsQuery() {
  const filters = useAtomValue(telemetryFiltersAtom);

  return useQuery({
    queryKey: queryKeys.telemetry.current(filters),
    queryFn: async (): Promise<FireEventSummary[]> => {
      const response = await apiClient.get('/api/v1/fire-events/current', {
        params: {
          hours: filters.hours,
          min_anomalies: filters.minAnomalies,
        },
      });
      return FireEventsListSchema.parse(response.data);
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: true,
  });
}
