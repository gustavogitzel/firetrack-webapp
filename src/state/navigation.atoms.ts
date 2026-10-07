import { atom } from 'jotai';

export type ViewMode = 'map' | 'incidents' | 'weather' | 'alerts' | 'layers' | 'analytics' | 'sync';

export const activeViewAtom = atom<ViewMode>('map');
export const sidebarCollapsedAtom = atom<boolean>(false);
