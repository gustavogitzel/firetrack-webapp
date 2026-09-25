import { atom } from 'jotai';

export type JourneyState = 'landing' | 'map';

export const currentJourneyAtom = atom<JourneyState>('landing');
