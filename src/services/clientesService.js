import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { getMockDB, saveMockDB } from './mockData';
import { isDemoSession } from './authService';
import { differenceInDays, parseISO } from 'date-fns';

export const clientesService = {
  /**
   * Lista todos os clientes do usuário logado
   */
  async listar() {
    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      return { data: db.clientes, error: null };
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true });

    return { data, error };
  },

  /**
   * Obtém detalhes de uma cliente por ID
   */
  async obterPorId(id) {
    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      const cliente = db.clientes.find(c => c.id === id);
      return { data: cliente || null, error: cliente ? null : 'Cliente não encontrada' };
    }

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  },

  /**
   * Cadastra nova cliente
   */
  async criar({ nome, telefone, data_nascimento, observacoes }) {
    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      const novo = {
        id: 'c_' + Date.now(),
        user_id: db.profile.user_id,
        nome,
        telefone,
        data_nascimento: data_nascimento || null,
        observacoes: observacoes || '',
        created_at: new Date().toISOString()
      };
      db.clientes.unshift(novo);
      saveMockDB(db);
      return { data: novo, error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('clientes')
      .insert({
        user_id: user?.id,
        nome,
        telefone,
        data_nascimento: data_nascimento || null,
        observacoes: observacoes || ''
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Atualiza dados de uma cliente
   */
  async atualizar(id, dados) {
    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      const index = db.clientes.findIndex(c => c.id === id);
      if (index !== -1) {
        db.clientes[index] = { ...db.clientes[index], ...dados };
        saveMockDB(db);
        return { data: db.clientes[index], error: null };
      }
      return { data: null, error: 'Cliente não encontrada' };
    }

    const { data, error } = await supabase
      .from('clientes')
      .update(dados)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Exclui cliente
   */
  async excluir(id) {
    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      db.clientes = db.clientes.filter(c => c.id !== id);
      saveMockDB(db);
      return { error: null };
    }

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    return { error };
  },

  /**
   * Calcula o histórico de visitas, LTV (faturamento acumulado) e status da cliente
   * Status: 'Ativa' (visitou nos últimos 30 dias), 'Em risco' (> 30 dias sem visita)
   */
  async obterMetricasCliente(clienteId) {
    let agendamentosCliente = [];

    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      agendamentosCliente = (db.agendamentos || []).filter(
        a => a.cliente_id === clienteId && a.status === 'concluido'
      );
    } else {
      const { data } = await supabase
        .from('agendamentos')
        .select('*, servicos_base(nome)')
        .eq('cliente_id', clienteId)
        .eq('status', 'concluido')
        .order('data_hora', { ascending: false });

      agendamentosCliente = data || [];
    }

    // Calcula LTV (Total gasto pela cliente)
    const ltv = agendamentosCliente.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
    const totalVisitas = agendamentosCliente.length;

    // Data da última visita
    let ultimaVisita = null;
    let diasSemVisita = null;
    let status = 'Sem histórico';

    if (agendamentosCliente.length > 0) {
      const ordenados = [...agendamentosCliente].sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
      ultimaVisita = ordenados[0].data_hora;
      diasSemVisita = differenceInDays(new Date(), parseISO(ultimaVisita));

      if (diasSemVisita <= 30) {
        status = 'Ativa';
      } else {
        status = 'Em risco';
      }
    }

    return {
      ltv,
      totalVisitas,
      ultimaVisita,
      diasSemVisita,
      status,
      historico: agendamentosCliente
    };
  }
};

export default clientesService;
