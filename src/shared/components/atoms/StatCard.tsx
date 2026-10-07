import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  color?: 'red' | 'orange' | 'amber' | 'sky' | 'emerald' | 'neutral';
  subtitle?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  color = 'neutral',
  subtitle,
  className = '',
}: StatCardProps) {
  const colorStyles = {
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    sky: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    neutral: 'text-white/60 bg-white/5 border-white/5',
  }[color];

  return (
    <div className={`p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-lg flex flex-col gap-1.5 transition-all hover:bg-white/[0.07] ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">
          {label}
        </span>
        {icon && (
          <div className={`p-1.5 rounded-xl border ${colorStyles}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="text-xl font-black text-white tracking-tight font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-white/40 tracking-normal">
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <span className="text-[10px] text-white/40 font-medium">
          {subtitle}
        </span>
      )}
    </div>
  );
}
