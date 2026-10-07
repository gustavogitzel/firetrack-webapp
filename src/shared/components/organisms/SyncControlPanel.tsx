import { useAtom } from 'jotai';
import { RefreshCw, Database, Radio, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useTriggerNasaSyncMutation } from '@/features/ingestion/api/useTriggerNasaSyncMutation';
import { useTriggerInpeSyncMutation } from '@/features/ingestion/api/useTriggerInpeSyncMutation';
import { activeViewAtom } from '@/state/navigation.atoms';

export function SyncControlPanel() {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const nasaMutation = useTriggerNasaSyncMutation();
  const inpeMutation = useTriggerInpeSyncMutation();

  const isOpen = activeView === 'sync';

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 z-20 h-full w-full max-w-md bg-neutral-950/85 backdrop-blur-3xl border-l border-white/10 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Ingestão & Telemetria</h3>
            <p className="text-xs text-white/50">Status dos serviços de sincronização de satélites</p>
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
        {/* NASA FIRMS Sync */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">NASA FIRMS API</h4>
                <p className="text-xs text-white/40">Sincronização NRT MODIS & VIIRS</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Operacional
            </span>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            Consome focos de queimada ativos em tempo real providos pelo satélite VIIRS (375m) e MODIS (1km).
          </p>

          {nasaMutation.isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Sincronização NASA acionada com sucesso!</span>
            </div>
          )}

          {nasaMutation.isError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Erro ao contactar a API NASA FIRMS.</span>
            </div>
          )}

          <button
            onClick={() => nasaMutation.mutate(1)}
            disabled={nasaMutation.isPending}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {nasaMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Forçar Sincronização NASA FIRMS</span>
          </button>
        </div>

        {/* INPE BDQueimadas Sync */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">INPE BDQueimadas</h4>
                <p className="text-xs text-white/40">Programa Queimadas INPE / Brasil</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Operacional
            </span>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            Consome e cruza dados espaciais com a malha municipal do IBGE e áreas de preservação ambiental brasileiras.
          </p>

          {inpeMutation.isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Sincronização INPE iniciada com sucesso!</span>
            </div>
          )}

          {inpeMutation.isError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Erro ao sincronizar com INPE BDQueimadas.</span>
            </div>
          )}

          <button
            onClick={() => inpeMutation.mutate(undefined)}
            disabled={inpeMutation.isPending}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {inpeMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Forçar Sincronização INPE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
