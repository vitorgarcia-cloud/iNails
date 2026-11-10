import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none';

  const variants = {
    primary:
      'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-sm shadow-brand-500/25 focus:ring-brand-400',
    secondary:
      'bg-brand-50 hover:bg-brand-100 active:bg-brand-200 text-brand-700 border border-brand-200 focus:ring-brand-300',
    outline:
      'border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 shadow-sm focus:ring-brand-400',
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-300',
    danger:
      'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/25 focus:ring-rose-400',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/25 focus:ring-emerald-400',
  };

  const sizes = {
    sm: 'text-xs px-3 py-2 gap-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[44px]', // 44px min for mobile touch target
    lg: 'text-base px-5 py-3.5 gap-2.5 min-h-[50px]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export default Button;
