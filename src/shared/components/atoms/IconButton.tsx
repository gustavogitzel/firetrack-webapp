import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  active?: boolean;
  variant?: 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export function IconButton({
  children,
  active = false,
  variant = 'glass',
  size = 'md',
  tooltip,
  className = '',
  ...props
}: IconButtonProps) {
  const sizeStyles = {
    sm: 'p-1.5 rounded-lg text-xs',
    md: 'p-2.5 rounded-xl text-sm',
    lg: 'p-3.5 rounded-2xl text-base',
  }[size];

  const variantStyles = {
    glass: active
      ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
      : 'bg-black/40 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-xl',
    ghost: active
      ? 'bg-white/15 text-white'
      : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent',
    danger:
      'bg-red-600/30 hover:bg-red-600/40 text-red-300 border border-red-500/40 backdrop-blur-md shadow-lg',
  }[variant];

  return (
    <button
      title={tooltip}
      className={`relative inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
