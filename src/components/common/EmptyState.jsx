import React from 'react';
import { Button } from '../ui/Button';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-slate-200 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
