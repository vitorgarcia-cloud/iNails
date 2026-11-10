import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatDataBR, formatHoraBR, formatMoeda } from '../../utils/formatters';
import { Clock, User, CheckCircle2, XCircle, RefreshCw, Trash2 } from 'lucide-react';

export function AgendamentoCard({
  agendamento,
  onStatusChange,
  onDelete,
}) {
  const clienteNome = agendamento.clientes?.nome || 'Cliente';
  const servicoNome = agendamento.servicos_base?.nome || 'Serviço';
  const valor = agendamento.valor || agendamento.servicos_base?.valor_padrao || 0;
  const status = agendamento.status || 'pendente';
  const isRecorrente = agendamento.is_recorrente;

  const statusLabels = {
    pendente: 'Pendente',
    confirmado: 'Confirmado',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };

  return (
    <Card className="flex flex-col gap-3" padding="p-3.5">
      {/* Top Row: Horário, Status Badge & Recorrência */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>{formatHoraBR(agendamento.data_hora)}</span>
          <span className="text-slate-400 font-normal">• {formatDataBR(agendamento.data_hora)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isRecorrente && (
            <Badge variant="recorrente" size="sm">
              <RefreshCw className="w-2.5 h-2.5 inline mr-1" />
              Recorrente
            </Badge>
          )}
          <Badge variant={status} size="sm" dot>
            {statusLabels[status] || status}
          </Badge>
        </div>
      </div>

      {/* Middle Row: Cliente, Serviço e Preço */}
      <div className="flex items-start justify-between border-y border-slate-100 py-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <h4 className="text-sm font-bold text-slate-900">{clienteNome}</h4>
          </div>
          <p className="text-xs text-brand-600 font-medium mt-0.5">{servicoNome}</p>
          {agendamento.observacao && (
            <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
              {agendamento.observacao}
            </p>
          )}
        </div>

        <div className="text-right">
          <span className="text-sm font-extrabold text-slate-900">
            {formatMoeda(valor)}
          </span>
        </div>
      </div>

      {/* Bottom Actions: Mudança rápida de status */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-1.5">
          {status !== 'confirmado' && status !== 'concluido' && (
            <button
              onClick={() => onStatusChange(agendamento.id, 'confirmado')}
              className="text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition-colors"
            >
              Confirmar
            </button>
          )}
          {status !== 'concluido' && (
            <button
              onClick={() => onStatusChange(agendamento.id, 'concluido')}
              className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
            >
              Concluir
            </button>
          )}
          {status !== 'cancelado' && (
            <button
              onClick={() => onStatusChange(agendamento.id, 'cancelado')}
              className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(agendamento.id)}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
            title="Excluir agendamento"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </Card>
  );
}

export default AgendamentoCard;
