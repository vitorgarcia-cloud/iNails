import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop escurecido */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Janela Modal (Bottom Sheet no Mobile, Centrada em telas maiores) */}
      <div
        className={`
          relative w-full ${maxWidth} bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl 
          max-h-[92vh] flex flex-col overflow-hidden z-10
          animate-in slide-in-from-bottom duration-250
        `}
      >
        {/* Barra de arraste visual para mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-slate-100">
          <div>
            {title && <h3 className="text-base font-bold text-slate-800">{title}</h3>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com rolagem suave */}
        <div className="p-5 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
