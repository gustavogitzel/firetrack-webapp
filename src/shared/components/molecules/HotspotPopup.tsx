import { Popup } from 'react-map-gl/maplibre';
import { ArrowRight, Clock, Leaf, MapPin, X } from 'lucide-react';
import type { HotspotProperties } from '@/features/telemetry/schemas/telemetry.schema';
import {
  CONFIDENCE_LABELS,
  HOTSPOT_SOURCE_COLORS,
  HOTSPOT_SOURCE_LABELS,
  formatDateTime,
} from '@/features/telemetry/utils/hotspot-labels';

interface HotspotPopupProps {
  longitude: number;
  latitude: number;
  properties: HotspotProperties;
  onClose: () => void;
  onOpenEvent: (eventId: string) => void;
}

export function HotspotPopup({ longitude, latitude, properties, onClose, onOpenEvent }: HotspotPopupProps) {
  const color = HOTSPOT_SOURCE_COLORS[properties.source] ?? '#ffffff';
  const location = properties.municipality
    ? `${properties.municipality}${properties.state ? ` (${properties.state})` : ''}`
    : null;
  const confidence = properties.confidence
    ? (CONFIDENCE_LABELS[properties.confidence] ?? properties.confidence)
    : null;

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      onClose={onClose}
      closeOnClick={false}
      closeButton={false}
      offset={12}
      maxWidth="280px"
      className="firetrack-popup"
    >
      <div className="w-64 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl text-white overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
            />
            <span className="text-xs font-extrabold tracking-wide">
              {HOTSPOT_SOURCE_LABELS[properties.source] ?? properties.source}
            </span>
            <span className="text-[10px] font-semibold text-white/50 truncate">{properties.satellite}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-3.5 py-3 space-y-2 text-[11px] text-white/70">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />
            <span>{formatDateTime(properties.detected_at)}</span>
          </div>
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <span>{location}</span>
            </div>
          )}
          {properties.biome && (
            <div className="flex items-center gap-2">
              <Leaf className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <span>{properties.biome}</span>
            </div>
          )}

          {(confidence || properties.frp != null) && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {confidence && (
                <div className="rounded-xl bg-white/5 border border-white/5 px-2.5 py-1.5">
                  <span className="block text-[9px] font-extrabold uppercase tracking-widest text-white/40">
                    Confiança
                  </span>
                  <span className="text-xs font-bold text-white">{confidence}</span>
                </div>
              )}
              {properties.frp != null && (
                <div className="rounded-xl bg-white/5 border border-white/5 px-2.5 py-1.5">
                  <span className="block text-[9px] font-extrabold uppercase tracking-widest text-white/40">
                    FRP
                  </span>
                  <span className="text-xs font-bold text-white">
                    {properties.frp.toFixed(1)} <span className="text-white/40 font-semibold">MW</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {properties.fire_event_id && (
          <button
            onClick={() => onOpenEvent(properties.fire_event_id!)}
            className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 border-t border-white/10 bg-red-500/10 text-red-400 text-[11px] font-bold hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            Ver evento de incêndio
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </Popup>
  );
}
