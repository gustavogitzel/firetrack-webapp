import Map, { Source, Layer } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapContext } from '../hooks/useMapInstance';
import { useState, useCallback } from 'react';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { selectedEventIdAtom } from '@/state/selection.atoms';
import { useFireEventsQuery } from '@/features/telemetry/api/useFireEventsQuery';
import { toGeoJsonFeatureCollection } from '@/features/spatial/utils/geojson-transformers';
import { MapOverlay } from '@/features/dashboard/components/MapOverlay';
import { FireEventDetailPanel } from '@/features/dashboard/components/FireEventDetailPanel';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';

export function MapPage() {
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [, setSelectedEventId] = useAtom(selectedEventIdAtom);

  const { data: fireEvents } = useFireEventsQuery();

  const geojsonData = useMemo(() => {
    if (!fireEvents) return null;
    return toGeoJsonFeatureCollection(fireEvents);
  }, [fireEvents]);

  const handleFireEventClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const eventId = feature.properties?.id as string;
        if (eventId) {
          setSelectedEventId(eventId);
        }
      }
    },
    [setSelectedEventId],
  );

  const interactiveLayerIds = useMemo(() => ['fire-events-layer'], []);

  return (
    <MapContext.Provider value={mapInstance}>
      <div className="relative w-screen h-screen overflow-hidden bg-neutral-950">
        <MapOverlay />
        <FireEventDetailPanel />
        <Map
          mapLib={maplibregl as any}
          initialViewState={{
            longitude: -50,
            latitude: -15,
            zoom: 4,
            pitch: 0,
            bearing: 0
          }}
          style={{ width: '100vw', height: '100vh' }}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          dragPan={true}
          scrollZoom={true}
          onLoad={(e) => setMapInstance(e.target)}
          onClick={handleFireEventClick}
          interactiveLayerIds={interactiveLayerIds}
          cursor="pointer"
        >
          {geojsonData && (
            <Source id="fire-events" type="geojson" data={geojsonData}>
              {/* Outer Glow */}
              <Layer
                id="fire-events-glow"
                type="circle"
                paint={{
                  'circle-color': '#ef4444',
                  'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    4, 8,
                    10, 24
                  ],
                  'circle-opacity': 0.3,
                  'circle-blur': 1
                }}
              />
              {/* Core Point */}
              <Layer
                id="fire-events-layer"
                type="circle"
                paint={{
                  'circle-color': '#f87171',
                  'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    4, 3,
                    10, 6
                  ],
                  'circle-opacity': 0.9,
                  'circle-stroke-width': 1,
                  'circle-stroke-color': '#ffffff'
                }}
              />
            </Source>
          )}
        </Map>
      </div>
    </MapContext.Provider>
  );
}
