import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Sparkles, Calendar, Clock, DollarSign, Repeat, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NovoAgendamentoModal({
  isOpen,
  onClose,
  clientes = [],
  servicos = [],
  dataInicial,
  onSalvar,
}) {
  const [clienteId, setClienteId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [dataHora, setDataHora] = useState(() => {
    const d = dataInicial ? new Date(dataInicial) : new Date();
    return format(d, "yyyy-MM-dd'T'14:00");
  });
  const [valor, setValor] = useState('');
  const [observacao, setObservacao] = useState('');
  const [gerarProjecoes, setGerarProjecoes] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const d = dataInicial ? new Date(dataInicial) : new Date();
      setDataHora(format(d, "yyyy-MM-dd'T'14:00"));
    }
  }, [isOpen, dataInicial]);

  // Ao selecionar um serviço, auto-preenche o valor padrão
  const handleServicoChange = (e) => {
    const sId = e.target.value;
    setServicoId(sId);
    const servico = servicos.find((s) => s.id === sId);
    if (servico) {
      setValor(servico.valor_padrao || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteId || !servicoId || !dataHora) {
      alert('Por favor, preencha cliente, serviço e data/horário.');
      return;
    }

    setLoading(true);
    const servicoSelecionado = servicos.find((s) => s.id === servicoId);
    const intervaloDias = servicoSelecionado?.intervalo_dias_manutencao || 21;

    try {
      await onSalvar(
        {
          cliente_id: clienteId,
          servico_id: servicoId,
          data_hora: new Date(dataHora).toISOString(),
          valor: parseFloat(valor) || 0,
          observacao,
        },
        {
          gerarProjecoes,
          intervaloDias,
          qtdCiclos: 3,
        }
      );
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const servicoSelecionado = servicos.find((s) => s.id === servicoId);

  let textoDataPreset = '';
  try {
    if (dataHora) {
      const d = new Date(dataHora);
      const str = format(d, "EEEE, dd 'de' MMMM", { locale: ptBR });
      textoDataPreset = str.charAt(0).toUpperCase() + str.slice(1);
    }
  } catch {
    textoDataPreset = '';
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Agendamento"
      description="Agende o atendimento e projete manutenções automáticas"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Banner do Dia Pré-Setado ao Segurar Apertado */}
        {textoDataPreset && (
          <div className="bg-brand-50/90 border border-brand-200/90 rounded-2xl p-2.5 px-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-brand-700 font-bold uppercase tracking-wider block leading-tight">
                  Dia Selecionado na Agenda
                </span>
                <span className="text-xs font-black text-brand-950">
                  {textoDataPreset}
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-brand-200/70 text-brand-800 font-bold px-2 py-0.5 rounded-full">
              Pré-setado
            </span>
          </div>
        )}

        {/* Seleção de Cliente */}
        <Select
          label="Cliente *"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          placeholder="Selecione a cliente"
          required
        >
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} {c.telefone ? `(${c.telefone})` : ''}
            </option>
          ))}
        </Select>

        {/* Seleção de Serviço */}
        <Select
          label="Procedimento / Serviço *"
          value={servicoId}
          onChange={handleServicoChange}
          placeholder="Selecione o procedimento"
          required
        >
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome} - R$ {Number(s.valor_padrao).toFixed(2)} (Ciclo {s.intervalo_dias_manutencao}d)
            </option>
          ))}
        </Select>

        {/* Data e Hora */}
        <Input
          label="Data e Horário *"
          type="datetime-local"
          value={dataHora}
          onChange={(e) => setDataHora(e.target.value)}
          required
        />

        {/* Valor Cobrado */}
        <Input
          label="Valor do Serviço (R$)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          icon={DollarSign}
        />

        {/* Observações */}
        <Input
          label="Observações / Detalhes da Unha"
          placeholder="Ex: Formato bailarina, esmalte nude, manutenção rápida"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />

        {/* Card de Recorrência Inteligente */}
        {servicoSelecionado && (
          <div className="bg-brand-50/60 border border-brand-200/80 rounded-2xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-brand-600" />
                <span className="text-xs font-bold text-brand-900">
                  Recorrência Inteligente (Manutenções)
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={gerarProjecoes}
                  onChange={(e) => setGerarProjecoes(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>
            <p className="text-[11px] text-brand-800 leading-relaxed">
              Com o intervalo de <strong>{servicoSelecionado.intervalo_dias_manutencao} dias</strong>, 
              o sistema criará automaticamente as projeções dos próximos 3 ciclos na sua agenda.
            </p>
          </div>
        )}

        {/* Botão de Ação */}
        <div className="pt-2 flex items-center gap-2">
          <Button variant="outline" fullWidth onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" fullWidth type="submit" loading={loading}>
            Salvar Agendamento
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default NovoAgendamentoModal;
