import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { getMockDB, saveMockDB } from './mockData';

export const despesasService = {
  /**
   * Lista despesas fixas ou insumos
   * @param {Object} [filtros]
   * @param {'fixa'|'insumo'} [filtros.tipo]
   */
  async listar(filtros = {}) {
    if (!isSupabaseConfigured) {
      const db = getMockDB();
      let list = [...(db.despesas_insumos || [])];
      if (filtros.tipo) {
        list = list.filter(item => item.tipo === filtros.tipo);
      }
      return { data: list, error: null };
    }

    let query = supabase
      .from('despesas_insumos')
      .select('*')
      .order('created_at', { ascending: false });

    if (filtros.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }

    const { data, error } = await query;
    return { data, error };
  },

  /**
   * Cadastra nova despesa fixa ou novo insumo
   */
  async criar({
    tipo,
    nome,
    valor = 0,
    data_vencimento = null,
    status_pagamento = 'pendente',
    qtd_uso = 0,
    qtd_reserva = 0,
    qtd_minima_alerta = 1
  }) {
    if (!isSupabaseConfigured) {
      const db = getMockDB();
      const novo = {
        id: 'd_' + Date.now(),
        user_id: db.profile.user_id,
        tipo,
        nome,
        valor: Number(valor || 0),
        data_vencimento: data_vencimento || null,
        status_pagamento: status_pagamento || 'pendente',
        qtd_uso: Number(qtd_uso || 0),
        qtd_reserva: Number(qtd_reserva || 0),
        qtd_minima_alerta: tipo === 'insumo' ? Number(qtd_minima_alerta !== undefined ? qtd_minima_alerta : 1) : 1,
        created_at: new Date().toISOString()
      };
      db.despesas_insumos.unshift(novo);
      saveMockDB(db);
      return { data: novo, error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('despesas_insumos')
      .insert({
        user_id: user?.id,
        tipo,
        nome,
        valor: Number(valor || 0),
        data_vencimento: data_vencimento || null,
        status_pagamento: status_pagamento || 'pendente',
        qtd_uso: Number(qtd_uso || 0),
        qtd_reserva: Number(qtd_reserva || 0),
        qtd_minima_alerta: tipo === 'insumo' ? Number(qtd_minima_alerta !== undefined ? qtd_minima_alerta : 1) : 1,
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Atualiza uma despesa ou insumo existente por completo
   */
  async atualizar(id, dados) {
    if (!isSupabaseConfigured) {
      const db = getMockDB();
      const index = db.despesas_insumos.findIndex(item => item.id === id);
      if (index !== -1) {
        db.despesas_insumos[index] = {
          ...db.despesas_insumos[index],
          ...dados,
          valor: dados.valor !== undefined ? Number(dados.valor) : db.despesas_insumos[index].valor,
          qtd_uso: dados.qtd_uso !== undefined ? Number(dados.qtd_uso) : db.despesas_insumos[index].qtd_uso,
          qtd_reserva: dados.qtd_reserva !== undefined ? Number(dados.qtd_reserva) : db.despesas_insumos[index].qtd_reserva,
          qtd_minima_alerta: dados.qtd_minima_alerta !== undefined ? Number(dados.qtd_minima_alerta) : db.despesas_insumos[index].qtd_minima_alerta,
        };
        saveMockDB(db);
        return { data: db.despesas_insumos[index], error: null };
      }
      return { data: null, error: 'Item não encontrado' };
    }

    const { data, error } = await supabase
      .from('despesas_insumos')
      .update(dados)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Atualiza quantidades de estoque de um frasco/insumo
   */
  async atualizarEstoque(id, { qtd_uso, qtd_reserva, qtd_minima_alerta }) {
    if (!isSupabaseConfigured) {
      const db = getMockDB();
      const index = db.despesas_insumos.findIndex(item => item.id === id);
      if (index !== -1) {
        if (qtd_uso !== undefined) db.despesas_insumos[index].qtd_uso = Number(qtd_uso);
        if (qtd_reserva !== undefined) db.despesas_insumos[index].qtd_reserva = Number(qtd_reserva);
        if (qtd_minima_alerta !== undefined) db.despesas_insumos[index].qtd_minima_alerta = Number(qtd_minima_alerta);
        saveMockDB(db);
        return { data: db.despesas_insumos[index], error: null };
      }
      return { data: null, error: 'Item não encontrado' };
    }

    const payload = {};
    if (qtd_uso !== undefined) payload.qtd_uso = Number(qtd_uso);
    if (qtd_reserva !== undefined) payload.qtd_reserva = Number(qtd_reserva);
    if (qtd_minima_alerta !== undefined) payload.qtd_minima_alerta = Number(qtd_minima_alerta);

    const { data, error } = await supabase
      .from('despesas_insumos')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Alterna status de pagamento de uma despesa fixa
   */
  async alternarStatusPagamento(id, statusAtual) {
    const novoStatus = statusAtual === 'pago' ? 'pendente' : 'pago';

    if (!isSupabaseConfigured) {
      const db = getMockDB();
      const index = db.despesas_insumos.findIndex(item => item.id === id);
      if (index !== -1) {
        db.despesas_insumos[index].status_pagamento = novoStatus;
        saveMockDB(db);
        return { data: db.despesas_insumos[index], error: null };
      }
      return { data: null, error: 'Despesa não encontrada' };
    }

    const { data, error } = await supabase
      .from('despesas_insumos')
      .update({ status_pagamento: novoStatus })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Exclui despesa ou insumo
   */
  async excluir(id) {
    if (!isSupabaseConfigured) {
      const db = getMockDB();
      db.despesas_insumos = db.despesas_insumos.filter(item => item.id !== id);
      saveMockDB(db);
      return { error: null };
    }

    const { error } = await supabase
      .from('despesas_insumos')
      .delete()
      .eq('id', id);

    return { error };
  }
};

export default despesasService;
