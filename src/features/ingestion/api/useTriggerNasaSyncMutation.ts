import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/lib/api-client';
import { queryKeys } from '@/core/lib/query-keys';

export function useTriggerNasaSyncMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (days: number = 1) => {
      const response = await apiClient.post('/api/v1/internal/jobs/nasa-sync', null, {
        params: { days },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.telemetry.all });
    },
  });
}
