import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/core/lib/query-keys';
import { apiClient } from '@/core/lib/api-client';
import type { AnalyticsRegion, SeriesGranularity } from '@/state/analytics.atoms';
import { HotspotSeriesSchema } from '../schemas/analytics.schema';
import type { HotspotSeries } from '../schemas/analytics.schema';

export function useHotspotHistoryQuery(region: AnalyticsRegion, granularity: SeriesGranularity, year: number | null) {
  const params = {
    granularity,
    start_year: granularity === 'month' ? (year ?? undefined) : undefined,
    end_year: granularity === 'month' ? (year ?? undefined) : undefined,
    state: region.state ?? undefined,
    ibge_code: region.ibgeCode ?? undefined,
    biome: region.biome ?? undefined,
  };

  return useQuery({
    queryKey: queryKeys.analytics.history(params),
    queryFn: async (): Promise<HotspotSeries> => {
      const response = await apiClient.get('/api/v1/anomalies/history', { params });
      return HotspotSeriesSchema.parse(response.data);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 30,
  });
}
