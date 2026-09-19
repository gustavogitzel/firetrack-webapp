import type { FireEventSummary } from '@/features/telemetry/schemas/telemetry.schema';

/**
 * Transforms an array of FireEventSummary into a GeoJSON FeatureCollection
 * suitable for the MapLibre GeoJSON source.
 */
export function toGeoJsonFeatureCollection(
  events: FireEventSummary[],
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: events.map((event) => ({
      type: 'Feature' as const,
      id: event.id,
      geometry: {
        type: 'Point' as const,
        coordinates: [event.centroid.longitude, event.centroid.latitude],
      },
      properties: {
        id: event.id,
        status: event.status,
        municipality: event.municipality,
        state: event.state,
        anomaly_count: event.anomaly_count,
        max_frp: event.max_frp ?? 0,
        total_frp: event.total_frp ?? 0,
        satellites: event.satellites ?? [],
        primary_satellite: event.satellites?.[0] ?? null,
        first_detected_at: event.first_detected_at,
        last_detected_at: event.last_detected_at,
      },
    })),
  };
}
