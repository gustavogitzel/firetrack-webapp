import { useAtom } from 'jotai';
import {
  Map,
  Layers,
  BarChart3,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Flame,
  Radio,
  Thermometer,
  Bell,
} from 'lucide-react';
import { activeViewAtom, sidebarCollapsedAtom, type ViewMode } from '@/state/navigation.atoms';
import { useFireEventsQuery } from '@/features/telemetry/api/useFireEventsQuery';
import { FireTrackLogo } from '../atoms/FireTrackLogo';
import { SidebarNavItem } from '../molecules/SidebarNavItem';

export function Sidebar() {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom);
  const { data: fireEvents } = useFireEventsQuery();

  const totalIncidents = fireEvents?.length ?? 0;
  const criticalIncidents = fireEvents?.filter((e) => (e.max_frp ?? 0) > 80).length ?? 0;

  const navItems: { id: ViewMode; label: string; icon: any; badge?: number | string }[] = [
    {
      id: 'map',
      label: 'Mapa em Tempo Real',
      icon: <Map className="w-5 h-5 text-red-400" />,
    },
    {
      id: 'incidents',
      label: 'Focos de Incêndio',
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      badge: totalIncidents,
    },
    {
      id: 'weather',
      label: 'Clima & Risco FWI',
      icon: <Thermometer className="w-5 h-5 text-rose-400" />,
    },
    {
      id: 'alerts',
      label: 'Central de Alertas',
      icon: <Bell className="w-5 h-5 text-amber-400" />,
      badge: criticalIncidents > 0 ? `${criticalIncidents} Críticos` : undefined,
    },
    {
      id: 'layers',
      label: 'Camadas & Satélites',
      icon: <Layers className="w-5 h-5 text-sky-400" />,
    },
    {
      id: 'analytics',
      label: 'Relatórios & Estatísticas',
      icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'sync',
      label: 'Ingestão de Dados',
      icon: <RefreshCw className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <aside
      className={`relative h-full flex flex-col bg-neutral-950/80 backdrop-blur-3xl border-r border-white/10 shadow-2xl transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Header / Logo */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 min-h-[72px]">
        {!collapsed ? (
          <FireTrackLogo size="sm" />
        ) : (
          <div className="p-2.5 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 mx-auto">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
            collapsed ? 'hidden sm:block mx-auto mt-2' : ''
          }`}
          title={collapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-none">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeView === item.id}
            badge={item.badge}
            collapsed={collapsed}
            onClick={() => setActiveView(item.id)}
          />
        ))}
      </div>

      {/* Live Telemetry Status Footer */}
      <div className="p-3.5 border-t border-white/5">
        <div
          className={`p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white tracking-tight">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>GOES-19 & VIIRS Live</span>
              </div>
              <p className="text-[10px] text-white/40 truncate">
                Conectado • INPE & NASA FIRMS
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
