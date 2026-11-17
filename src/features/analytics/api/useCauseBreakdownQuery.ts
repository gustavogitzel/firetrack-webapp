import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/lib/query-keys';
import { apiClient } from '@/core/lib/api-client';
import type { AnalyticsRegion } from '@/state/analytics.atoms';
import { CauseBreakdownSchema } from '../schemas/analytics.schema';
import type { CauseBreakdown } from '../schemas/analytics.schema';

export function useCauseBreakdownQuery(region: AnalyticsRegion, year: number | null) {
  const params = {
    year: year ?? undefined,
    state: region.state ?? undefined,
    ibge_code: region.ibgeCode ?? undefined,
    biome: region.biome ?? undefined,
  };

  return useQuery({
    queryKey: queryKeys.analytics.causes(params),
    queryFn: async (): Promise<CauseBreakdown> => {
      const response = await apiClient.get('/api/v1/fire-occurrences/causes', { params });
      return CauseBreakdownSchema.parse(response.data);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 30,
  });
}
