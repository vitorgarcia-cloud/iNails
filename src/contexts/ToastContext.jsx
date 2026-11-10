import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast container flutuante no topo - mobile friendly */}
      <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between w-full max-w-sm p-3.5 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-top-3 ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : t.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : t.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
              {t.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 opacity-70 hover:opacity-100 rounded-md transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context.toast;
}
