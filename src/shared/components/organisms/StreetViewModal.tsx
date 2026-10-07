import { useAtom } from 'jotai';
import { Camera, ExternalLink, MapPin, X, Globe } from 'lucide-react';
import { streetViewTargetAtom } from '@/state/selection.atoms';

export function StreetViewModal() {
  const [target, setTarget] = useAtom(streetViewTargetAtom);

  if (!target) return null;

  const googlePanoUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${target.latitude},${target.longitude}`;
  const google3dUrl = `https://www.google.com/maps/@${target.latitude},${target.longitude},600m/data=!3m1!1e3`;
  const googleEmbedUrl = `https://maps.google.com/maps?q=${target.latitude},${target.longitude}&t=k&z=17&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in select-none">
      {/* Container */}
      <div className="relative w-full max-w-4xl h-[85vh] max-h-[720px] bg-neutral-950/95 backdrop-blur-3xl border border-white/15 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Visão de Chão & Imagem de Terreno 360°
                </h3>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Alta Resolução
                </span>
              </div>
              <p className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>{target.locationName ?? 'Localização de Foco'}</span>
                <span className="font-mono text-white/40">
                  ({target.latitude.toFixed(5)}, {target.longitude.toFixed(5)})
                </span>
              </p>
            </div>
          </div>

          {/* Quick External Actions */}
          <div className="flex items-center gap-2">
            <a
              href={googlePanoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-bold transition-all shadow-md"
            >
              <span>Google Street View 360°</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setTarget(null)}
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="relative flex-1 bg-black overflow-hidden">
          <iframe
            title="Google Satellite 3D Terrain"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={googleEmbedUrl}
            className="w-full h-full border-none"
          />

          {/* Floating Notice Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/15 text-xs text-white">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-white/80">
                Visualização orbital de alta definição. Abra no Street View 360° para fotografias de solo:
              </span>
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href={googlePanoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-extrabold flex items-center gap-1.5 transition-all shadow-lg text-[11px]"
              >
                <span>Abrir Street View 360° HD</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={google3dUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 transition-all border border-white/20 text-[11px]"
              >
                <span>Google Earth 3D ↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
