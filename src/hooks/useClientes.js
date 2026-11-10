import { useState, useEffect, useCallback } from 'react';
import { clientesService } from '../services/clientesService';
import { useToast } from './useToast';

export function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const toast = useToast();

  const carregarClientes = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const { data, error } = await clientesService.listar();
      if (error) throw error;
      setClientes(data || []);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setErro('Não foi possível carregar a lista de clientes.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  const adicionarCliente = async (dados) => {
    try {
      const { data, error } = await clientesService.criar(dados);
      if (error) throw error;
      setClientes((prev) => [data, ...prev]);
      toast.success('Cliente cadastrada com sucesso!');
      return { data, error: null };
    } catch (err) {
      toast.error('Erro ao cadastrar cliente.');
      return { data: null, error: err };
    }
  };

  const atualizarCliente = async (id, dados) => {
    try {
      const { data, error } = await clientesService.atualizar(id, dados);
      if (error) throw error;
      setClientes((prev) => prev.map((c) => (c.id === id ? data : c)));
      toast.success('Dados da cliente atualizados!');
      return { data, error: null };
    } catch (err) {
      toast.error('Erro ao atualizar cliente.');
      return { data: null, error: err };
    }
  };

  const removerCliente = async (id) => {
    try {
      const { error } = await clientesService.excluir(id);
      if (error) throw error;
      setClientes((prev) => prev.filter((c) => c.id !== id));
      toast.success('Cliente removida.');
      return { error: null };
    } catch (err) {
      toast.error('Erro ao remover cliente.');
      return { error: err };
    }
  };

  return {
    clientes,
    carregando,
    erro,
    recarregar: carregarClientes,
    adicionarCliente,
    atualizarCliente,
    removerCliente,
  };
}
