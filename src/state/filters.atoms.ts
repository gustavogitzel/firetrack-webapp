import { atom } from 'jotai';

export const timeWindowHoursAtom = atom<number>(24);

export const minFrpFilterAtom = atom<number>(0);

/** Derived atom: consolidates filters for injection into React Query hooks */
export const telemetryFiltersAtom = atom((get) => ({
  hours: get(timeWindowHoursAtom),
  minFrp: get(minFrpFilterAtom),
  minAnomalies: 1,
}));
