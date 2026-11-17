import { atom } from 'jotai';
import type { Biome, BrazilState } from './filters.atoms';

export interface AnalyticsRegion {
  state: BrazilState | null;
  ibgeCode: string | null;
  biome: Biome | null;
}

export type SeriesGranularity = 'month' | 'year';

export const analyticsRegionAtom = atom<AnalyticsRegion>({ state: null, ibgeCode: null, biome: null });
export const seriesGranularityAtom = atom<SeriesGranularity>('month');
export const seriesYearAtom = atom<number | null>(null);
export const causesYearAtom = atom<number | null>(null);
