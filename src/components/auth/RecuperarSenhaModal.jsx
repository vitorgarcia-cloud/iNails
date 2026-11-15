import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import {
  formatarTelefoneInput,
  validarTelefone,
  validarDataNascimento,
  validarConfirmacaoSenha,
} from '../../utils/authValidation';
import { KeyRound, Phone, Lock, Calendar, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function RecuperarSenhaModal({ isOpen, onClose, initialTelefone = '' }) {
  const { validarRecuperacaoNascimento, redefinirSenhaPorNascimento } = useAuth();
  const toast = useToast();

  // Estados do fluxo em duas etapas
  const [step, setStep] = useState(1); // 1 = Confirmar Identidade, 2 = Cadastrar Nova Senha
  const [telefone, setTelefone] = useState(initialTelefone);
  const [dataNascimento, setDataNascimento] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);

  // Manipulador de digitação com máscara automática (Clean Code)
  const handleTelefoneChange = (e) => {
    setTelefone(formatarTelefoneInput(e.target.value));
  };

  // Etapa 1: Validar se telefone e data de nascimento conferem
  const handleValidarIdentidade = async (e) => {
    e.preventDefault();

    const checkTel = validarTelefone(telefone);
    if (!checkTel.valido) {
      toast.warning(checkTel.mensagem);
      return;
    }

    const checkData = validarDataNascimento(dataNascimento);
    if (!checkData.valido) {
      toast.warning(checkData.mensagem);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await validarRecuperacaoNascimento({
        telefone,
        dataNascimento,
      });

      if (error) {
        toast.error(error.message || 'Dados não conferem. Verifique o telefone e a data de nascimento.');
        return;
      }

      setNomeUsuario(data?.nome || 'Nail Designer');
      setStep(2);
      toast.success('Identidade confirmada com sucesso! Crie sua nova senha.');
    } catch {
      toast.error('Erro ao verificar seus dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Etapa 2: Salvar nova senha no banco e conectar
  const handleSalvarNovaSenha = async (e) => {
    e.preventDefault();

    const checkSenhas = validarConfirmacaoSenha(novaSenha, confirmarSenha);
    if (!checkSenhas.valido) {
      toast.warning(checkSenhas.mensagem);
      return;
    }

    setLoading(true);
    try {
      const { error } = await redefinirSenhaPorNascimento({
        telefone,
        dataNascimento,
        novaSenha,
        autoLogin: true,
      });

      if (error) {
        toast.error(error.message || 'Erro ao redefinir a senha.');
      } else {
        toast.success('Senha atualizada com sucesso! Bem-vinda de volta.');
        handleClose();
      }
    } catch (err) {
      toast.error(err.message || 'Erro ao salvar nova senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setNovaSenha('');
    setConfirmarSenha('');
    setNomeUsuario('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'Recuperar Senha' : 'Criar Nova Senha'}
      size="md"
    >
      {step === 1 ? (
        <form onSubmit={handleValidarIdentidade} className="space-y-4">
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-brand-100">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Recuperação de Acesso</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Digite seu celular e data de nascimento cadastrados para confirmar sua identidade e redefinir a senha.
            </p>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <Input
              label="Telefone / Celular *"
              type="tel"
              placeholder="(11) 99999-9999"
              value={telefone}
              onChange={handleTelefoneChange}
              icon={Phone}
              autoFocus
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Data de Nascimento *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full text-sm py-2.5 px-3.5 pl-10 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-xs"
                  required
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                A mesma data de nascimento informada no seu cadastro.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              icon={ArrowRight}
            >
              Verificar e Continuar
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSalvarNovaSenha} className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-800">
              <p className="font-bold">Identidade confirmada com sucesso!</p>
              <p className="text-emerald-700 mt-0.5">
                Olá, <strong>{nomeUsuario}</strong>! Digite a sua nova senha abaixo para acessar seu estúdio.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              label="Nova Senha (mínimo 11 caracteres) *"
              type="password"
              placeholder="••••••••"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              icon={Lock}
              autoFocus
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
              Salvar Nova Senha e Conectar
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar e corrigir dados
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default RecuperarSenhaModal;
