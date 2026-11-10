import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Calendar, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export function EditarAgendamentoModal({
  isOpen,
  onClose,
  agendamento,
  clientes = [],
  servicos = [],
  onSalvar,
}) {
  const [clienteId, setClienteId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [dataAtendimento, setDataAtendimento] = useState('');
  const [horarioAtendimento, setHorarioAtendimento] = useState('');
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState('pendente');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agendamento && isOpen) {
      setClienteId(agendamento.cliente_id || '');
      setServicoId(agendamento.servico_id || '');
      setValor(agendamento.valor !== undefined ? String(agendamento.valor) : '');
      setStatus(agendamento.status || 'pendente');
      setObservacao(agendamento.observacao || '');

      if (agendamento.data_hora) {
        try {
          const d = new Date(agendamento.data_hora);
          setDataAtendimento(format(d, 'yyyy-MM-dd'));
          setHorarioAtendimento(format(d, 'HH:mm'));
        } catch {
          setDataAtendimento('');
          setHorarioAtendimento('14:00');
        }
      }
    }
  }, [agendamento, isOpen]);

  const handleServicoChange = (e) => {
    const sId = e.target.value;
    setServicoId(sId);
    const servico = servicos.find((s) => s.id === sId);
    if (servico && servico.valor_padrao !== undefined) {
      setValor(String(servico.valor_padrao));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteId || !servicoId || !dataAtendimento || !horarioAtendimento) {
      alert('Por favor, preencha cliente, serviço, dia e horário.');
      return;
    }

    setLoading(true);
    try {
      const [ano, mes, dia] = dataAtendimento.split('-').map(Number);
      const [hora, min] = horarioAtendimento.split(':').map(Number);
      const dataHoraObj = new Date(ano, mes - 1, dia, hora, min, 0);

      await onSalvar(agendamento.id, {
        cliente_id: clienteId,
        servico_id: servicoId,
        data_hora: dataHoraObj.toISOString(),
        valor: parseFloat(valor) || 0,
        status,
        observacao,
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
      title="Editar Agendamento"
      description="Atualize o procedimento, data, horário, valor ou status"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

        {/* Seleção de Serviço / Procedimento */}
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

        {/* Dia e Horário em Labels Separados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Dia do Atendimento *"
            type="date"
            value={dataAtendimento}
            onChange={(e) => setDataAtendimento(e.target.value)}
            icon={Calendar}
            required
          />

          <Input
            label="Horário *"
            type="time"
            value={horarioAtendimento}
            onChange={(e) => setHorarioAtendimento(e.target.value)}
            icon={Clock}
            required
          />
        </div>

        {/* Valor Cobrado e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Valor do Serviço (R$)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            icon={DollarSign}
          />

          <Select
            label="Status do Atendimento"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </Select>
        </div>

        {/* Observações */}
        <Input
          label="Observações / Detalhes da Unha"
          placeholder="Ex: Formato bailarina, esmalte nude, manutenção rápida"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />

        {/* Botões de Ação */}
        <div className="pt-2 flex items-center gap-2">
          <Button variant="outline" fullWidth onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button variant="primary" fullWidth type="submit" loading={loading} icon={CheckCircle2}>
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditarAgendamentoModal;

