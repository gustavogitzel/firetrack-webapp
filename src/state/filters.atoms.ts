import { atom } from 'jotai';

export const timeWindowHoursAtom = atom<number>(24);

export interface DateRange {
  start: string;
  end: string;
}

export const dateRangeAtom = atom<DateRange | null>(null);

export const selectTimeWindowAtom = atom(null, (_get, set, hours: number) => {
  set(timeWindowHoursAtom, hours);
  set(dateRangeAtom, null);
});

export const minFrpFilterAtom = atom<number>(0);

export const BIOMES = ['Amazônia', 'Caatinga', 'Cerrado', 'Mata Atlântica', 'Pampa', 'Pantanal'] as const;
export type Biome = (typeof BIOMES)[number];

export const biomeFilterAtom = atom<Biome | null>(null);

export const BRAZIL_STATES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA',
  'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const;
export type BrazilState = (typeof BRAZIL_STATES)[number];

export const stateFilterAtom = atom<BrazilState | null>(null);
export const municipalityFilterAtom = atom<string>('');
export const satelliteFilterAtom = atom<string | null>(null);

export type MapDisplayMode = 'events' | 'hotspots';

export const mapDisplayModeAtom = atom<MapDisplayMode>('events');

export const HOTSPOTS_MAX_HOURS = 72;

export type BaseMapStyle = 'dark' | 'satellite' | 'streets';

export const baseMapStyleAtom = atom<BaseMapStyle>('dark');
export const enableClusteringAtom = atom<boolean>(true);
export const enableHeatmapAtom = atom<boolean>(false);
export const enableRegionRiskMapAtom = atom<boolean>(false);
export const searchFilterAtom = atom<string>('');

export interface TelemetryFilters {
  hours: number;
  dateRange: DateRange | null;
  minFrp: number;
  minAnomalies: number;
  biome: Biome | null;
  state: BrazilState | null;
  municipality: string;
  satellite: string | null;
}

/** Derived atom: consolidates filters for injection into React Query hooks */
export const telemetryFiltersAtom = atom<TelemetryFilters>((get) => ({
  hours: get(timeWindowHoursAtom),
  dateRange: get(dateRangeAtom),
  minFrp: get(minFrpFilterAtom),
  minAnomalies: 1,
  biome: get(biomeFilterAtom),
  state: get(stateFilterAtom),
  municipality: get(municipalityFilterAtom),
  satellite: get(satelliteFilterAtom),
}));

export const clearMapFiltersAtom = atom(null, (_get, set) => {
  set(dateRangeAtom, null);
  set(biomeFilterAtom, null);
  set(stateFilterAtom, null);
  set(municipalityFilterAtom, '');
  set(satelliteFilterAtom, null);
});
