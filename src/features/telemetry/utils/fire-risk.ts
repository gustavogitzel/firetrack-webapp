export interface FireRiskResult {
  fwiScore: number;
  level: 'CRÍTICO' | 'MUITO ALTO' | 'ALTO' | 'MODERADO' | 'BAIXO';
  color: 'red' | 'orange' | 'amber' | 'emerald' | 'sky';
  description: string;
}

/**
 * Calculates simplified Fire Weather Index (FWI) propagation risk
 * based on temperature, relative humidity, wind speed, and FRP.
 */
export function calculateFireRisk(
  temperatureC?: number | null,
  humidityPct?: number | null,
  windKmh?: number | null,
  maxFrp?: number | null,
): FireRiskResult | null {
  if (temperatureC == null || humidityPct == null || windKmh == null) {
    return null;
  }

  const temp = temperatureC;
  const humidity = humidityPct;
  const wind = windKmh;
  const frp = maxFrp ?? 0;

  // Empirical FWI risk score calculation based strictly on real weather inputs
  const tempFactor = Math.max(0, temp - 20) * 1.5;
  const humidityFactor = Math.max(0, 100 - humidity) * 0.8;
  const windFactor = wind * 1.2;
  const frpFactor = Math.min(40, frp * 0.3);

  const fwiScore = tempFactor + humidityFactor + windFactor + frpFactor;

  if (fwiScore >= 110 || frp > 100 || (temp > 35 && humidity < 25)) {
    return {
      fwiScore: Math.round(fwiScore),
      level: 'CRÍTICO',
      color: 'red',
      description: 'Risco extremo de propagação rápida e salto de faíscas pelo vento.',
    };
  }

  if (fwiScore >= 85 || frp > 60) {
    return {
      fwiScore: Math.round(fwiScore),
      level: 'MUITO ALTO',
      color: 'orange',
      description: 'Alta intensidade radiativa e baixíssima umidade relativa do ar.',
    };
  }

  if (fwiScore >= 60) {
    return {
      fwiScore: Math.round(fwiScore),
      level: 'ALTO',
      color: 'amber',
      description: 'Condições favoráveis para propagação de incêndio florestal.',
    };
  }

  if (fwiScore >= 35) {
    return {
      fwiScore: Math.round(fwiScore),
      level: 'MODERADO',
      color: 'emerald',
      description: 'Condições moderadas de queimada sob monitoramento.',
    };
  }

  return {
    fwiScore: Math.round(fwiScore),
    level: 'BAIXO',
    color: 'sky',
    description: 'Baixo risco de expansão rápida no momento.',
  };
}
