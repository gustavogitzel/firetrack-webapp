import { useAtom } from 'jotai';
import { Layers, Map as MapIcon, Satellite, Sun, X, Check } from 'lucide-react';
import {
  baseMapStyleAtom,
  enableClusteringAtom,
  enableHeatmapAtom,
  enableRegionRiskMapAtom,
  type BaseMapStyle,
} from '@/state/filters.atoms';
import { activeViewAtom } from '@/state/navigation.atoms';

export function MapLayersPanel() {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const [baseMapStyle, setBaseMapStyle] = useAtom(baseMapStyleAtom);
  const [enableClustering, setEnableClustering] = useAtom(enableClusteringAtom);
  const [enableHeatmap, setEnableHeatmap] = useAtom(enableHeatmapAtom);
  const [enableRegionRiskMap, setEnableRegionRiskMap] = useAtom(enableRegionRiskMapAtom);

  const isOpen = activeView === 'layers';

  if (!isOpen) return null;

  const basemaps: { id: BaseMapStyle; label: string; desc: string; icon: any }[] = [
    {
      id: 'dark',
      label: 'Dark Matter (Noite / Alto Contraste)',
      desc: 'Destaca anomalias térmicas e focos com brilho máximo',
      icon: <MapIcon className="w-4 h-4 text-red-400" />,
    },
    {
      id: 'satellite',
      label: 'Satélite & Imagem Espacial',
      desc: 'Textura de terreno real e manchas de desmatamento/queimada',
      icon: <Satellite className="w-4 h-4 text-sky-400" />,
    },
    {
      id: 'streets',
      label: 'Topográfico / Estradas',
      desc: 'Limites municipais, rodovias e hidrografia detalhada',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
    },
  ];

  return (
    <div className="absolute top-0 right-0 z-20 h-full w-full max-w-md bg-neutral-950/85 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col">
      {/* Panel Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Camadas & Sensores</h3>
            <p className="text-xs text-white/50">Personalize o mapa e visualização espacial</p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('map')}
          className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {/* Basemap Styles */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-white/50">
            Estilo do Mapa Base
          </h4>
          <div className="space-y-2">
            {basemaps.map((bm) => {
              const isSelected = baseMapStyle === bm.id;
              return (
                <button
                  key={bm.id}
                  onClick={() => setBaseMapStyle(bm.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 mt-0.5">
                    {bm.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{bm.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{bm.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spatial Display Options */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-white/50">
            Agrupamento & Visualização Espacial
          </h4>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            {/* Region Risk Map Toggle (Choropleth) */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">
                  Mapa de Risco por Região / Estado
                </span>
                <span className="text-xs text-white/40 block mt-0.5">
                  Colore os limites territoriais em Verde/Amarelo/Laranja/Vermelho.
                </span>
              </div>
              <button
                onClick={() => setEnableRegionRiskMap(!enableRegionRiskMap)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enableRegionRiskMap ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enableRegionRiskMap ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Cluster Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div>
                <span className="text-sm font-bold text-white block">
                  Clusterizar Focos (Zoom)
                </span>
                <span className="text-xs text-white/40 block mt-0.5">
                  Agrupa focos próximos dinamicamente conforme o zoom do mapa.
                </span>
              </div>
              <button
                onClick={() => setEnableClustering(!enableClustering)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enableClustering ? 'bg-red-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enableClustering ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Heatmap Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div>
                <span className="text-sm font-bold text-white block">
                  Modo Brilho de Calor (Heatmap)
                </span>
                <span className="text-xs text-white/40 block mt-0.5">
                  Destaca a densidade radiativa (FRP MW) de queimadas.
                </span>
              </div>
              <button
                onClick={() => setEnableHeatmap(!enableHeatmap)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enableHeatmap ? 'bg-orange-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enableHeatmap ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Satellites Source Legend */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-white/50">
            Satélites de Sensoriamento Ativo
          </h4>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            {[
              { name: 'GOES-19 (Geostação NOAA)', res: 'Geostacionário • 10-15 min', status: 'Ativo' },
              { name: 'VIIRS (NOAA-20 / Suomi-NPP)', res: 'Resolução 375m • Alta Precisão', status: 'Ativo' },
              { name: 'MODIS (Terra / Aqua NASA)', res: 'Resolução 1km • Histórico', status: 'Ativo' },
              { name: 'BDQueimadas INPE', res: 'Monitoramento Nacional Brasil', status: 'Ativo' },
            ].map((sat) => (
              <div key={sat.name} className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{sat.name}</span>
                  <span className="text-white/40 text-[10px] block">{sat.res}</span>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {sat.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
