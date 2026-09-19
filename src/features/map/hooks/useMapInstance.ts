import { createContext, useContext } from 'react';
import type { Map as MapInstance } from 'maplibre-gl';

export const MapContext = createContext<MapInstance | null>(null);

/**
 * Access the MapLibre GL instance from anywhere within the MapViewport tree.
 * Returns null if the map hasn't been initialized yet.
 */
export function useMapInstance(): MapInstance | null {
  return useContext(MapContext);
}
