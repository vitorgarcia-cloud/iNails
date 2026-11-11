import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import { formatMoeda } from '../../utils/formatters';
import { Trophy } from 'lucide-react';

/**
 * Gráfico de colunas com o Top 5 de clientes:
 * - "Atendimentos": clientes mais atendidas (atendimentos concluídos)
 * - "Faturamento": clientes que mais geraram receita
 */
export function GraficoTopClientes({ agendamentos = [] }) {
  const [criterio, setCriterio] = useState('atendimentos'); // 'atendimentos' | 'faturamento'

  const ranking = useMemo(() => {
    const mapa = {};

    agendamentos.forEach((a) => {
      if (a.status !== 'concluido' || !a.cliente_id) return;
      const id = a.cliente_id;
      if (!mapa[id]) {
        mapa[id] = {
          id,
          nome: a.clientes?.nome || 'Cliente',
          atendimentos: 0,
          faturamento: 0,
        };
      }
      mapa[id].atendimentos += 1;
      mapa[id].faturamento += Number(a.valor || a.servicos_base?.valor_padrao || 0);
    });

    return Object.values(mapa)
      .sort((x, y) => y[criterio] - x[criterio] || y.faturamento - x.faturamento)
      .slice(0, 5);
  }, [agendamentos, criterio]);

  const maxValor = Math.max(1, ...ranking.map((c) => c[criterio]));
  const formatarValor = (v) => (criterio === 'faturamento' ? formatMoeda(v) : `${v}x`);

  return (
    <Card padding="p-[5px]" className="flex flex-col gap-3">
      {/* Topo do Card */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Top 5 Clientes</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {criterio === 'faturamento' ? 'Clientes que mais dão lucro' : 'Clientes mais atendidas'}
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl shrink-0">
          {[
            { id: 'atendimentos', label: 'Atendidas' },
            { id: 'faturamento', label: 'Lucro' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCriterio(opt.id)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                criterio === opt.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          Nenhum atendimento concluído registrado ainda.
        </div>
      ) : (
        <div className="flex items-end justify-around gap-2 h-48 pt-6 px-1 border-b-2 border-slate-300">
          {ranking.map((c, idx) => {
            const alturaPct = Math.max(6, (c[criterio] / maxValor) * 100);
            return (
              <div
                key={c.id}
                className="flex-1 min-w-0 h-full flex flex-col items-center justify-end gap-1"
                title={`${c.nome}\n${c.atendimentos} atendimento(s)\n${formatMoeda(c.faturamento)}`}
              >
                <span className="text-[10px] font-bold text-slate-700 whitespace-nowrap">
                  {formatarValor(c[criterio])}
                </span>
                <div
                  style={{ height: `${alturaPct}%` }}
                  className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 ${
                    idx === 0 ? 'bg-brand-500' : 'bg-brand-300'
                  }`}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Rótulos com nomes das clientes */}
      {ranking.length > 0 && (
        <div className="flex items-start justify-around gap-2 px-1 -mt-1">
          {ranking.map((c, idx) => (
            <div key={c.id} className="flex-1 min-w-0 text-center">
              <span className="text-[10px] font-bold text-slate-600 block truncate">
                {idx + 1}º {c.nome.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default GraficoTopClientes;

