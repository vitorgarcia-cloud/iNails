import { useState, useEffect, useCallback } from 'react';
import { servicosService } from '../services/servicosService';
import { useToast } from './useToast';

export function useServicos() {
  const [servicos, setServicos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const toast = useToast();

  const carregarServicos = useCallback(async () => {
    setCarregando(true);
    try {
      const { data, error } = await servicosService.listar();
      if (error) throw error;
      setServicos(data || []);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarServicos();
  }, [carregarServicos]);

  const adicionarServico = async (dados) => {
    try {
      const { data, error } = await servicosService.criar(dados);
      if (error) throw error;
      setServicos((prev) => [...prev, data]);
      toast.success('Serviço cadastrado com sucesso!');
      return { data, error: null };
    } catch (err) {
      toast.error('Erro ao cadastrar serviço.');
      return { data: null, error: err };
    }
  };

  const atualizarServico = async (id, dados) => {
    try {
      const { data, error } = await servicosService.atualizar(id, dados);
      if (error) throw error;
      setServicos((prev) => prev.map((s) => (s.id === id ? data : s)));
      toast.success('Serviço atualizado com sucesso!');
      return { data, error: null };
    } catch (err) {
      toast.error('Erro ao atualizar serviço.');
      return { data: null, error: err };
    }
  };

  const excluirServico = async (id) => {
    try {
      const { error } = await servicosService.excluir(id);
      if (error) throw error;
      setServicos((prev) => prev.filter((s) => s.id !== id));
      toast.success('Serviço removido com sucesso!');
      return { error: null };
    } catch (err) {
      toast.error('Erro ao remover serviço.');
      return { error: err };
    }
  };

  return {
    servicos,
    carregando,
    recarregar: carregarServicos,
    adicionarServico,
    atualizarServico,
    excluirServico,
  };
}
