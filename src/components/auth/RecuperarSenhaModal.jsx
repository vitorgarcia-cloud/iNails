import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { KeyRound, Phone, Lock, MessageCircle, MessageSquare, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function RecuperarSenhaModal({ isOpen, onClose, initialTelefone = '' }) {
  const { solicitarCodigoRecuperacao, redefinirSenhaComCodigo } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1 = Digitar telefone, 2 = Digitar código e nova senha
  const [telefone, setTelefone] = useState(initialTelefone);
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [codigoGeradoInfo, setCodigoGeradoInfo] = useState(null);

  // Formatação de telefone
  const handleTelefoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 2 && digits.length <= 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 7) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    setTelefone(formatted);
  };

  const handleSolicitarCodigo = async (tipoEnvio = 'whatsapp') => {
    const rawDigits = telefone.replace(/\D/g, '');
    if (rawDigits.length < 10) {
      toast.warning('Informe um número de celular válido com DDD (Ex: 11 99999-9999).');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await solicitarCodigoRecuperacao(rawDigits);
      if (error) {
        toast.error(error.message || 'Erro ao gerar código de recuperação.');
        return;
      }

      setCodigoGeradoInfo(data);
      setStep(2);

      // Dispara o envio prioritário via WhatsApp ou SMS
      if (tipoEnvio === 'whatsapp' && data?.linkWhatsApp) {
        window.open(data.linkWhatsApp, '_blank', 'noopener,noreferrer');
        toast.success(`Abrindo WhatsApp para enviar o código para ${telefone}!`);
      } else if (tipoEnvio === 'sms' && data?.linkSMS) {
        window.location.href = data.linkSMS;
        toast.success(`Abrindo aplicativo de SMS para enviar o código para ${telefone}!`);
      } else {
        toast.success('Código gerado com sucesso! Verifique a mensagem recebida.');
      }
    } catch (err) {
      toast.error('Ocorreu um erro ao processar seu pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    const cleanCode = codigo.replace(/\D/g, '').slice(0, 6);

    if (cleanCode.length !== 6) {
      toast.warning('O código de verificação deve conter 6 números.');
      return;
    }

    if (!novaSenha || novaSenha.length < 6) {
      toast.warning('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.warning('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await redefinirSenhaComCodigo({
        telefone,
        codigo: cleanCode,
        novaSenha,
        autoLogin: true,
      });

      if (error) {
        toast.error(error.message || 'Erro ao redefinir senha. Verifique o código digitado.');
      } else {
        toast.success('Senha alterada com sucesso! Você já está conectada.');
        handleClose();
      }
    } catch (err) {
      toast.error('Erro ao salvar nova senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setCodigo('');
    setNovaSenha('');
    setConfirmarSenha('');
    setCodigoGeradoInfo(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Recuperação de Senha"
      size="md"
    >
      {step === 1 ? (
        <div className="space-y-5">
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-brand-100">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Esqueceu sua senha?</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Digite seu número de celular. Você receberá um código de 6 dígitos via{' '}
              <strong className="text-slate-700">WhatsApp</strong> para criar uma nova senha.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <Input
              label="Seu Telefone / WhatsApp Cadastrado *"
              type="tel"
              placeholder="(11) 99999-9999"
              value={telefone}
              onChange={handleTelefoneChange}
              icon={Phone}
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            <Button
              type="button"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              onClick={() => handleSolicitarCodigo('whatsapp')}
              icon={MessageCircle}
              className="bg-emerald-600 hover:bg-emerald-700 border-none text-white shadow-emerald-500/20"
            >
              Enviar Código via WhatsApp
            </Button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSolicitarCodigo('sms')}
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Prefiro receber por SMS
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRedefinirSenha} className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800">
              <p className="font-bold">Código enviado para {telefone}!</p>
              <p className="text-emerald-700 mt-0.5">
                Digite o código de 6 dígitos que você recebeu e cadastre a sua nova senha.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                Código de 6 Dígitos *
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center text-2xl tracking-[0.35em] font-mono font-bold py-3 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
                autoFocus
                required
              />
            </div>

            <Input
              label="Nova Senha (mínimo 6 caracteres) *"
              type="password"
              placeholder="••••••••"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              icon={Lock}
              required
            />

            <Input
              label="Confirme a Nova Senha *"
              type="password"
              placeholder="••••••••"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              icon={Lock}
              required
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              icon={CheckCircle2}
            >
              Salvar Nova Senha e Entrar
            </Button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Trocar número
              </button>

              <button
                type="button"
                onClick={() => handleSolicitarCodigo('whatsapp')}
                disabled={loading}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Reenviar código
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default RecuperarSenhaModal;
