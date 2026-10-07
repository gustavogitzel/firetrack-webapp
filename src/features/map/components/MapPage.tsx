import Map, { Source, Layer, type MapLayerMouseEvent } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Loader2 } from 'lucide-react';
import { MapContext } from '../hooks/useMapInstance';
import { selectedEventIdAtom, mapFlyToTargetAtom } from '@/state/selection.atoms';
import {
  baseMapStyleAtom,
  enableClusteringAtom,
  enableHeatmapAtom,
  enableRegionRiskMapAtom,
} from '@/state/filters.atoms';
import { useFireEventsQuery } from '@/features/telemetry/api/useFireEventsQuery';
import { toGeoJsonFeatureCollection } from '@/features/spatial/utils/geojson-transformers';
import { toAdaptiveRiskGeoJson } from '@/features/spatial/utils/adaptive-risk-geojson';
import { Sidebar } from '@/shared/components/organisms/Sidebar';
import { MapOverlay } from '@/shared/components/organisms/MapOverlay';
import { FireEventDetailPanel } from '@/shared/components/organisms/FireEventDetailPanel';
import { IncidentsListPanel } from '@/shared/components/organisms/IncidentsListPanel';
import { MapLayersPanel } from '@/shared/components/organisms/MapLayersPanel';
import { AnalyticsPanel } from '@/shared/components/organisms/AnalyticsPanel';
import { SyncControlPanel } from '@/shared/components/organisms/SyncControlPanel';
import { StreetViewModal } from '@/shared/components/organisms/StreetViewModal';
import { WeatherRiskPanel } from '@/shared/components/organisms/WeatherRiskPanel';
import { AlertsHubPanel } from '@/shared/components/organisms/AlertsHubPanel';
import { TimelineScroller } from '@/shared/components/organisms/TimelineScroller';

// 1. Dark Matter (Carto)
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// 2. Satellite (Esri World Imagery Raster)
const SATELLITE_STYLE: any = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [
    {
      id: 'background-base',
      type: 'background',
      paint: {
        'background-color': '#09090b',
      },
    },
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-fade-duration': 300,
      },
    },
  ],
};

// 3. Topographic / Outdoors (OpenTopoMap Raster)
const TOPO_STYLE: any = {
  version: 8,
  sources: {
    'opentopomap': {
      type: 'raster',
      tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: 'Map data © OpenStreetMap contributors, SRTM | Map style © OpenTopoMap',
    },
  },
  layers: [
    {
      id: 'background-base',
      type: 'background',
      paint: {
        'background-color': '#09090b',
      },
    },
    {
      id: 'opentopomap-layer',
      type: 'raster',
      source: 'opentopomap',
      minzoom: 0,
      maxzoom: 17,
      paint: {
        'raster-fade-duration': 300,
      },
    },
  ],
};

const MAP_STYLES: Record<string, any> = {
  dark: DARK_STYLE,
  satellite: SATELLITE_STYLE,
  streets: TOPO_STYLE,
};

