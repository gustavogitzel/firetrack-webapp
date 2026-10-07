import { atom } from 'jotai';

export const selectedEventIdAtom = atom<string | null>(null);

export const mapFlyToTargetAtom = atom<{
  latitude: number;
  longitude: number;
  zoom?: number;
  pitch?: number;
  bearing?: number;
} | null>(null);

export const streetViewTargetAtom = atom<{
  latitude: number;
  longitude: number;
  locationName?: string;
} | null>(null);
