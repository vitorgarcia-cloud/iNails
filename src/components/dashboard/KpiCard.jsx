import React from 'react';
import Card from '../ui/Card';

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
}) {
  const iconThemes = {
    default: 'bg-slate-100 text-slate-700',
    brand: 'bg-brand-50 text-brand-600',
    success: 'bg-emerald-50 text-emerald-600',
    danger: 'bg-rose-50 text-rose-600',
    warning: 'bg-amber-50 text-amber-600',
  };

  return (
    <Card className="flex flex-col justify-between" padding="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconThemes[variant] || iconThemes.default}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}

export default KpiCard;
