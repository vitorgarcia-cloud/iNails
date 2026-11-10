import React from 'react';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    pendente: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmado: 'bg-sky-50 text-sky-700 border-sky-200',
    concluido: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelado: 'bg-rose-50 text-rose-700 border-rose-200',
    ativa: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    em_risco: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    alerta_estoque: 'bg-rose-50 text-rose-700 border-rose-200 font-bold animate-pulse',
    ok_estoque: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    recorrente: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const dotColors = {
    pendente: 'bg-amber-500',
    confirmado: 'bg-sky-500',
    concluido: 'bg-emerald-500',
    cancelado: 'bg-rose-500',
    ativa: 'bg-emerald-500',
    em_risco: 'bg-rose-500',
    alerta_estoque: 'bg-rose-500',
    ok_estoque: 'bg-emerald-500',
    recorrente: 'bg-purple-500',
    default: 'bg-slate-400',
    brand: 'bg-brand-500',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-1 font-medium gap-1.5',
    lg: 'text-sm px-3 py-1.5 font-semibold gap-2',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border leading-none
        ${variants[variant] || variants.default}
        ${sizes[size] || sizes.md}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
