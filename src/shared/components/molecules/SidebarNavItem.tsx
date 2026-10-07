import { useMemo, type ReactNode } from 'react';

interface SidebarNavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: string | number;
  collapsed?: boolean;
  onClick: () => void;
}

export function SidebarNavItem({
  icon,
  label,
  active = false,
  badge,
  collapsed = false,
  onClick,
}: SidebarNavItemProps) {
  // When collapsed, format "10 Críticos" into compact "10" badge
  const compactBadge = useMemo(() => {
    if (badge === undefined || badge === null) return undefined;
    if (!collapsed) return badge;
    if (typeof badge === 'number') return badge;
    const match = String(badge).match(/\d+/);
    return match ? match[0] : '!';
  }, [badge, collapsed]);

  return (
    <button
      onClick={onClick}
      title={collapsed ? `${label}${badge ? ` (${badge})` : ''}` : undefined}
      className={`relative w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 cursor-pointer select-none ${
        active
          ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
          : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
      } ${collapsed ? 'justify-center px-0' : ''}`}
    >
      {/* Icon */}
      <div className={`shrink-0 transition-transform ${active ? 'scale-110' : ''}`}>
        {icon}
      </div>

      {/* Label */}
      {!collapsed && (
        <span className="truncate flex-1 text-left tracking-tight">
          {label}
        </span>
      )}

      {/* Badge / Count */}
      {compactBadge !== undefined && (
        <span
          className={`font-mono font-extrabold border transition-all shadow-sm ${
            collapsed
              ? 'absolute top-1.5 right-3 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[9px] leading-none rounded-full bg-red-500 text-white border-red-400 z-10'
              : `px-2 py-0.5 text-[10px] rounded-full shrink-0 ${
                  active
                    ? 'bg-red-500 text-white border-red-400'
                    : 'bg-white/10 text-white/70 border-white/10'
                }`
          }`}
        >
          {compactBadge}
        </span>
      )}
    </button>
  );
}
