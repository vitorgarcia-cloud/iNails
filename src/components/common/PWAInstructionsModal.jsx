import React from 'react';
import { usePWAInstall } from '../../contexts/PWAInstallContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Smartphone, Monitor, Share2, PlusSquare, MoreVertical, ArrowDownToLine, CheckCircle2 } from 'lucide-react';

export function PWAInstructionsModal() {
  const { modalInstrucoesAberto, closeInstrucoes, isIOS } = usePWAInstall();

  return (
    <Modal
      isOpen={modalInstrucoesAberto}
      onClose={closeInstrucoes}
      title="Como Criar o Atalho do iNails"
      description="Siga o passo a passo rápido para o seu dispositivo"
    >
      <div className="flex flex-col gap-4 text-xs">
        {/* Caso iOS (iPhone / iPad) */}
        {isIOS ? (
          <div className="flex flex-col gap-3 bg-brand-50/50 p-3.5 rounded-2xl border border-brand-200/70">
            <div className="flex items-center gap-2 text-brand-900 font-bold">
              <Smartphone className="w-4 h-4 text-brand-600" />
              <span>Instruções para iPhone / iPad (Safari)</span>
            </div>

            <ol className="flex flex-col gap-2.5 text-slate-700 pl-1">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-200 text-brand-800 font-bold flex items-center justify-center text-[11px] shrink-0">
                  1
                </span>
                <span>
                  No rodapé do Safari, toque no botão <strong>Compartilhar</strong> (ícone com quadrado e seta para cima).
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-200 text-brand-800 font-bold flex items-center justify-center text-[11px] shrink-0">
                  2
                </span>
                <span>
                  Role a lista para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.
                </span>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-200 text-brand-800 font-bold flex items-center justify-center text-[11px] shrink-0">
                  3
                </span>
                <span>
                  Toque em <strong>"Adicionar"</strong> no canto superior direito. Pronto! O ícone do iNails aparecerá junto aos seus apps.
                </span>
              </li>
            </ol>
          </div>
        ) : (
          /* Caso Android ou Desktop */
          <div className="flex flex-col gap-3">
            {/* Opção Celular Android */}
            <div className="flex flex-col gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Smartphone className="w-4 h-4 text-brand-600" />
                <span>No Celular (Android / Chrome)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Toque no menu de <strong>3 pontinhos</strong> no topo do navegador e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </p>
            </div>

            {/* Opção Computador */}
            <div className="flex flex-col gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Monitor className="w-4 h-4 text-brand-600" />
                <span>No Computador (Chrome / Edge)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Clique no ícone de <strong>instalar</strong> (computador com seta para baixo) na barra de endereços do navegador ou no menu de 3 pontinhos ➔ <strong>"Instalar iNails"</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button variant="primary" fullWidth onClick={closeInstrucoes}>
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default PWAInstructionsModal;

