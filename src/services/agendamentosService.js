import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
import { getMockDB, saveMockDB } from './mockData';
import { isDemoSession } from './authService';
import { calcularProximasManutencoes } from '../utils/recurrence';
import { startOfDay, endOfDay, addDays, isSameDay, parseISO } from 'date-fns';

export const agendamentosService = {
  /**
   * Lista todos os agendamentos com filtros opcionais
   */
  async listar({ dataInicio, dataFim, clienteId } = {}) {
    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      let list = [...(db.agendamentos || [])];

      if (clienteId) {
        list = list.filter(a => a.cliente_id === clienteId);
      }

      if (dataInicio && dataFim) {
        const dIni = new Date(dataInicio).getTime();
        const dFim = new Date(dataFim).getTime();
        list = list.filter(a => {
          const t = new Date(a.data_hora).getTime();
          return t >= dIni && t <= dFim;
        });
      }

      // Preenche relacionamentos com clientes e servicos
      const populados = list.map(a => {
        const cliente = db.clientes.find(c => c.id === a.cliente_id);
        const servico = db.servicos_base.find(s => s.id === a.servico_id);
        return {
          ...a,
          clientes: cliente || null,
          servicos_base: servico || null,
        };
      });

      populados.sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
      return { data: populados, error: null };
    }

    let query = supabase
      .from('agendamentos')
      .select('*, clientes(id, nome, telefone), servicos_base(id, nome, intervalo_dias_manutencao, valor_padrao)')
      .order('data_hora', { ascending: true });

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    if (dataInicio && dataFim) {
      query = query.gte('data_hora', dataInicio).lte('data_hora', dataFim);
    }

    const { data, error } = await query;
    return { data, error };
  },

  /**
   * Retorna os agendamentos de amanhã que ainda NÃO estão confirmados (D-1 WhatsApp)
   */
  async listarDeAmanhaNaoConfirmados() {
    const amanha = addDays(new Date(), 1);
    const inicioAmanha = startOfDay(amanha);
    const fimAmanha = endOfDay(amanha);

    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      const list = (db.agendamentos || []).filter(a => {
        const d = parseISO(a.data_hora);
        const ehAmanha = isSameDay(d, amanha);
        const statusNaoConfirmado = a.status === 'pendente';
        return ehAmanha && statusNaoConfirmado;
      });

      const populados = list.map(a => ({
        ...a,
        clientes: db.clientes.find(c => c.id === a.cliente_id) || null,
        servicos_base: db.servicos_base.find(s => s.id === a.servico_id) || null
      }));

      return { data: populados, error: null };
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .select('*, clientes(id, nome, telefone), servicos_base(id, nome, valor_padrao)')
      .gte('data_hora', inicioAmanha.toISOString())
      .lte('data_hora', fimAmanha.toISOString())
      .eq('status', 'pendente')
      .order('data_hora', { ascending: true });

    return { data, error };
  },

  /**
   * Cria novo agendamento com opção de projeção de recorrência automática
   */
  async criar(dados = {}, opcoes = {}) {
    const {
      cliente_id,
      servico_id,
      data_hora,
      valor,
      observacao = '',
    } = dados;

    const gerarProjecoes = Boolean(opcoes.gerarProjecoes ?? dados.gerarProjecoes ?? false);
    const intervaloDias = Number(opcoes.intervaloDias ?? dados.intervaloDias ?? 21);
    const qtdCiclos = Number(opcoes.qtdCiclos ?? dados.qtdCiclos ?? 2);
    const diasTrabalho = opcoes.diasTrabalho ?? dados.diasTrabalho ?? [1, 2, 3, 4, 5, 6];
    const valorManutencaoFinal = Number(
      opcoes.valorManutencao !== undefined && opcoes.valorManutencao !== null
        ? opcoes.valorManutencao
        : dados.valorManutencao !== undefined && dados.valorManutencao !== null
        ? dados.valorManutencao
        : valor || 0
    );

    const novoAgendamento = {
      cliente_id,
      servico_id,
      data_hora,
      valor: Number(valor || 0),
      observacao,
      status: 'pendente',
      is_recorrente: false,
    };

    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      const idPrincipal = 'a_' + Date.now();
      const principal = {
        ...novoAgendamento,
        id: idPrincipal,
        user_id: db.profile?.user_id || 'demo-user-id',
        created_at: new Date().toISOString()
      };
      db.agendamentos.push(principal);

      // Gerar manutenções futuras se solicitado
      if (gerarProjecoes && intervaloDias > 0) {
        const perfilDias = db.profile?.dias_trabalho || diasTrabalho;
        const projecoes = calcularProximasManutencoes(data_hora, intervaloDias, qtdCiclos, perfilDias);
        projecoes.forEach(proj => {
          db.agendamentos.push({
            id: 'a_rec_' + Date.now() + '_' + proj.ciclo + '_' + Math.random().toString(36).substring(2, 6),
            user_id: db.profile?.user_id || 'demo-user-id',
            cliente_id,
            servico_id,
            data_hora: proj.dataISO,
            valor: valorManutencaoFinal,
            status: 'pendente',
            is_recorrente: true,
            observacao: `[Manutenção ${proj.ciclo}/2] Próxima manutenção sugerida`,
            created_at: new Date().toISOString()
          });
        });
      }

      saveMockDB(db);
      return { data: principal, error: null };
    }

    const { data: { user } } = await supabase.auth.getUser();

    // 1. Cria agendamento principal
    const { data: principal, error: errPrincipal } = await supabase
      .from('agendamentos')
      .insert({
        ...novoAgendamento,
        user_id: user?.id,
      })
      .select()
      .single();

    if (errPrincipal) return { data: null, error: errPrincipal };

    // 2. Cria projeções de agendamentos no banco para as próximas manutenções
    if (gerarProjecoes && intervaloDias > 0) {
      const projecoes = calcularProximasManutencoes(data_hora, intervaloDias, qtdCiclos, diasTrabalho);
      const registrosProjecoes = projecoes.map(proj => ({
        user_id: user?.id,
        cliente_id,
        servico_id,
        data_hora: proj.dataISO,
        valor: valorManutencaoFinal,
        status: 'pendente',
        is_recorrente: true,
        observacao: `[Manutenção ${proj.ciclo}/2] Próxima manutenção sugerida`,
      }));

      await supabase.from('agendamentos').insert(registrosProjecoes);
    }

    return { data: principal, error: null };
  },

  /**
   * Atualiza os dados de um agendamento (serviço, cliente, data_hora, valor, observação, status)
   */
  async atualizar(id, dados) {
    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      const index = db.agendamentos.findIndex(a => a.id === id);
      if (index !== -1) {
        db.agendamentos[index] = {
          ...db.agendamentos[index],
          ...dados,
          valor: dados.valor !== undefined ? Number(dados.valor) : db.agendamentos[index].valor,
          updated_at: new Date().toISOString(),
        };
        saveMockDB(db);

        const atualizado = db.agendamentos[index];
        const populado = {
          ...atualizado,
          clientes: db.clientes.find(c => c.id === atualizado.cliente_id) || null,
          servicos_base: db.servicos_base.find(s => s.id === atualizado.servico_id) || null,
        };
        return { data: populado, error: null };
      }
      return { data: null, error: 'Agendamento não encontrado' };
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .update(dados)
      .eq('id', id)
      .select('*, clientes(id, nome, telefone), servicos_base(id, nome, intervalo_dias_manutencao, valor_padrao)')
      .single();

    return { data, error };
  },

  /**
   * Atualiza status de um agendamento (pendente, confirmado, concluido, cancelado)
   */
  async atualizarStatus(id, status) {
    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      const index = db.agendamentos.findIndex(a => a.id === id);
      if (index !== -1) {
        db.agendamentos[index].status = status;
        saveMockDB(db);
        return { data: db.agendamentos[index], error: null };
      }
      return { data: null, error: 'Agendamento não encontrado' };
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Exclui agendamento
   */
  async excluir(id) {
    if (isDemoSession() || !isSupabaseConfigured) {
      const db = getMockDB();
      db.agendamentos = db.agendamentos.filter(a => a.id !== id);
      saveMockDB(db);
      return { error: null };
    }

    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id);

    return { error };
  }
};

export default agendamentosService;
