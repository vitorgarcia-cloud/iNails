import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatMoeda, formatTelefone, formatDataBR } from '../../utils/formatters';
import { parseISO } from 'date-fns';
import { Users, Crown, ChevronRight, Phone, Calendar, HeartHandshake } from 'lucide-react';

export function TabelaTopClientes({
  agendamentos = [],
  clientes = [],
}) {
  const navigate = useNavigate();

  // Calcula o ranking dos top 5 clientes mais atendidos
  const topClientes = useMemo(() => {
    const mapaClientes = new Map();

    // Inicializa clientes cadastrados
    clientes.forEach((c) => {
      mapaClientes.set(c.id, {
        id: c.id,
        nome: c.nome,
        telefone: c.telefone || '',
        totalAtendimentos: 0,
        totalGasto: 0,
        ultimaVisita: null,
        servicosContagem: {},
      });
    });

    // Processa agendamentos concluídos
    agendamentos.forEach((a) => {
      if (a.status !== 'concluido' || !a.cliente_id) return;

      const cId = a.cliente_id;
      let clienteObj = mapaClientes.get(cId);

      if (!clienteObj) {
        clienteObj = {
          id: cId,
          nome: a.clientes?.nome || 'Cliente',
          telefone: a.clientes?.telefone || '',
          totalAtendimentos: 0,
          totalGasto: 0,
          ultimaVisita: null,
          servicosContagem: {},
        };
        mapaClientes.set(cId, clienteObj);
      }

      clienteObj.totalAtendimentos += 1;
      clienteObj.totalGasto += Number(a.valor || a.servicos_base?.valor_padrao || 0);

      const dataA = a.data_hora ? parseISO(a.data_hora) : null;
      if (dataA && (!clienteObj.ultimaVisita || dataA > clienteObj.ultimaVisita)) {
        clienteObj.ultimaVisita = dataA;
      }

      const servicoNome = a.servicos_base?.nome;
      if (servicoNome) {
        clienteObj.servicosContagem[servicoNome] = (clienteObj.servicosContagem[servicoNome] || 0) + 1;
      }
    });

    // Converte para array e ordena pelos mais atendidos
    const lista = Array.from(mapaClientes.values()).map((c) => {
      // Descobre o procedimento favorito da cliente
      let favorito = '-';
      let maxQtd = 0;
      Object.entries(c.servicosContagem || {}).forEach(([nome, qtd]) => {
        if (qtd > maxQtd) {
          maxQtd = qtd;
          favorito = nome;
        }
      });
      return { ...c, servicoFavorito: favorito };
    });

    // Ordena decrescente por quantidade de atendimentos e total gasto
    lista.sort((a, b) => b.totalAtendimentos - a.totalAtendimentos || b.totalGasto - a.totalGasto);

    return lista.slice(0, 5);
  }, [agendamentos, clientes]);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Cabeçalho da Tabela */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <Crown className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Top 5 Clientes Mais Atendidas
          </h4>
        </div>
        <button
          onClick={() => navigate('/clientes')}
          className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-0.5"
        >
          <span>Ver todas</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {topClientes.length === 0 ? (
        <div className="py-4 text-center text-slate-400 text-xs">
          Nenhum atendimento concluído para exibir o ranking.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left text-xs min-w-[340px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 select-none">
                <th className="py-2 pr-1 w-6">#</th>
                <th className="py-2 px-2">Cliente</th>
                <th className="py-2 px-2 text-center">Atendimentos</th>
                <th className="py-2 px-2 text-right">Total Investido</th>
                <th className="py-2 pl-2 text-right">Última Visita</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {topClientes.map((cliente, idx) => {
                const medalhas = ['🥇', '🥈', '🥉'];
                const badgeRank = medalhas[idx] || `${idx + 1}º`;

                return (
                  <tr
                    key={cliente.id}
                    onClick={() => navigate(`/clientes/${cliente.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    title={`Ver perfil e histórico de ${cliente.nome}`}
                  >
                    {/* Rank */}
                    <td className="py-2.5 pr-1 font-bold text-sm select-none">
                      {badgeRank}
                    </td>

                    {/* Cliente */}
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                          {cliente.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate group-hover:text-brand-600 transition-colors">
                            {cliente.nome}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {cliente.telefone ? formatTelefone(cliente.telefone) : cliente.servicoFavorito}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Atendimentos Realizados */}
                    <td className="py-2.5 px-2 text-center">
                      <span className="inline-flex items-center justify-center bg-brand-50 text-brand-700 border border-brand-100 font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-2xs">
                        {cliente.totalAtendimentos} {cliente.totalAtendimentos === 1 ? 'visita' : 'visitas'}
                      </span>
                    </td>

                    {/* Total Investido */}
                    <td className="py-2.5 px-2 text-right font-black text-slate-900 whitespace-nowrap">
                      {formatMoeda(cliente.totalGasto)}
                    </td>

                    {/* Última Visita */}
                    <td className="py-2.5 pl-2 text-right text-[11px] text-slate-500 whitespace-nowrap">
                      {cliente.ultimaVisita ? formatDataBR(cliente.ultimaVisita) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TabelaTopClientes;

