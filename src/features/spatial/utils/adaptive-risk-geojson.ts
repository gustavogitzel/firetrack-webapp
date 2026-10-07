import type { FireEventSummary } from '@/features/telemetry/schemas/telemetry.schema';

/**
 * Generates an Adaptive Spatial Risk Grid (Choropleth Cells)
 * that dynamically refines based on map zoom level.
 * 
 * Low zoom (0-6): 1.5° grid cells (regional view)
 * Mid zoom (7-9): 0.5° grid cells (state/county view)
 * High zoom (10+): 0.15° grid cells (local municipal view)
 */
export function toAdaptiveRiskGeoJson(
  events: FireEventSummary[],
  currentZoom: number = 4.5,
): GeoJSON.FeatureCollection {
  if (!events || events.length === 0) {
    return { type: 'FeatureCollection', features: [] };
  }

  // Determine grid cell step size based on zoom level
  let step = 1.5; // default regional step
  if (currentZoom >= 10) {
    step = 0.12; // fine municipal detail
  } else if (currentZoom >= 7) {
    step = 0.4;  // county detail
  }

  const gridMap: Record<string, { count: number; maxFrp: number; lat: number; lng: number }> = {};

  for (const ev of events) {
    const cellLng = Math.floor(ev.centroid.longitude / step) * step;
    const cellLat = Math.floor(ev.centroid.latitude / step) * step;
    const key = `${cellLng.toFixed(3)},${cellLat.toFixed(3)}`;

    if (!gridMap[key]) {
      gridMap[key] = { count: 0, maxFrp: 0, lat: cellLat, lng: cellLng };
    }

    gridMap[key].count += ev.anomaly_count || 1;
    gridMap[key].maxFrp = Math.max(gridMap[key].maxFrp, ev.max_frp ?? 0);
  }

  const features: GeoJSON.Feature[] = Object.entries(gridMap).map(([key, data]) => {
    const minLng = data.lng;
    const maxLng = data.lng + step;
    const minLat = data.lat;
    const maxLat = data.lat + step;

    // Determine risk color based on density & FRP
    const count = data.count;
    const frp = data.maxFrp;

    let riskColor = '#22c55e'; // Green (Baixo)
    let riskLabel = 'Baixo';

    if (count >= 20 || frp > 90) {
      riskColor = '#b91c1c'; // Crimson (Crítico)
      riskLabel = 'Crítico';
    } else if (count >= 10 || frp > 50) {
      riskColor = '#ef4444'; // Red (Alto)
      riskLabel = 'Alto';
    } else if (count >= 4 || frp > 20) {
      riskColor = '#f97316'; // Orange (Moderado-Alto)
      riskLabel = 'Moderado-Alto';
    } else if (count >= 1) {
      riskColor = '#eab308'; // Yellow (Moderado)
      riskLabel = 'Moderado';
    }

    // Polygon ring coordinates
    const polygon = [
      [minLng, minLat],
      [maxLng, minLat],
      [maxLng, maxLat],
      [minLng, maxLat],
      [minLng, minLat],
    ];

    return {
      type: 'Feature',
      id: key,
      geometry: {
        type: 'Polygon',
        coordinates: [polygon],
      },
      properties: {
        count: count,
        max_frp: frp,
        risk_color: riskColor,
        risk_label: riskLabel,
      },
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}
