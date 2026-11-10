import React, { useState, useEffect, useCallback } from 'react';
import { despesasService } from '../../services/despesasService';
import InsumoCard from '../../components/estoque/InsumoCard';
import DespesaModal from '../../components/estoque/DespesaModal';
import Tabs from '../../components/ui/Tabs';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { formatDataBR, formatMoeda } from '../../utils/formatters';
import {
  Layers,
  Package,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2
} from 'lucide-react';

export function CustosEstoquePage() {
  const [activeTab, setActiveTab] = useState('insumos'); // 'insumos' | 'fixas'
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState(null);
  const toast = useToast();

  const carregarDados = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await despesasService.listar();
      if (error) throw error;
      setItens(data || []);
    } catch (err) {
      console.error('Erro ao listar custos:', err);
      toast.error('Erro ao carregar despesas e insumos.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleSalvar = async (dados) => {
    try {
      if (itemEmEdicao) {
        const { data, error } = await despesasService.atualizar(itemEmEdicao.id, dados);
        if (error) throw error;
        setItens((prev) => prev.map((item) => (item.id === itemEmEdicao.id ? data : item)));
        toast.success(
          dados.tipo === 'insumo' ? 'Insumo atualizado no estoque!' : 'Despesa fixa atualizada!'
        );
      } else {
        const { data, error } = await despesasService.criar(dados);
        if (error) throw error;
        setItens((prev) => [data, ...prev]);
        toast.success(
          dados.tipo === 'insumo' ? 'Insumo cadastrado no estoque!' : 'Despesa fixa cadastrada!'
        );
      }
      setItemEmEdicao(null);
    } catch (err) {
      toast.error('Erro ao salvar item.');
    }
  };

  const handleUpdateEstoque = async (id, novosValores) => {
    try {
      const { data, error } = await despesasService.atualizarEstoque(id, novosValores);
      if (error) throw error;
      setItens((prev) => prev.map((item) => (item.id === id ? { ...item, ...novosValores } : item)));
    } catch (err) {
      toast.error('Erro ao atualizar estoque.');
    }
  };

  const handleAlternarPagamento = async (id, statusAtual) => {
    try {
      const { data, error } = await despesasService.alternarStatusPagamento(id, statusAtual);
      if (error) throw error;
      setItens((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status_pagamento: statusAtual === 'pago' ? 'pendente' : 'pago' }
            : item
        )
      );
      toast.success('Status de pagamento atualizado!');
    } catch (err) {
      toast.error('Erro ao atualizar pagamento.');
    }
  };

  const handleExcluir = async (id) => {
    try {
      const { error } = await despesasService.excluir(id);
      if (error) throw error;
      setItens((prev) => prev.filter((item) => item.id !== id));
      toast.success('Item removido com sucesso.');
    } catch (err) {
      toast.error('Erro ao remover item.');
    }
  };

  const handleAbrirNovo = () => {
    setItemEmEdicao(null);
    setModalAberto(true);
  };

  const handleEditarItem = (item) => {
    setItemEmEdicao(item);
    setModalAberto(true);
  };

  const insumos = itens.filter((i) => i.tipo === 'insumo');
  const fixas = itens.filter((i) => i.tipo === 'fixa');

  // Quantidade de insumos com reserva <= limite personalizado de alerta urgente
  const insumosEmAlerta = insumos.filter((i) => {
    const limite = i.qtd_minima_alerta !== undefined ? i.qtd_minima_alerta : 1;
    return (i.qtd_reserva ?? 0) <= limite;
  }).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Topo com Título e Botão de Cadastro */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Custos e Estoque
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Despesas de estúdio e controle de estoque com alerta de urgência
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleAbrirNovo}
          icon={Plus}
        >
          Novo
        </Button>
      </div>

      {/* Alerta Visual de Reposição de Estoque */}
      {insumosEmAlerta > 0 && activeTab === 'insumos' && (
        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 text-rose-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">
                {insumosEmAlerta} {insumosEmAlerta === 1 ? 'produto atingiu' : 'produtos atingiram'} o ponto crítico de urgência!
              </p>
              <p className="text-[11px] text-rose-600 leading-tight mt-0.5">
                Quantidade em reserva menor ou igual ao limite configurado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alternador de Abas */}
      <Tabs
        tabs={[
          { id: 'insumos', label: 'Estoque / Insumos', icon: Package, count: insumos.length },
          { id: 'fixas', label: 'Despesas Fixas', icon: Layers, count: fixas.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {loading ? (
        <LoadingSpinner text="Carregando estoque e despesas..." />
      ) : activeTab === 'insumos' ? (
        /* ABA DE INSUMOS */
        insumos.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum insumo cadastrado"
            description="Cadastre seus géis, top coats e fibras para acompanhar frascos em uso, reserva e limites de urgência."
            actionLabel="Cadastrar Insumo"
            onAction={handleAbrirNovo}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {insumos.map((item) => (
              <InsumoCard
                key={item.id}
                insumo={item}
                onUpdateEstoque={handleUpdateEstoque}
                onDelete={handleExcluir}
                onEdit={handleEditarItem}
              />
            ))}
          </div>
        )
      ) : (
        /* ABA DE DESPESAS FIXAS */
        fixas.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Nenhuma despesa fixa cadastrada"
            description="Cadastre custos fixos como aluguel do espaço, eletricidade, água e internet."
            actionLabel="Cadastrar Despesa Fixa"
            onAction={handleAbrirNovo}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {fixas.map((despesa) => {
              const estaPago = despesa.status_pagamento === 'pago';
              return (
                <Card key={despesa.id} padding="p-3.5" className="flex flex-col gap-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{despesa.nome}</h4>
                      {despesa.data_vencimento && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Vence em {formatDataBR(despesa.data_vencimento)}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatMoeda(despesa.valor)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <button
                      onClick={() => handleAlternarPagamento(despesa.id, despesa.status_pagamento)}
                      className={`text-xs font-semibold px-3 py-1 rounded-xl border flex items-center gap-1.5 transition-colors ${
                        estaPago
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{estaPago ? 'Pago' : 'Marcar como Pago'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditarItem(despesa)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                        title="Editar despesa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExcluir(despesa.id)}
                        className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Excluir despesa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Modal de Cadastro / Edição */}
      <DespesaModal
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false);
          setItemEmEdicao(null);
        }}
        onSalvar={handleSalvar}
        tipoPadrao={activeTab === 'fixas' ? 'fixa' : 'insumo'}
        itemParaEdicao={itemEmEdicao}
      />
    </div>
  );
}

export default CustosEstoquePage;
