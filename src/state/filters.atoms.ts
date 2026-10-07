import { atom } from 'jotai';

export const timeWindowHoursAtom = atom<number>(24);

export const minFrpFilterAtom = atom<number>(0);

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
}));
