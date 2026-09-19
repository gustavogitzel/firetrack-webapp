export function App() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* TODO: Mount map viewport, dashboard panels, and drawers here */}
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-wider text-slate-200 uppercase">
              FireTrack
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Infraestrutura carregada. Monte as telas sobre esta base.
          </p>
        </div>
      </div>
    </main>
  );
}
