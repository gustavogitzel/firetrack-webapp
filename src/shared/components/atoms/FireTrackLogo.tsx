interface FireTrackLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
}

export function FireTrackLogo({
  size = 'md',
  showBadge = true,
  className = '',
}: FireTrackLogoProps) {
  const sizeStyles = {
    sm: { text: 'text-xl', divider: 'h-5', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { text: 'text-2xl', divider: 'h-6', badge: 'text-[10px] px-2 py-0.5' },
    lg: { text: 'text-4xl', divider: 'h-8', badge: 'text-xs px-2.5 py-1' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Brand Text */}
      <div className="flex items-center tracking-tight">
        {/* FIRE */}
        <span
          className={`font-black text-white tracking-[-0.03em] ${sizeStyles.text} drop-shadow-[0_2px_10px_rgba(239,68,68,0.4)]`}
        >
          FIRE
        </span>

        {/* Contour Divider Line */}
        <span className={`mx-2 border-r-2 border-dashed border-red-500/40 ${sizeStyles.divider}`} />

        {/* TRACK */}
        <span
          className={`font-extrabold tracking-[0.08em] ${sizeStyles.text} text-transparent`}
          style={{
            WebkitTextStroke: size === 'sm' ? '1.2px #FFFFFF' : '1.8px #FFFFFF',
          }}
        >
          TRACK
        </span>
      </div>

      {/* Satellite NRT Badge */}
      {showBadge && (
        <span
          className={`ml-1 font-mono font-semibold uppercase tracking-widest text-red-300 bg-red-950/60 border border-red-500/30 backdrop-blur-md rounded-lg shadow-sm ${sizeStyles.badge}`}
        >
          NRT
        </span>
      )}
    </div>
  );
}
