import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, isDemoSession, AUTH_USER_KEY, AUTH_PROFILE_KEY } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Inicializa o usuário a partir do LocalStorage para conexão instantânea automática
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const savedUser = localStorage.getItem(AUTH_USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [profile, setProfile] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const savedProfile = localStorage.getItem(AUTH_PROFILE_KEY);
      return savedProfile ? JSON.parse(savedProfile) : null;
    } catch {
      return null;
    }
  });

  const [isDemo, setIsDemo] = useState(isDemoSession());
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    // Se o usuário já está salvo no LocalStorage, abre direto sem tela de loading
    const hasLocalUser = localStorage.getItem(AUTH_USER_KEY) || localStorage.getItem('inails_demo_session');
    return !hasLocalUser;
  });

  // Inicializa sessão e listener de autenticação
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data } = await authService.getSession();
        if (mounted && data?.session?.user) {
          const currentUser = data.session.user;
          setUser(currentUser);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
          setIsDemo(isDemoSession());
          await loadUserProfile(currentUser.id);
        } else if (mounted) {
          // Se não há sessão no Supabase e nem sessão demo, limpa persistência
          if (!isDemoSession()) {
            const hasLocal = localStorage.getItem(AUTH_USER_KEY);
            if (!hasLocal) {
              setUser(null);
              setProfile(null);
              setIsDemo(false);
            }
          }
        }
      } catch (err) {
        console.error('Erro ao inicializar sessão:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
        setIsDemo(isDemoSession());
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsDemo(false);
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_PROFILE_KEY);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  async function loadUserProfile(userId) {
    try {
      const { data } = await authService.getProfile(userId);
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    }
  }

  async function signIn({ telefone, email, password }) {
    setLoading(true);
    try {
      // Aceita telefone prioritariamente
      const tel = telefone || email;
      const { data, error } = await authService.signIn({ telefone: tel, password });
      if (error) throw error;
      if (data?.session?.user || data?.user) {
        const loggedUser = data.session?.user || data.user;
        setUser(loggedUser);
        setIsDemo(false);
        await loadUserProfile(loggedUser.id);
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }

  async function signUp({ telefone, email, password, nome, nomeEstudio }) {
    setLoading(true);
    try {
      const tel = telefone || email;
      const { data, error } = await authService.signUp({ telefone: tel, password, nome, nomeEstudio });
      if (error) throw error;
      if (data?.session?.user || data?.user) {
        const newUser = data.session?.user || data.user;
        setUser(newUser);
        setIsDemo(false);
        await loadUserProfile(newUser.id);
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }

  async function loginDemo() {
    setLoading(true);
    try {
      const { data, error } = await authService.loginDemo();
      if (error) throw error;
      if (data?.session?.user) {
        setUser(data.session.user);
        setIsDemo(true);
        await loadUserProfile(data.session.user.id);
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setIsDemo(false);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(dados) {
    if (!user) return;
    const { data, error } = await authService.updateProfile(user.id, dados);
    if (!error && data) {
      setProfile(data);
    }
    return { data, error };
  }

  async function solicitarCodigoRecuperacao(telefone) {
    return await authService.solicitarCodigoRecuperacao(telefone);
  }

  async function redefinirSenhaComCodigo({ telefone, codigo, novaSenha, autoLogin = true }) {
    const res = await authService.redefinirSenhaComCodigo({ telefone, codigo, novaSenha });
    if (res.error) return res;

    // Se solicitado autoLogin, efetua login imediato com as novas credenciais
    if (autoLogin) {
      await signIn({ telefone, password: novaSenha });
    }
    return res;
  }

  const value = {
    user,
    profile,
    loading,
    isDemo,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    loginDemo,
    signOut,
    updateProfile,
    solicitarCodigoRecuperacao,
    redefinirSenhaComCodigo,
    refreshProfile: () => user && loadUserProfile(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
