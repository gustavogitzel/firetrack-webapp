interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: 'red' | 'sky' | 'amber' | 'emerald';
  height?: 'sm' | 'md';
  className?: string;
}

export function ProgressBar({
  progress,
  color = 'sky',
  height = 'sm',
  className = '',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
  }[height];

  const colorStyles = {
    red: 'from-red-600 to-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    sky: 'from-sky-600 to-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]',
    amber: 'from-amber-600 to-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
    emerald: 'from-emerald-600 to-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
  }[color];

  return (
    <div
      className={`w-full rounded-full bg-white/10 overflow-hidden border border-white/5 ${heightStyles} ${className}`}
    >
      <div
        className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out ${colorStyles}`}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  );
}
