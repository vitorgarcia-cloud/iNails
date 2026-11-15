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
  async signUp({ telefone, password, nome, nomeEstudio, dataNascimento }) {
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
        error: new Error('A senha deve ter no mínimo 11 caracteres.')
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
          data_nascimento: dataNascimento || null,
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
        if (dataNascimento) {
          await this.updateProfile(loginAttempt.data.session.user.id, { data_nascimento: dataNascimento });
        }
        return { data: loginAttempt.data, error: null };
      }
    } else if (data?.session?.user && dataNascimento) {
      await this.updateProfile(data.session.user.id, { data_nascimento: dataNascimento });
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
   * Valida se o Telefone e a Data de Nascimento conferem com o cadastro
   */
  async validarRecuperacaoNascimento({ telefone, dataNascimento }) {
    const digits = cleanTelefone(telefone);
    if (!digits || digits.length < 10) {
      return {
        data: null,
        error: new Error('Informe um número de telefone celular válido com DDD (ex: 11 98765-4321).')
      };
    }

    if (!dataNascimento) {
      return {
        data: null,
        error: new Error('Informe sua data de nascimento.')
      };
    }

    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      const mockTel = cleanTelefone(db.profile?.telefone || '');
      const mockData = db.profile?.data_nascimento;

      if (digits === mockTel && mockData && dataNascimento !== mockData) {
        return {
          data: null,
          error: new Error('A data de nascimento não confere com o cadastro demo (Dica: 15/05/1995).')
        };
      }

      return {
        data: {
          sucesso: true,
          nome: db.profile?.nome || 'Nail Designer',
          telefone: digits,
          dataNascimento,
        },
        error: null,
      };
    }

    // Tenta via RPC no Supabase
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('validar_recuperacao_nascimento', {
        p_telefone: digits,
        p_data_nascimento: dataNascimento,
      });

      if (!rpcError && rpcData?.sucesso) {
        return {
          data: {
            sucesso: true,
            nome: rpcData.nome || 'Nail Designer',
            telefone: digits,
            dataNascimento,
          },
          error: null,
        };
      }

      if (rpcData && !rpcData.sucesso) {
        return { data: null, error: new Error(rpcData.mensagem || 'Dados incorretos.') };
      }

      if (rpcError) throw rpcError;
    } catch {
      // Fallback consultando a tabela profiles diretamente
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome, telefone, data_nascimento, user_id')
        .eq('telefone', digits)
        .maybeSingle();

      if (!profile) {
        return {
          data: null,
          error: new Error('Nenhum estúdio cadastrado com este número de telefone.')
        };
      }

      if (profile.data_nascimento && profile.data_nascimento !== dataNascimento) {
        return {
          data: null,
          error: new Error('A data de nascimento informada não confere com o cadastro.')
        };
      }

      return {
        data: {
          sucesso: true,
          nome: profile.nome || 'Nail Designer',
          telefone: digits,
          dataNascimento,
        },
        error: null,
      };
    }
  },

  /**
   * Redefine a senha utilizando Telefone + Data de Nascimento
   */
  async redefinirSenhaPorNascimento({ telefone, dataNascimento, novaSenha }) {
    const digits = cleanTelefone(telefone);
    if (!digits || digits.length < 10) {
      return { data: null, error: new Error('Telefone inválido.') };
    }
    if (!dataNascimento) {
      return { data: null, error: new Error('Data de nascimento é obrigatória.') };
    }
    if (!novaSenha || novaSenha.length < 6) {
      return { data: null, error: new Error('A nova senha deve ter no mínimo 11 caracteres.') };
    }

    if (isDemoSession() || !isSupabaseConfigured) {
      return {
        data: { sucesso: true, mensagem: 'Senha redefinida com sucesso!' },
        error: null,
      };
    }

    // Executa a função RPC segura com SECURITY DEFINER no Supabase
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('redefinir_senha_por_nascimento', {
        p_telefone: digits,
        p_data_nascimento: dataNascimento,
        p_nova_senha: novaSenha,
      });

      if (!rpcError && rpcData?.sucesso) {
        // Realiza login automático imediato com a nova senha
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
      const isFunctionNotFound = err?.code === 'PGRST202' || err?.message?.toLowerCase().includes('could not find the function');
      return {
        data: null,
        error: new Error(
          isFunctionNotFound
            ? 'Função de recuperação não encontrada no Supabase. Execute o script SQL no SQL Editor do Supabase.'
            : (err.message || 'Erro ao redefinir senha no banco de dados.')
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
