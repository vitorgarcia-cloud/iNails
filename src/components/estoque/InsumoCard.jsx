import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatMoeda } from '../../utils/formatters';
import { AlertTriangle, Plus, Minus, Package, Trash2, Edit2, ShieldAlert } from 'lucide-react';

export function InsumoCard({ insumo, onUpdateEstoque, onDelete, onEdit }) {
  const limiteAlerta = insumo.qtd_minima_alerta !== undefined ? insumo.qtd_minima_alerta : 1;
  const alertaReserva = (insumo.qtd_reserva ?? 0) <= limiteAlerta;

  const handleUpdate = (campo, incremento) => {
    const novoValor = Math.max(0, (insumo[campo] || 0) + incremento);
    onUpdateEstoque(insumo.id, {
      qtd_uso: campo === 'qtd_uso' ? novoValor : insumo.qtd_uso,
      qtd_reserva: campo === 'qtd_reserva' ? novoValor : insumo.qtd_reserva,
    });
  };

  return (
    <Card className="flex flex-col gap-3" padding="p-4">
      {/* Topo do Card */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800 truncate">{insumo.nome}</h4>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {insumo.valor > 0 && (
              <span className="text-xs text-slate-500 font-medium">
                Custo: {formatMoeda(insumo.valor)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {alertaReserva ? (
            <Badge variant="alerta_estoque" size="sm" dot>
              Urgente (≤ {limiteAlerta})
            </Badge>
          ) : (
            <Badge variant="ok_estoque" size="sm" dot>
              Estoque OK
            </Badge>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(insumo)}
              className="p-1 text-slate-400 hover:text-brand-600 rounded-md transition-colors"
              title="Editar insumo e limite de alerta"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(insumo.id)}
              className="p-1 text-slate-300 hover:text-rose-500 rounded-md transition-colors"
              title="Excluir insumo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Controles de Uso vs Reserva */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        {/* Frascos em Uso */}
        <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col items-center justify-between gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500">Em Uso</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleUpdate('qtd_uso', -1)}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-90 transition-transform"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-base font-extrabold text-slate-900 min-w-[20px] text-center">
              {insumo.qtd_uso}
            </span>
            <button
              onClick={() => handleUpdate('qtd_uso', 1)}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-90 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Frascos em Reserva */}
        <div
          className={`rounded-xl p-2.5 flex flex-col items-center justify-between gap-1.5 ${
            alertaReserva ? 'bg-rose-50/70 border border-rose-200' : 'bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-1">
            <span className={`text-[11px] font-semibold ${alertaReserva ? 'text-rose-700 font-bold' : 'text-slate-500'}`}>
              Estoque
            </span>
            {alertaReserva && <AlertTriangle className="w-3 h-3 text-rose-500" />}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleUpdate('qtd_reserva', -1)}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-90 transition-transform"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span
              className={`text-base font-extrabold min-w-[20px] text-center ${
                alertaReserva ? 'text-rose-700 font-black' : 'text-slate-900'
              }`}
            >
              {insumo.qtd_reserva}
            </span>
            <button
              onClick={() => handleUpdate('qtd_reserva', 1)}
              className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-90 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default InsumoCard;
