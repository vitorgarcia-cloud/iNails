import { useState, useEffect, useCallback } from 'react';
import { agendamentosService } from '../services/agendamentosService';
import { useToast } from './useToast';

export function useAgendamentos(filtros = {}) {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const toast = useToast();

  const carregarAgendamentos = useCallback(async () => {
    setCarregando(true);
    try {
      const { data, error } = await agendamentosService.listar(filtros);
      if (error) throw error;
      setAgendamentos(data || []);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setCarregando(false);
    }
  }, [JSON.stringify(filtros)]);

  useEffect(() => {
    carregarAgendamentos();
  }, [carregarAgendamentos]);

  const criarAgendamento = async (dados, opcoes) => {
    try {
      const { data, error } = await agendamentosService.criar(dados, opcoes);
      if (error) throw error;
      await carregarAgendamentos();
      toast.success(
        opcoes?.gerarProjecoes
          ? 'Agendamento e projeções de manutenção geradas!'
          : 'Agendamento salvo com sucesso!'
      );
      return { data, error: null };
    } catch (err) {
      toast.error('Erro ao salvar agendamento.');
      return { data: null, error: err };
    }
  };

  const atualizarAgendamento = async (id, dados) => {
    try {
      const { data, error } = await agendamentosService.atualizar(id, dados);
      if (error) throw error;
      await carregarAgendamentos();
      toast.success('Agendamento atualizado com sucesso!');
      return { data, error: null };
    } catch (err) {
      toast.error('Erro ao atualizar agendamento.');
      return { data: null, error: err };
    }
  };

  const atualizarStatus = async (id, status) => {
    try {
      const { data, error } = await agendamentosService.atualizarStatus(id, status);
      if (error) throw error;
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      toast.success(`Status atualizado para "${status}"`);
      return { data, error: null };
    } catch (err) {
      toast.error('Erro ao atualizar status.');
      return { data: null, error: err };
    }
  };

  const removerAgendamento = async (id) => {
    try {
      const { error } = await agendamentosService.excluir(id);
      if (error) throw error;
      setAgendamentos((prev) => prev.filter((a) => a.id !== id));
      toast.success('Agendamento excluído.');
      return { error: null };
    } catch (err) {
      toast.error('Erro ao excluir agendamento.');
      return { error: err };
    }
  };

  return {
    agendamentos,
    carregando,
    recarregar: carregarAgendamentos,
    criarAgendamento,
    atualizarAgendamento,
    atualizarStatus,
    removerAgendamento,
  };
}
