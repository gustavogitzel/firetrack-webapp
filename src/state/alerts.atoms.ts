import { atom } from 'jotai';

export interface WatchZoneConfig {
  states: string[]; // e.g. ['PA', 'MT', 'AM', 'RO']
  minFrpThreshold: number; // e.g. 80
  audioEnabled: boolean;
}

export const watchZoneConfigAtom = atom<WatchZoneConfig>({
  states: ['PA', 'MT', 'AM'],
  minFrpThreshold: 80,
  audioEnabled: true,
});

export const activeAlertsCountAtom = atom<number>(0);
