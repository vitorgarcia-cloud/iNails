import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';
import { DollarSign, Calendar, Package, Layers, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export function DespesaModal({
  isOpen,
  onClose,
  onSalvar,
  tipoPadrao = 'fixa',
  itemParaEdicao = null,
}) {
  const [tipo, setTipo] = useState(tipoPadrao);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [dataVencimento, setDataVencimento] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusPagamento, setStatusPagamento] = useState('pendente');
  const [qtdUso, setQtdUso] = useState(1);
  const [qtdReserva, setQtdReserva] = useState(1);
  const [qtdMinimaAlerta, setQtdMinimaAlerta] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (itemParaEdicao) {
        setTipo(itemParaEdicao.tipo || 'insumo');
        setNome(itemParaEdicao.nome || '');
        setValor(itemParaEdicao.valor || '');
        setDataVencimento(itemParaEdicao.data_vencimento || format(new Date(), 'yyyy-MM-dd'));
        setStatusPagamento(itemParaEdicao.status_pagamento || 'pendente');
        setQtdUso(itemParaEdicao.qtd_uso !== undefined ? itemParaEdicao.qtd_uso : 1);
        setQtdReserva(itemParaEdicao.qtd_reserva !== undefined ? itemParaEdicao.qtd_reserva : 1);
        setQtdMinimaAlerta(
          itemParaEdicao.qtd_minima_alerta !== undefined ? itemParaEdicao.qtd_minima_alerta : 1
        );
      } else {
        setTipo(tipoPadrao);
        setNome('');
        setValor('');
        setDataVencimento(format(new Date(), 'yyyy-MM-dd'));
        setStatusPagamento('pendente');
        setQtdUso(1);
        setQtdReserva(1);
        setQtdMinimaAlerta(1);
      }
    }
  }, [isOpen, itemParaEdicao, tipoPadrao]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Por favor informe o nome.');
      return;
    }

    setLoading(true);
    try {
      await onSalvar({
        tipo,
        nome: nome.trim(),
        valor: parseFloat(valor) || 0,
        data_vencimento: tipo === 'fixa' ? dataVencimento : null,
        status_pagamento: tipo === 'fixa' ? statusPagamento : 'pago',
        qtd_uso: tipo === 'insumo' ? parseInt(qtdUso, 10) || 0 : 0,
        qtd_reserva: tipo === 'insumo' ? parseInt(qtdReserva, 10) || 0 : 0,
        qtd_minima_alerta:
          tipo === 'insumo'
            ? parseInt(qtdMinimaAlerta, 10) >= 0
              ? parseInt(qtdMinimaAlerta, 10)
              : 1
            : 1,
      });

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        itemParaEdicao
          ? itemParaEdicao.tipo === 'insumo'
            ? 'Editar Insumo de Estoque'
            : 'Editar Despesa'
          : 'Cadastrar Custo ou Insumo'
      }
      description="Gerencie seus custos fixos e abastecimento de produtos com alerta de reposição"
    >
      {!itemParaEdicao && (
        <div className="mb-4">
          <Tabs
            tabs={[
              { id: 'fixa', label: 'Despesa Fixa', icon: Layers },
              { id: 'insumo', label: 'Insumo / Estoque', icon: Package },
            ]}
            activeTab={tipo}
            onChange={setTipo}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={tipo === 'fixa' ? 'Descrição da Despesa *' : 'Nome do Produto / Insumo *'}
          placeholder={tipo === 'fixa' ? 'Ex: Aluguel da sala, Luz, Internet' : 'Ex: Gel Classic Cover Vòlia'}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <Input
          label="Valor de Custo (R$)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          icon={DollarSign}
        />

        {tipo === 'fixa' ? (
          <>
            <Input
              label="Data de Vencimento"
              type="date"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
              icon={Calendar}
            />

            <Select
              label="Status do Pagamento"
              value={statusPagamento}
              onChange={(e) => setStatusPagamento(e.target.value)}
            >
              <option value="pendente">Pendente de Pagamento</option>
              <option value="pago">Já Pago</option>
            </Select>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Frascos em Uso"
                type="number"
                min="0"
                value={qtdUso}
                onChange={(e) => setQtdUso(e.target.value)}
              />
              <Input
                label="Frascos em Reserva"
                type="number"
                min="0"
                value={qtdReserva}
                onChange={(e) => setQtdReserva(e.target.value)}
              />
            </div>

            {/* SEÇÃO PEDIDA PELO USUÁRIO: A partir de qual quantidade é urgente comprar */}
            <div className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Ponto Crítico de Reposição Urgente</span>
              </div>
              <Input
                label="Definir a partir de qual quantidade reserva se torna URGENTE comprar: *"
                type="number"
                min="0"
                max="99"
                value={qtdMinimaAlerta}
                onChange={(e) => setQtdMinimaAlerta(e.target.value)}
                helperText={`Quando o estoque reserva for ≤ ${qtdMinimaAlerta || 0}, o produto será marcado com alerta vermelho de compra urgente.`}
                required
              />
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center gap-2">
          <Button variant="outline" fullWidth onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" fullWidth type="submit" loading={loading}>
            {itemParaEdicao ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default DespesaModal;
