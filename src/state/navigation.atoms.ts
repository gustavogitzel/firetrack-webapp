import { atom } from 'jotai';

export type ViewMode = 'overview' | 'satellites' | 'weather' | 'forecast';

export const activeViewAtom = atom<ViewMode>('overview');
