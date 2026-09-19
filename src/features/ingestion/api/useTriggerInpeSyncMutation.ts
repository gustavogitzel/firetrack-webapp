import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/lib/api-client';
import { queryKeys } from '@/core/lib/query-keys';

export function useTriggerInpeSyncMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/v1/internal/jobs/inpe-sync');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.telemetry.all });
    },
  });
}
