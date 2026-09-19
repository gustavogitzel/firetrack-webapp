import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { selectedEventIdAtom } from '@/state/selection.atoms';
import { queryKeys } from '@/core/lib/query-keys';
import { apiClient } from '@/core/lib/api-client';
import { FireEventDetailSchema } from '../schemas/telemetry.schema';
import type { FireEventDetail } from '../schemas/telemetry.schema';

export function useFireEventDetailQuery() {
  const eventId = useAtomValue(selectedEventIdAtom);

  return useQuery({
    queryKey: queryKeys.telemetry.detail(eventId),
    queryFn: async (): Promise<FireEventDetail> => {
      const response = await apiClient.get(`/api/v1/fire-events/${eventId}`);
      return FireEventDetailSchema.parse(response.data);
    },
    enabled: !!eventId,
    staleTime: 1000 * 60,
  });
}
