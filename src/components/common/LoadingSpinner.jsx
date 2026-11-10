import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ text = 'Carregando dados...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-3 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      {text && <p className="text-xs font-medium text-slate-500">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

export default LoadingSpinner;
