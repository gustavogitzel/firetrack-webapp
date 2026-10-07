import type { FireEventSummary } from '@/features/telemetry/schemas/telemetry.schema';

/**
 * Simplified bounding polygon approximations for Brazilian States (UF).
 * Allows rendering a full Choropleth / Region Risk Map (Green/Yellow/Orange/Red).
 */
const STATE_BOUNDARIES: Record<string, number[][][]> = {
  PA: [[[-58, -9], [-46, -9], [-46, 2], [-58, 2], [-58, -9]]],
  MT: [[[-61, -18], [-50, -18], [-50, -7], [-61, -7], [-61, -18]]],
  AM: [[[-73, -10], [-56, -10], [-56, 2], [-73, 2], [-73, -10]]],
  RO: [[[-66, -13.5], [-60, -13.5], [-60, -8], [-66, -8], [-66, -13.5]]],
  MA: [[[-48, -10], [-41.5, -10], [-41.5, -1], [-48, -1], [-48, -10]]],
  MS: [[[-58, -24], [-51, -24], [-51, -17], [-58, -17], [-58, -24]]],
  BA: [[[-46.5, -18], [-37, -18], [-37, -8.5], [-46.5, -8.5], [-46.5, -18]]],
  TO: [[[-50.5, -13.5], [-45.5, -13.5], [-45.5, -5], [-50.5, -5], [-50.5, -13.5]]],
  GO: [[[-53, -19.5], [-46, -19.5], [-46, -12.5], [-53, -12.5], [-53, -19.5]]],
  SP: [[[-53, -25], [-44, -25], [-44, -19.5], [-53, -19.5], [-53, -25]]],
  MG: [[[-51, -23], [-40, -23], [-40, -14], [-51, -14], [-51, -23]]],
  PR: [[[-54.5, -26.5], [-48, -26.5], [-48, -22.5], [-54.5, -22.5], [-54.5, -26.5]]],
  RS: [[[-57.5, -33.8], [-49.5, -33.8], [-49.5, -27], [-57.5, -27], [-57.5, -33.8]]],
  SC: [[[-53.8, -29.3], [-48, -29.3], [-48, -26], [-53.8, -26], [-53.8, -29.3]]],
  RJ: [[[-44.5, -23.4], [-41, -23.4], [-41, -20.8], [-44.5, -20.8], [-44.5, -23.4]]],
  ES: [[[-41.8, -21.3], [-39.6, -21.3], [-39.6, -17.9], [-41.8, -17.9], [-41.8, -21.3]]],
  PI: [[[-46, -11], [-40.5, -11], [-40.5, -2.7], [-46, -2.7], [-46, -11]]],
  CE: [[[-41.4, -7.8], [-37.2, -7.8], [-37.2, -2.8], [-41.4, -2.8], [-41.4, -7.8]]],
  RN: [[[-38.6, -6.5], [-34.9, -6.5], [-34.9, -4.8], [-38.6, -4.8], [-38.6, -6.5]]],
  PB: [[[-38.8, -8.3], [-34.8, -8.3], [-34.8, -6], [-38.8, -6], [-38.8, -8.3]]],
  PE: [[[-41.4, -9.5], [-34.8, -9.5], [-34.8, -7.4], [-41.4, -7.4], [-41.4, -9.5]]],
  AL: [[[-38.2, -10.5], [-35.1, -10.5], [-35.1, -8.8], [-38.2, -8.8], [-38.2, -10.5]]],
  SE: [[[-38.2, -11.6], [-36.4, -11.6], [-36.4, -9.5], [-38.2, -9.5], [-38.2, -11.6]]],
  AP: [[[-54.8, -1.2], [-49.8, -1.2], [-49.8, 4.4], [-54.8, 4.4], [-54.8, -1.2]]],
  RR: [[[-64.8, -1.6], [-59.8, -1.6], [-59.8, 5.3], [-64.8, 5.3], [-64.8, -1.6]]],
  AC: [[[-74, -11.2], [-66.5, -11.2], [-66.5, -7.1], [-74, -7.1], [-74, -11.2]]],
  DF: [[[-48.3, -16.1], [-47.3, -16.1], [-47.3, -15.4], [-48.3, -15.4], [-48.3, -16.1]]],
};

export function toStateRiskGeoJson(events: FireEventSummary[]): GeoJSON.FeatureCollection {
  // Count fire events per state
  const stateCounts: Record<string, { count: number; maxFrp: number }> = {};
  for (const ev of events) {
    const st = ev.state ?? 'OUTROS';
    if (!stateCounts[st]) stateCounts[st] = { count: 0, maxFrp: 0 };
    stateCounts[st].count += 1;
    stateCounts[st].maxFrp = Math.max(stateCounts[st].maxFrp, ev.max_frp ?? 0);
  }

  const features: GeoJSON.Feature[] = Object.entries(STATE_BOUNDARIES).map(([st, coords]) => {
    const data = stateCounts[st] ?? { count: 0, maxFrp: 0 };
    const count = data.count;

    // Determine risk level color code:
    // 0: Green (#22c55e)
    // 1-3: Yellow (#eab308)
    // 4-8: Orange (#f97316)
    // 9+: Red (#ef4444)
    let riskColor = '#22c55e'; // Green (Low Risk)
    let riskLabel = 'Baixo';

    if (count >= 10) {
      riskColor = '#b91c1c'; // Crimson (Critical Risk)
      riskLabel = 'Crítico';
    } else if (count >= 5) {
      riskColor = '#ef4444'; // Red (High Risk)
      riskLabel = 'Alto';
    } else if (count >= 2) {
      riskColor = '#f97316'; // Orange (Moderate-High Risk)
      riskLabel = 'Moderado-Alto';
    } else if (count === 1) {
      riskColor = '#eab308'; // Yellow (Moderate Risk)
      riskLabel = 'Moderado';
    }

    return {
      type: 'Feature',
      id: st,
      geometry: {
        type: 'Polygon',
        coordinates: coords,
      },
      properties: {
        state: st,
        fire_count: count,
        max_frp: data.maxFrp,
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
