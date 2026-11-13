import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { getMockDB, saveMockDB } from './mockData';
import { normalizarTelefoneWhatsApp, gerarLinkWhatsApp } from '../utils/whatsapp';

export const AUTH_USER_KEY = 'inails_auth_user';
export const AUTH_PROFILE_KEY = 'inails_auth_profile';
const DEMO_FLAG_KEY = 'inails_is_demo';
const DEMO_USER_SESSION_KEY = 'inails_demo_session';
const DEMO_RESET_KEY = 'inails_demo_reset_code';

/**
 * Remove caracteres não numéricos do telefone
 */
export function cleanTelefone(telefone) {
  if (!telefone) return '';
  return String(telefone).replace(/\D/g, '');
}

/**
 * Converte o telefone para um identificador de autenticação único aceito pelo Supabase
 */
export function telefoneToAuthEmail(telefone) {
  const digits = cleanTelefone(telefone);
  return `tel${digits}@inails.com`;
}

/**
 * Verifica se a sessão atual é uma sessão de demonstração
 */
export function isDemoSession() {
  return typeof window !== 'undefined' && localStorage.getItem(DEMO_FLAG_KEY) === 'true';
}

export const authService = {
  /**
   * Realiza login no modo demonstração com dados de exemplo pré-carregados
   */
  async loginDemo() {
    localStorage.setItem(DEMO_FLAG_KEY, 'true');
    const db = getMockDB();
    const demoSession = {
      user: {
        id: db.profile.user_id,
        email: 'jessica.demo@inails.com',
        user_metadata: {
          nome: db.profile.nome,
          nome_estudio: db.profile.nome_estudio,
          telefone: '11987654321',
        }
      }
    };
    localStorage.setItem(DEMO_USER_SESSION_KEY, JSON.stringify(demoSession));
    return { data: { session: demoSession, user: demoSession.user }, error: null };
  },

  /**
   * Realiza login com TELEFONE e SENHA conectando diretamente ao Supabase
   */
  async signIn({ telefone, password }) {
    // Garante que o modo demo está desativado para usuários reais
    localStorage.removeItem(DEMO_FLAG_KEY);
    localStorage.removeItem(DEMO_USER_SESSION_KEY);

    const digits = cleanTelefone(telefone);
    if (!digits || digits.length < 10) {
      return {
        data: null,
        error: new Error('Informe um número de telefone celular válido com DDD (ex: 11 98765-4321).')
      };
    }

    const email = telefoneToAuthEmail(digits);

    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: new Error('Banco de dados Supabase não configurado. Verifique as variáveis no arquivo .env.')
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data?.session?.user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.session.user));
    }

    return { data, error };
  },

  /**
   * Cria nova conta de nail designer usando TELEFONE e SENHA
   */
  async signUp({ telefone, password, nome, nomeEstudio }) {
    // Garante que o modo demo está desativado para novos usuários reais
    localStorage.removeItem(DEMO_FLAG_KEY);
    localStorage.removeItem(DEMO_USER_SESSION_KEY);

    const digits = cleanTelefone(telefone);
    if (!digits || digits.length < 10) {
      return {
        data: null,
        error: new Error('Informe um número de telefone celular válido com DDD (ex: 11 98765-4321).')
      };
    }

    if (!password || password.length < 6) {
      return {
        data: null,
        error: new Error('A senha deve ter no mínimo 6 caracteres.')
      };
    }

    const email = telefoneToAuthEmail(digits);

    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: new Error('Banco de dados Supabase não configurado. Verifique as variáveis no arquivo .env.')
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome: nome.trim(),
          nome_estudio: (nomeEstudio || `Studio ${nome}`).trim(),
          telefone: digits,
        }
      }
    });

    if (error) {
      return { data, error };
    }

    if (data?.session?.user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.session.user));
    }

    // Se o usuário foi criado mas não retornou a sessão ativa, tenta autenticar automaticamente
    if (data?.user && !data?.session) {
      const loginAttempt = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginAttempt.data?.session) {
        if (loginAttempt.data.session.user) {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loginAttempt.data.session.user));
        }
        return { data: loginAttempt.data, error: null };
      }
    }

    return { data, error: null };
  },

  /**
   * Encerra a sessão
   */
  async signOut() {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_PROFILE_KEY);
    localStorage.removeItem(DEMO_FLAG_KEY);
    localStorage.removeItem(DEMO_USER_SESSION_KEY);
    localStorage.removeItem('inails_supabase_session');

    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    return { error: null };
  },

  /**
   * Obtém a sessão atual
   */
  async getSession() {
    if (isDemoSession()) {
      const sessionStr = localStorage.getItem(DEMO_USER_SESSION_KEY);
      if (sessionStr) {
        try {
          return { data: { session: JSON.parse(sessionStr) }, error: null };
        } catch {
          return { data: { session: null }, error: null };
        }
      }
      return { data: { session: null }, error: null };
    }

    if (!isSupabaseConfigured) {
      return { data: { session: null }, error: null };
    }

    return await supabase.auth.getSession();
  },

  /**
   * Busca os dados de perfil da profissional logada
   */
  async getProfile(userId) {
    if (isDemoSession()) {
      const db = getMockDB();
      return { data: db.profile, error: null };
    }

    if (!isSupabaseConfigured || !userId) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Se o profile ainda não existir no banco (ex: trigger demorou ou não executou), cria automaticamente
    if (!data && !error) {
      const { data: { user } } = await supabase.auth.getUser();
      const novoProfile = {
        user_id: userId,
        nome: user?.user_metadata?.nome || 'Nail Designer',
        nome_estudio: user?.user_metadata?.nome_estudio || 'Meu Estúdio',
        telefone: user?.user_metadata?.telefone || '',
      };
      const { data: criado } = await supabase.from('profiles').insert(novoProfile).select().single();
      return { data: criado || novoProfile, error: null };
    }

    if (data) {
      localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(data));
    }

    return { data, error };
  },

  /**
   * Atualiza dados de perfil
   */
  async updateProfile(userId, dados) {
    if (isDemoSession()) {
      const db = getMockDB();
      db.profile = { ...db.profile, ...dados };
      saveMockDB(db);
      localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(db.profile));
      return { data: db.profile, error: null };
    }

    if (!isSupabaseConfigured || !userId) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(dados)
      .eq('user_id', userId)
      .select()
      .single();

    if (!error && data) {
      localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(data));
    }

    return { data, error };
  },

  /**
   * Solicita código de 6 dígitos para recuperação de senha (via WhatsApp ou SMS)
   */
  async solicitarCodigoRecuperacao(telefone) {
    const digits = cleanTelefone(telefone);
    if (!digits || digits.length < 10) {
      return {
        data: null,
        error: new Error('Informe um número de telefone celular válido com DDD (ex: 11 98765-4321).')
      };
    }

    if (isDemoSession() || !isSupabaseConfigured) {
      const codigo = String(Math.floor(100000 + Math.random() * 900000));
      const expira = Date.now() + 15 * 60 * 1000;
      localStorage.setItem(DEMO_RESET_KEY, JSON.stringify({ telefone: digits, codigo, expira }));

      const mensagem = `Olá! ✨ Seu código de verificação para redefinir a senha no iNails é: *${codigo}* (válido por 15 minutos).`;
      const linkWhatsApp = gerarLinkWhatsApp(digits, mensagem);
      const linkSMS = `sms:${normalizarTelefoneWhatsApp(digits)}?body=${encodeURIComponent(mensagem)}`;

      return {
        data: {
          codigo,
          nome: 'Usuária Demo',
          telefone: digits,
          mensagem,
          linkWhatsApp,
          linkSMS,
        },
        error: null,
      };
    }

    // Tenta via RPC no Supabase
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('solicitar_codigo_recuperacao', {
        p_telefone: digits,
      });

      if (!rpcError && rpcData?.sucesso) {
        const codigo = rpcData.codigo;
        const nome = rpcData.nome || 'Nail Designer';
        const mensagem = `Olá, ${nome}! ✨ Seu código de recuperação de senha no iNails é: *${codigo}* (válido por 15 minutos).`;
        const linkWhatsApp = gerarLinkWhatsApp(digits, mensagem);
        const linkSMS = `sms:${normalizarTelefoneWhatsApp(digits)}?body=${encodeURIComponent(mensagem)}`;

        return {
          data: {
            codigo,
            nome,
            telefone: digits,
            mensagem,
            linkWhatsApp,
            linkSMS,
          },
          error: null,
        };
      }

      if (rpcData && !rpcData.sucesso) {
        return { data: null, error: new Error(rpcData.mensagem || 'Telefone não encontrado.') };
      }
    } catch {
      // continua para fallback caso RPC ainda não tenha sido criado no Supabase
    }

    // Fallback caso a função RPC ainda não tenha sido criada no Supabase
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, telefone, user_id')
      .eq('telefone', digits)
      .maybeSingle();

    if (!profile) {
      return {
        data: null,
        error: new Error('Nenhuma conta foi encontrada com este número de telefone.')
      };
    }

    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    const expira = Date.now() + 15 * 60 * 1000;
    localStorage.setItem(`inails_reset_${digits}`, JSON.stringify({ codigo, expira, user_id: profile.user_id }));

    const mensagem = `Olá, ${profile.nome || 'Nail Designer'}! ✨ Seu código de recuperação de senha no iNails é: *${codigo}* (válido por 15 minutos).`;
    const linkWhatsApp = gerarLinkWhatsApp(digits, mensagem);
    const linkSMS = `sms:${normalizarTelefoneWhatsApp(digits)}?body=${encodeURIComponent(mensagem)}`;

    return {
      data: {
        codigo,
        nome: profile.nome,
        telefone: digits,
        mensagem,
        linkWhatsApp,
        linkSMS,
      },
      error: null,
    };
  },

  /**
   * Valida o código e redefine a senha do usuário
   */
  async redefinirSenhaComCodigo({ telefone, codigo, novaSenha }) {
    const digits = cleanTelefone(telefone);
    if (!digits || digits.length < 10) {
      return { data: null, error: new Error('Telefone inválido.') };
    }
    if (!codigo || codigo.trim().length !== 6) {
      return { data: null, error: new Error('Informe o código de 6 dígitos.') };
    }
    if (!novaSenha || novaSenha.length < 6) {
      return { data: null, error: new Error('A nova senha deve ter no mínimo 6 caracteres.') };
    }

    if (isDemoSession() || !isSupabaseConfigured) {
      const saved = localStorage.getItem(DEMO_RESET_KEY);
      if (!saved) {
        return { data: null, error: new Error('Nenhum código pendente para este telefone.') };
      }
      const parsed = JSON.parse(saved);
      if (parsed.codigo !== codigo.trim()) {
        return { data: null, error: new Error('Código de verificação incorreto.') };
      }
      if (Date.now() > parsed.expira) {
        return { data: null, error: new Error('Código expirado. Solicite outro código.') };
      }
      localStorage.removeItem(DEMO_RESET_KEY);
      return { data: { sucesso: true }, error: null };
    }

    // Executa a função RPC segura com SECURITY DEFINER no Supabase
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('redefinir_senha_por_codigo', {
        p_telefone: digits,
        p_codigo: codigo.trim(),
        p_nova_senha: novaSenha,
      });

      if (!rpcError && rpcData?.sucesso) {
        // Realiza login automático com a nova senha
        const loginRes = await this.signIn({ telefone: digits, password: novaSenha });
        return { data: rpcData, error: loginRes.error };
      }

      if (rpcData && !rpcData.sucesso) {
        return { data: null, error: new Error(rpcData.mensagem || 'Falha ao redefinir senha.') };
      }

      if (rpcError) {
        throw rpcError;
      }
    } catch (err) {
      const savedFallback = localStorage.getItem(`inails_reset_${digits}`);
      if (savedFallback) {
        const parsed = JSON.parse(savedFallback);
        if (parsed.codigo === codigo.trim() && Date.now() <= parsed.expira) {
          localStorage.removeItem(`inails_reset_${digits}`);
          return {
            data: { sucesso: true, aviso: 'Execute o script SQL no Supabase para habilitar a atualização de senha no banco.' },
            error: null,
          };
        }
      }
      return {
        data: null,
        error: new Error(
          err.message?.includes('function')
            ? 'Função de recuperação não encontrada no Supabase. Execute o script SQL no painel do Supabase.'
            : (err.message || 'Erro ao redefinir senha.')
        ),
      };
    }
  },

  /**
   * Observa mudanças no estado de autenticação
   */
  onAuthStateChange(callback) {
    if (isDemoSession() || !isSupabaseConfigured) {
      const checkInterval = setInterval(() => {
        if (isDemoSession()) {
          const session = localStorage.getItem(DEMO_USER_SESSION_KEY);
          if (session) {
            callback('SIGNED_IN', JSON.parse(session));
          }
        }
      }, 5000);
      return {
        data: {
          subscription: {
            unsubscribe: () => clearInterval(checkInterval)
          }
        }
      };
    }

    return supabase.auth.onAuthStateChange(callback);
  }
};

export default authService;
