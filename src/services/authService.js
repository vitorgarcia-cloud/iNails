import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { getMockDB, saveMockDB } from './mockData';

const DEMO_FLAG_KEY = 'inails_is_demo';
const DEMO_USER_SESSION_KEY = 'inails_demo_session';

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

    // Se o usuário foi criado mas não retornou a sessão ativa, tenta autenticar automaticamente
    if (data?.user && !data?.session) {
      const loginAttempt = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginAttempt.data?.session) {
        return { data: loginAttempt.data, error: null };
      }
    }

    return { data, error: null };
  },

  /**
   * Encerra a sessão
   */
  async signOut() {
    localStorage.removeItem(DEMO_FLAG_KEY);
    localStorage.removeItem(DEMO_USER_SESSION_KEY);

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

    return { data, error };
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
