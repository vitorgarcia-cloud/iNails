import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verifica se as credenciais do Supabase foram configuradas
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('sua-url-do-supabase') &&
  supabaseUrl.startsWith('https://')
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ [iNails] Credenciais do Supabase não configuradas no arquivo .env. ' +
    'A aplicação está rodando em modo DEMO com armazenamento local temporário. ' +
    'Consulte supabase/README.md para conectar seu banco de dados PostgreSQL.'
  );
}

// Cria a instância do cliente Supabase (usando fallback seguro caso não configurado)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://demo-inails.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'demo-anon-key'
);
