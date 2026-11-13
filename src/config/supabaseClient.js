import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  '';

// Verifica se as credenciais do Supabase foram configuradas
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('sua-url-do-supabase') &&
  supabaseUrl.startsWith('https://')
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ [iNails] Credenciais do Supabase não configuradas no arquivo .env ou no painel da Vercel. ' +
    'A aplicação está rodando em modo DEMO com armazenamento local temporário. ' +
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
  );
}

// Cria a instância do cliente Supabase com persistência garantida no LocalStorage
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://demo-inails.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'demo-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'inails_supabase_session',
    }
  }
);
