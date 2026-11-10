import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { getMockDB, saveMockDB } from './mockData';

const DEMO_USER_SESSION_KEY = 'nailflow_demo_session';

export const authService = {
  /**
   * Realiza login por email e senha
   */
  async signIn({ email, password }) {
    if (!isSupabaseConfigured) {
      // Simulação em modo demonstração local
      const db = getMockDB();
      const demoSession = {
        user: {
          id: db.profile.user_id,
          email: email || 'jessica.nailflow@demo.com',
          user_metadata: {
            nome: db.profile.nome,
            nome_estudio: db.profile.nome_estudio,
          }
        }
      };
      localStorage.setItem(DEMO_USER_SESSION_KEY, JSON.stringify(demoSession));
      return { data: demoSession, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  /**
   * Cria nova conta de nail designer
   */
  async signUp({ email, password, nome, nomeEstudio }) {
    if (!isSupabaseConfigured) {
      const db = getMockDB();
      db.profile.nome = nome;
      db.profile.nome_estudio = nomeEstudio;
      saveMockDB(db);

      const demoSession = {
        user: {
          id: db.profile.user_id,
          email,
          user_metadata: { nome, nome_estudio: nomeEstudio }
        }
      };
      localStorage.setItem(DEMO_USER_SESSION_KEY, JSON.stringify(demoSession));
      return { data: demoSession, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          nome_estudio: nomeEstudio,
        }
      }
    });

    return { data, error };
  },

  /**
   * Encerra a sessão
   */
  async signOut() {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(DEMO_USER_SESSION_KEY);
      return { error: null };
    }
    return await supabase.auth.signOut();
  },

  /**
   * Obtém a sessão atual
   */
  async getSession() {
    if (!isSupabaseConfigured) {
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

    return await supabase.auth.getSession();
  },

  /**
   * Busca os dados de perfil da profissional logada
   */
  async getProfile(userId) {
    if (!isSupabaseConfigured) {
      const db = getMockDB();
      return { data: db.profile, error: null };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  /**
   * Atualiza dados de perfil
   */
  async updateProfile(userId, dados) {
    if (!isSupabaseConfigured) {
      const db = getMockDB();
      db.profile = { ...db.profile, ...dados };
      saveMockDB(db);
      return { data: db.profile, error: null };
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
    if (!isSupabaseConfigured) {
      // Mock listener
      const checkInterval = setInterval(() => {
        const session = localStorage.getItem(DEMO_USER_SESSION_KEY);
        if (session) {
          callback('SIGNED_IN', JSON.parse(session));
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

// Aliases para compatibilidade e imports simplificados
export default authService;
