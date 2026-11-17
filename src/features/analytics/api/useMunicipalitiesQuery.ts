import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/lib/query-keys';
import { apiClient } from '@/core/lib/api-client';
import { MunicipalityListSchema } from '../schemas/analytics.schema';
import type { MunicipalityList } from '../schemas/analytics.schema';

export function useMunicipalitiesQuery(state: string | null) {
  return useQuery({
    queryKey: queryKeys.spatial.municipalities(state ?? ''),
    queryFn: async (): Promise<MunicipalityList> => {
      const response = await apiClient.get('/api/v1/spatial/municipalities', { params: { state } });
      return MunicipalityListSchema.parse(response.data);
    },
    enabled: Boolean(state),
    staleTime: Infinity,
  });
}
