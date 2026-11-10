import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { getMockDB, saveMockDB } from './mockData';

export const servicosService = {
  /**
   * Lista todos os serviços base da nail designer
   */
  async listar() {
    if (!isSupabaseConfigured) {
      const db = getMockDB();
      return { data: db.servicos_base || [], error: null };
    }

    const { data, error } = await supabase
      .from('servicos_base')
      .select('*')
      .order('nome', { ascending: true });

    return { data, error };
  },

  /**
   * Cria um novo serviço base
   */
  async criar({ nome, intervalo_dias_manutencao = 21, valor_padrao = 0 }) {
    if (!isSupabaseConfigured) {
      const db = getMockDB();
      const novo = {
        id: 's_' + Date.now(),
        user_id: db.profile.user_id,
        nome,
        intervalo_dias_manutencao: Number(intervalo_dias_manutencao),
        valor_padrao: Number(valor_padrao),
        created_at: new Date().toISOString()
      };
      db.servicos_base.push(novo);
      saveMockDB(db);
      return { data: novo, error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('servicos_base')
      .insert({
        user_id: user?.id,
        nome,
        intervalo_dias_manutencao: Number(intervalo_dias_manutencao),
        valor_padrao: Number(valor_padrao)
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Atualiza serviço base
   */
  async atualizar(id, dados) {
    if (!isSupabaseConfigured) {
      const db = getMockDB();
      const index = db.servicos_base.findIndex(s => s.id === id);
      if (index !== -1) {
        db.servicos_base[index] = { ...db.servicos_base[index], ...dados };
        saveMockDB(db);
        return { data: db.servicos_base[index], error: null };
      }
      return { data: null, error: 'Serviço não encontrado' };
    }

    const { data, error } = await supabase
      .from('servicos_base')
      .update(dados)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Exclui serviço base
   */
  async excluir(id) {
    if (!isSupabaseConfigured) {
      const db = getMockDB();
      db.servicos_base = db.servicos_base.filter(s => s.id !== id);
      saveMockDB(db);
      return { error: null };
    }

    const { error } = await supabase
      .from('servicos_base')
      .delete()
      .eq('id', id);

    return { error };
  }
};

export default servicosService;
