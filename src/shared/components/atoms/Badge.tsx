import type { ReactNode } from 'react';

export type BadgeVariant = 'high' | 'nominal' | 'low' | 'active' | 'contained' | 'extinguished' | 'critical' | 'neutral' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  pulse?: boolean;
}

export function Badge({ variant = 'neutral', children, className = '', pulse = false }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    critical: 'bg-rose-600/30 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
    nominal: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    low: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    active: 'bg-red-500/20 text-red-400 border-red-500/30',
    contained: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    extinguished: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    info: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    neutral: 'bg-white/10 text-white/60 border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-md border backdrop-blur-md transition-all ${variantStyles[variant]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
