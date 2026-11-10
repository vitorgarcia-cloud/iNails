import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inicializa sessão e listener de autenticação
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data } = await authService.getSession();
        if (mounted && data?.session?.user) {
          const currentUser = data.session.user;
          setUser(currentUser);
          await loadUserProfile(currentUser.id);
        } else if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Erro ao inicializar sessão:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = authService.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
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

  async function signIn({ email, password }) {
    setLoading(true);
    try {
      const { data, error } = await authService.signIn({ email, password });
      if (error) throw error;
      if (data?.session?.user || data?.user) {
        const loggedUser = data.session?.user || data.user;
        setUser(loggedUser);
        await loadUserProfile(loggedUser.id);
      }
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }

  async function signUp({ email, password, nome, nomeEstudio }) {
    setLoading(true);
    try {
      const { data, error } = await authService.signUp({ email, password, nome, nomeEstudio });
      if (error) throw error;
      if (data?.session?.user || data?.user) {
        const newUser = data.session?.user || data.user;
        setUser(newUser);
        await loadUserProfile(newUser.id);
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

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signOut,
    updateProfile,
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
