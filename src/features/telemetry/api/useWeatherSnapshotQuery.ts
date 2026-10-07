import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/lib/api-client';
import { WeatherSnapshotSchema, type WeatherSnapshot } from '../schemas/telemetry.schema';

export function useWeatherSnapshotQuery(lat?: number, lng?: number) {
  return useQuery({
    queryKey: ['weather', 'snapshot', lat, lng],
    queryFn: async (): Promise<WeatherSnapshot | null> => {
      if (lat == null || lng == null) {
        return null;
      }

      // Fetch directly from real backend API endpoint
      const response = await apiClient.get('/api/v1/weather/snapshot', {
        params: { lat, lon: lng },
      });

      const raw = WeatherSnapshotSchema.parse(response.data);

      return {
        ...raw,
        temperature_c: raw.temperature_2m ?? raw.temperature_c ?? null,
        relative_humidity_pct: raw.relative_humidity_2m ?? raw.relative_humidity_pct ?? null,
        wind_speed_kmh: raw.wind_speed_10m ?? raw.wind_speed_kmh ?? null,
        precipitation_mm: raw.precipitation_mm ?? null,
      };
    },
    enabled: lat != null && lng != null,
    staleTime: 1000 * 60 * 15,
  });
}
