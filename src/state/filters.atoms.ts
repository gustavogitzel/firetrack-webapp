import { atom } from 'jotai';

export const timeWindowHoursAtom = atom<number>(24);

export const minFrpFilterAtom = atom<number>(0);

export const BIOMES = ['Amazônia', 'Caatinga', 'Cerrado', 'Mata Atlântica', 'Pampa', 'Pantanal'] as const;
export type Biome = (typeof BIOMES)[number];

export const biomeFilterAtom = atom<Biome | null>(null);

export type MapDisplayMode = 'events' | 'hotspots';

export const mapDisplayModeAtom = atom<MapDisplayMode>('events');

export const HOTSPOTS_MAX_HOURS = 72;

export type BaseMapStyle = 'dark' | 'satellite' | 'streets';

export const baseMapStyleAtom = atom<BaseMapStyle>('dark');
export const enableClusteringAtom = atom<boolean>(true);
export const enableHeatmapAtom = atom<boolean>(false);
export const enableRegionRiskMapAtom = atom<boolean>(false);
export const searchFilterAtom = atom<string>('');

/** Derived atom: consolidates filters for injection into React Query hooks */
export const telemetryFiltersAtom = atom((get) => ({
  hours: get(timeWindowHoursAtom),
  minFrp: get(minFrpFilterAtom),
  minAnomalies: 1,
  biome: get(biomeFilterAtom),
}));