export function MapPage() {
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const [isTilesLoading, setIsTilesLoading] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(4.5);
  const [, setSelectedEventId] = useAtom(selectedEventIdAtom);
  const [flyToTarget, setFlyToTarget] = useAtom(mapFlyToTargetAtom);

  const [baseMapStyle] = useAtom(baseMapStyleAtom);
  const [enableClustering] = useAtom(enableClusteringAtom);
  const [enableHeatmap] = useAtom(enableHeatmapAtom);
  const [enableRegionRiskMap] = useAtom(enableRegionRiskMapAtom);

  const { data: fireEvents } = useFireEventsQuery();

  const geojsonData = useMemo(() => {
    if (!fireEvents) return null;
    return toGeoJsonFeatureCollection(fireEvents);
  }, [fireEvents]);

  const stateRiskGeoJson = useMemo(() => {
    if (!fireEvents) return null;
    return toAdaptiveRiskGeoJson(fireEvents, currentZoom);
  }, [fireEvents, currentZoom]);

  // Handle map flyTo when a location target is set
  useEffect(() => {
    if (flyToTarget && mapInstance) {
      mapInstance.flyTo({
        center: [flyToTarget.longitude, flyToTarget.latitude],
        zoom: flyToTarget.zoom ?? 9,
        pitch: flyToTarget.pitch ?? 0,
        bearing: flyToTarget.bearing ?? 0,
        duration: 1800,
        essential: true,
      });
      // Clear target after flying
      setFlyToTarget(null);
    }
  }, [flyToTarget, mapInstance, setFlyToTarget]);

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0];
      const clusterId = feature.properties?.cluster_id;

      // Handle Cluster Click -> Zoom in
      if (clusterId !== undefined && mapInstance) {
        const source: any = mapInstance.getSource('fire-events');
        if (source && typeof source.getClusterExpansionZoom === 'function') {
          source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return;
            const geom = feature.geometry as GeoJSON.Point;
            mapInstance.easeTo({
              center: geom.coordinates as [number, number],
              zoom: zoom + 0.5,
              duration: 600,
            });
          });
        }
        return;
      }

      // Handle Individual Point Click -> Select Event
      const eventId = feature.properties?.id as string;
      if (eventId) {
        setSelectedEventId(eventId);
      }
    },
    [mapInstance, setSelectedEventId],
  );

  const interactiveLayerIds = useMemo(() => {
    const ids = ['unclustered-fire-point'];
    if (enableClustering) {
      ids.push('fire-clusters');
    }
    return ids;
  }, [enableClustering]);

  return (
    <MapContext.Provider value={mapInstance}>
      <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 flex">
        {/* Atomic Design Sidebar */}
        <Sidebar />

        {/* Map Container */}
        <div className="relative flex-1 h-full overflow-hidden bg-neutral-950">
          {/* Top Center Tile Loading Indicator */}
          {isTilesLoading && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/70 backdrop-blur-2xl border border-white/15 text-white shadow-2xl transition-all duration-300 pointer-events-none select-none">
              <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
              <span className="text-xs font-bold tracking-wide">
                Carregando mapa & camada orbital...
              </span>
            </div>
          )}

          {/* Map Overlay HUD */}
          <MapOverlay />
          <TimelineScroller />

          {/* Side Drawer Panels */}
          <IncidentsListPanel />
          <WeatherRiskPanel />
          <AlertsHubPanel />
          <MapLayersPanel />
          <AnalyticsPanel />
          <SyncControlPanel />
          <FireEventDetailPanel />
          <StreetViewModal />

          {/* MapLibre GL Map */}
          <Map
            mapLib={maplibregl as any}
            initialViewState={{
              longitude: -52,
              latitude: -11,
              zoom: 4.5,
              pitch: 0,
              bearing: 0,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLES[baseMapStyle]}
            dragPan={true}
            scrollZoom={true}
            onLoad={(e) => {
              setMapInstance(e.target);
              try {
                // Enable tile cache for smoother zooming
                (e.target as any).setMaxTileCacheSize?.(150);
              } catch (_) {}
            }}
            onRender={(e) => {
              const isLoaded = e.target.areTilesLoaded();
              if (!isLoaded && !isTilesLoading) {
                setIsTilesLoading(true);
              } else if (isLoaded && isTilesLoading) {
                setIsTilesLoading(false);
              }
            }}
            onIdle={() => setIsTilesLoading(false)}
            onZoomEnd={(e) => setCurrentZoom(e.target.getZoom())}
            onClick={handleMapClick}
            interactiveLayerIds={interactiveLayerIds}
            cursor="pointer"
          >
            {/* 0. Region Risk Choropleth Fill Layer (Green/Yellow/Orange/Red State Polygons) */}
            {enableRegionRiskMap && stateRiskGeoJson && (
              <Source id="state-risk-polygons" type="geojson" data={stateRiskGeoJson}>
                <Layer
                  id="state-risk-fill"
                  type="fill"
                  paint={{
                    'fill-color': ['get', 'risk_color'],
                    'fill-opacity': 0.38,
                  }}
                />
                <Layer
                  id="state-risk-border"
                  type="line"
                  paint={{
                    'line-color': ['get', 'risk_color'],
                    'line-width': 1.8,
                    'line-opacity': 0.7,
                  }}
                />
              </Source>
            )}

            {geojsonData && (
              <Source
                key={`fire-events-src-${enableClustering ? 'clustered' : 'unclustered'}`}
                id="fire-events"
                type="geojson"
                data={geojsonData}
                cluster={enableClustering}
                clusterMaxZoom={14}
                clusterRadius={50}
              >
                {/* 1. Heatmap Layer - Proportional Geographic Density */}
                {enableHeatmap && (
                  <Layer
                    id="fire-heatmap"
                    type="heatmap"
                    paint={{
                      'heatmap-weight': [
                        'interpolate',
                        ['linear'],
                        ['get', 'anomaly_count'],
                        1, 0.2,
                        10, 0.6,
                        50, 1.2
                      ],
                      'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 1,
                        6, 1.8,
                        10, 3.0
                      ],
                      'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(0, 0, 0, 0)',
                        0.15, 'rgba(34, 197, 94, 0.7)',   // Lime Green
                        0.4, 'rgba(234, 179, 8, 0.85)',   // Bright Yellow
                        0.65, 'rgba(249, 115, 22, 0.95)', // Vivid Orange
                        0.85, 'rgba(239, 68, 68, 1)',     // Bright Red
                        1, 'rgba(153, 27, 27, 1)'        // Dark Crimson Red
                      ],
                      'heatmap-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 8,
                        4, 14,
                        8, 22,
                        12, 32
                      ],
                      'heatmap-opacity': 0.85
                    }}
                  />
                )}

                {/* 2. Cluster Circles Layer */}
                {enableClustering && (
                  <Layer
                    id="fire-clusters"
                    type="circle"
                    filter={['has', 'point_count']}
                    paint={{
                      'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        '#f97316', // Orange for small clusters (<5)
                        5,
                        '#ef4444', // Bright Red for medium clusters (5-20)
                        20,
                        '#b91c1c'  // Deep Red/Crimson for large clusters (>20)
                      ],
                      'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        16,
                        5,
                        22,
                        20,
                        30
                      ],
                      'circle-stroke-width': 2,
                      'circle-stroke-color': '#ffffff',
                      'circle-opacity': enableHeatmap ? 0.4 : 0.9,
                    }}
                  />
                )}

                {/* 3. Cluster Count Text Layer */}
                {enableClustering && (
                  <Layer
                    id="fire-cluster-count"
                    type="symbol"
                    filter={['has', 'point_count']}
                    layout={{
                      'text-field': '{point_count_abbreviated}',
                      'text-size': 12,
                      'text-allow-overlap': true,
                    }}
                    paint={{
                      'text-color': '#ffffff',
                    }}
                  />
                )}

                {/* 4. Unclustered Point Outer Glow */}
                <Layer
                  id="unclustered-fire-glow"
                  type="circle"
                  filter={['!', ['has', 'point_count']]}
                  paint={{
                    'circle-color': '#ef4444',
                    'circle-radius': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      4, 8,
                      10, 24
                    ],
                    'circle-opacity': enableHeatmap ? 0.2 : 0.35,
                    'circle-blur': 1,
                  }}
                />

                {/* 5. Unclustered Point Core */}
                <Layer
                  id="unclustered-fire-point"
                  type="circle"
                  filter={['!', ['has', 'point_count']]}
                  paint={{
                    'circle-color': '#f87171',
                    'circle-radius': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      4, 4,
                      10, 8
                    ],
                    'circle-opacity': enableHeatmap ? 0.5 : 0.95,
                    'circle-stroke-width': 1.5,
                    'circle-stroke-color': '#ffffff',
                  }}
                />
              </Source>
            )}
          </Map>
        </div>
      </div>
    </MapContext.Provider>
  );
}
