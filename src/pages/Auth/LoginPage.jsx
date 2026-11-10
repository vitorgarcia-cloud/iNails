import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { isSupabaseConfigured } from '../../config/supabaseClient';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Sparkles, Mail, Lock, User, Store, ArrowRight, PlayCircle } from 'lucide-react';

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [nomeEstudio, setNomeEstudio] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!nome.trim() || !nomeEstudio.trim()) {
          toast.warning('Informe seu nome e o nome do seu estúdio.');
          setLoading(false);
          return;
        }

        const { error } = await signUp({
          email: email.trim(),
          password,
          nome: nome.trim(),
          nomeEstudio: nomeEstudio.trim(),
        });

        if (error) {
          toast.error(error.message || 'Erro ao criar conta.');
        } else {
          toast.success('Conta criada com sucesso! Bem-vinda ao iNails!');
          navigate('/');
        }
      } else {
        const { error } = await signIn({
          email: email.trim(),
          password,
        });

        if (error) {
          toast.error(error.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
        } else {
          toast.success('Login efetuado com sucesso!');
          navigate('/');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await signIn({
        email: 'jessica.nailflow@demo.com',
        password: 'demopassword',
      });
      toast.success('Acesso liberado no Modo Demonstração!');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/70 via-white to-slate-50 flex flex-col justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo e Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-3xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white items-center justify-center shadow-lg shadow-brand-500/30 mb-4 animate-in zoom-in duration-300">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">iNails</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Gestão inteligente de ciclos, recorrência e finanças para Nail Designers
          </p>

          {!isSupabaseConfigured && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Modo Demonstração Ativo (Local)
            </div>
          )}
        </div>

        {/* Card do Formulário */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-7">
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-150 ${
                !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-150 ${
                isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <>
                <Input
                  label="Seu Nome *"
                  placeholder="Ex: Jéssica Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  icon={User}
                  required
                />
                <Input
                  label="Nome do seu Estúdio *"
                  placeholder="Ex: Studio Jéssica Nails"
                  value={nomeEstudio}
                  onChange={(e) => setNomeEstudio(e.target.value)}
                  icon={Store}
                  required
                />
              </>
            )}

            <Input
              label="E-mail *"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <Input
              label="Senha *"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
                icon={ArrowRight}
              >
                {isSignUp ? 'Cadastrar Estúdio' : 'Acessar Painel'}
              </Button>
            </div>
          </form>

          {/* Atalho de Demonstração Rápida */}
          <div className="mt-5 pt-5 border-t border-slate-100 text-center">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={handleDemoLogin}
              icon={PlayCircle}
              disabled={loading}
            >
              Entrar direto como Jéssica Silva (Demo)
            </Button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          NailFlow &copy; {new Date().getFullYear()} • PWA para Nail Designers
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
