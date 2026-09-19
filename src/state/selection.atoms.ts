import { atom } from 'jotai';

export const selectedEventIdAtom = atom<string | null>(null);

export const hoveredClusterIdAtom = atom<string | null>(null);
