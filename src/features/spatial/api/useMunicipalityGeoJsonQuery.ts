import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/lib/api-client';
import { queryKeys } from '@/core/lib/query-keys';

export function useMunicipalityGeoJsonQuery(ibgeCode: number | null) {
  return useQuery({
    queryKey: queryKeys.spatial.municipality(ibgeCode!),
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/v1/spatial/municipalities/${ibgeCode}/geojson`,
      );
      return response.data as GeoJSON.FeatureCollection;
    },
    enabled: !!ibgeCode,
    staleTime: 1000 * 60 * 60, // Municipal boundaries are static — cache 1h
  });
}
