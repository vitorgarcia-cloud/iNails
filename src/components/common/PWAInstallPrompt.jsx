import React from 'react';
import { usePWAInstall } from '../../contexts/PWAInstallContext';
import { X, Download, Smartphone, Monitor } from 'lucide-react';
import Button from '../ui/Button';

export function PWAInstallPrompt() {
  const { showPop, dismissPop, installApp, isInstalled } = usePWAInstall();

  if (!showPop || isInstalled) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-brand-200 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
        {/* Detalhe de fundo suave */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-100/60 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Botão de Fechar 'X' no Canto Superior Direito */}
        <button
          type="button"
          onClick={dismissPop}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shadow-xs z-10"
          title="Fechar mensagem"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Conteúdo Principal */}
        <div className="flex items-start gap-3.5 pr-8">
          <img
            src="/logo.png"
            alt="iNails Logo"
            className="w-12 h-12 rounded-2xl shadow-md shadow-brand-500/20 shrink-0 object-cover"
          />

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 block">
              Aplicativo iNails
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
              Adicione à Tela Inicial
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Abra direto pelo ícone no seu celular ou computador, rápido e sem precisar digitar o site.
            </p>
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <Button
            variant="primary"
            fullWidth
            size="md"
            icon={Download}
            onClick={installApp}
          >
            Criar Atalho na Tela Inicial
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;
