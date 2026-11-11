import React, { createContext, useContext, useState, useEffect } from 'react';

const PWAInstallContext = createContext(null);

export function PWAInstallProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPop, setShowPop] = useState(false);
  const [modalInstrucoesAberto, setModalInstrucoesAberto] = useState(false);

  useEffect(() => {
    // 1. Verifica se já está rodando em modo standalone (PWA instalado)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(isStandalone);

    // 2. Detecta iOS
    const iosDevice =
      /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iosDevice);

    // 3. Captura evento nativo do PWA no Chrome / Edge / Android / Desktop
    if (window.__inails_deferred_prompt) {
      setDeferredPrompt(window.__inails_deferred_prompt);
      setCanInstall(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window.__inails_deferred_prompt = e;
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      window.__inails_deferred_prompt = null;
      setShowPop(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 4. Pop-up na primeira vez que abre o site
    const jaDispensou = localStorage.getItem('inails_pwa_dismissed');
    if (!isStandalone && !jaDispensou) {
      const timer = setTimeout(() => {
        setShowPop(true);
      }, 1200);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismissPop = () => {
    localStorage.setItem('inails_pwa_dismissed', 'true');
    setShowPop(false);
  };

  const installApp = async () => {
    const promptEvent = deferredPrompt || window.__inails_deferred_prompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setCanInstall(false);
        }
        setDeferredPrompt(null);
        window.__inails_deferred_prompt = null;
        dismissPop();
      } catch (err) {
        console.error('Erro ao acionar prompt de instalação:', err);
      }
    } else {
      // Caso iOS ou navegador desktop sem evento nativo disponível no momento, abre instruções visuais
      setModalInstrucoesAberto(true);
      dismissPop();
    }
  };

  const openInstrucoes = () => {
    setModalInstrucoesAberto(true);
  };

  const closeInstrucoes = () => {
    setModalInstrucoesAberto(false);
  };

  return (
    <PWAInstallContext.Provider
      value={{
        canInstall,
        isInstalled,
        isIOS,
        showPop,
        modalInstrucoesAberto,
        installApp,
        dismissPop,
        openInstrucoes,
        closeInstrucoes,
      }}
    >
      {children}
    </PWAInstallContext.Provider>
  );
}

export function usePWAInstall() {
  const context = useContext(PWAInstallContext);
  if (!context) {
    throw new Error('usePWAInstall deve ser usado dentro de um PWAInstallProvider');
  }
  return context;
}

export default PWAInstallContext;

