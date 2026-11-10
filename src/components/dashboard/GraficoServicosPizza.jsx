import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatMoeda } from '../../utils/formatters';
import { subMonths, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PieChart as PieChartIcon } from 'lucide-react';

const CORES_PALETA = [
  '#9B6DF1', // Lavanda Marca Principal (iNails)
  '#C6AEF8', // Lilás Pastel Logo
  '#10B981', // Verde Esmeralda
  '#F59E0B', // Âmbar Dourado
  '#06B6D4', // Ciano Turquesa
  '#3B82F6', // Azul Céu
  '#EC4899', // Rosa Pink Suave
  '#F43F5E', // Carmim / Rubi
];

export function GraficoServicosPizza({
  agendamentos = [],
  servicos = [],
}) {
  const [servicoAtivo, setServicoAtivo] = useState(null);

  // Calcula os dados dos últimos 6 meses
  const { dadosPizza, totalAtendimentos6Meses, totalFaturamento6Meses, periodoTexto } = useMemo(() => {
    const hoje = new Date();
    const dataLimite6Meses = subMonths(hoje, 6);

    const inicioStr = format(dataLimite6Meses, "MMM 'de' yyyy", { locale: ptBR });
    const fimStr = format(hoje, "MMM 'de' yyyy", { locale: ptBR });
    const periodoTexto = `${inicioStr.charAt(0).toUpperCase() + inicioStr.slice(1)} a ${fimStr.charAt(0).toUpperCase() + fimStr.slice(1)}`;

    // Filtra agendamentos concluídos nos últimos 6 meses
    const concluidos6M = agendamentos.filter((a) => {
      if (a.status !== 'concluido' || !a.data_hora) return false;
      try {
        const d = parseISO(a.data_hora);
        return d >= dataLimite6Meses && d <= hoje;
      } catch {
        return false;
      }
    });

    // Mapa de contagem por serviço
    const mapa = new Map();

    // 1. Inicializa todos os serviços do catálogo (para mostrar todos os serviços)
    servicos.forEach((s) => {
      mapa.set(s.id || s.nome, {
        id: s.id,
        nome: s.nome,
        qtd: 0,
        faturamento: 0,
        valor_padrao: Number(s.valor_padrao || 0),
      });
    });

    // 2. Acumula os atendimentos realizados nos últimos 6 meses
    concluidos6M.forEach((a) => {
      const servicoId = a.servico_id || a.servicos_base?.id || a.servicos_base?.nome || 'outro';
      const nomeServico = a.servicos_base?.nome || 'Outros';
      const valor = Number(a.valor || a.servicos_base?.valor_padrao || 0);

      if (mapa.has(servicoId)) {
        const item = mapa.get(servicoId);
        item.qtd += 1;
        item.faturamento += valor;
      } else {
        mapa.set(servicoId, {
          id: servicoId,
          nome: nomeServico,
          qtd: 1,
          faturamento: valor,
          valor_padrao: valor,
        });
      }
    });

    const lista = Array.from(mapa.values());

    // Ordena do mais realizado para o menos realizado
    lista.sort((a, b) => b.qtd - a.qtd || b.faturamento - a.faturamento);

    const totalAtendimentos = concluidos6M.length;
    const totalFaturamento = concluidos6M.reduce(
      (acc, cur) => acc + Number(cur.valor || cur.servicos_base?.valor_padrao || 0),
      0
    );

    // Atribui cor e percentual para cada fatia
    const dadosComCor = lista.map((item, idx) => {
      const percentual = totalAtendimentos > 0 ? (item.qtd / totalAtendimentos) * 100 : 0;
      return {
        ...item,
        cor: CORES_PALETA[idx % CORES_PALETA.length],
        percentual: Math.round(percentual),
        percentualExato: percentual,
      };
    });

    return {
      dadosPizza: dadosComCor,
      totalAtendimentos6Meses: totalAtendimentos,
      totalFaturamento6Meses: totalFaturamento,
      periodoTexto,
    };
  }, [agendamentos, servicos]);

  // Raio e circunferência do círculo da Pizza/Donut SVG
  const raio = 65;
  const circunferencia = 2 * Math.PI * raio; // ≈ 408.4

  // Prepara fatias do Donut com offset acumulado
  let offsetAcumulado = 0;
  const fatiasSVG = dadosPizza
    .filter((item) => item.qtd > 0)
    .map((item) => {
      const comprimentoFatia = (item.qtd / (totalAtendimentos6Meses || 1)) * circunferencia;
      const fatia = {
        ...item,
        dasharray: `${comprimentoFatia} ${circunferencia}`,
        dashoffset: -offsetAcumulado,
      };
      offsetAcumulado += comprimentoFatia;
      return fatia;
    });

  const selecionado = servicoAtivo || dadosPizza[0];

  return (
    <Card padding="p-4.5" className="flex flex-col gap-3">
      {/* Topo do Card */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Serviços Mais Realizados
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribuição dos procedimentos nos últimos 6 meses
          </p>
        </div>
      </div>

      {totalAtendimentos6Meses === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          Nenhum procedimento concluído registrado nos últimos 6 meses.
        </div>
      ) : (
        <>
          {/* Seção Gráfico de Pizza SVG Donut */}
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
                {/* Círculo de fundo */}
                <circle
                  cx="90"
                  cy="90"
                  r={raio}
                  stroke="#F1F5F9"
                  strokeWidth="24"
                  fill="transparent"
                />

                {/* Fatias da Pizza */}
                {fatiasSVG.map((fatia) => {
                  const isHighlight = selecionado?.nome === fatia.nome;
                  return (
                    <circle
                      key={fatia.nome}
                      cx="90"
                      cy="90"
                      r={raio}
                      stroke={fatia.cor}
                      strokeWidth={isHighlight ? 28 : 24}
                      strokeDasharray={fatia.dasharray}
                      strokeDashoffset={fatia.dashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="cursor-pointer transition-all duration-300 hover:opacity-90"
                      onClick={() => setServicoAtivo(fatia)}
                      onMouseEnter={() => setServicoAtivo(fatia)}
                    />
                  );
                })}
              </svg>

              {/* Centro do Donut com Total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {totalAtendimentos6Meses}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Atendimentos
                </span>
                <span className="text-[9px] text-brand-600 font-medium">
                  6 meses
                </span>
              </div>
            </div>

            {/* Destaque do Serviço Clicado / Selecionado */}
            {selecionado && (
              <div className="flex-1 w-full sm:w-auto bg-slate-50/90 rounded-2xl p-3 border border-slate-100 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: selecionado.cor }}
                  />
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    {selecionado.nome}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/70 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Realizados
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {selecionado.qtd} visitas ({selecionado.percentual}%)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      Faturamento Gerado
                    </span>
                    <span className="font-extrabold text-brand-700">
                      {formatMoeda(selecionado.faturamento)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lista Completa de Serviços (Ranking & Percentual) */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Serviços no Período ({periodoTexto}):
            </span>

            {dadosPizza.map((servico, idx) => {
              const isHighlight = selecionado?.nome === servico.nome;
              return (
                <div
                  key={servico.nome}
                  onClick={() => setServicoAtivo(servico)}
                  className={`
                    flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all text-xs
                    ${
                      isHighlight
                        ? 'bg-slate-100/90 font-bold shadow-xs'
                        : 'hover:bg-slate-50'
                    }
                  `}
                >
                  {/* Posição, Cor e Nome */}
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="w-4 h-4 rounded-full bg-slate-200/80 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: servico.cor }}
                    />
                    <span className="text-slate-800 truncate">
                      {servico.nome}
                    </span>
                  </div>

                  {/* Quantidade, Percentual e Valor */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-slate-700 w-20 text-right">
                      {formatMoeda(servico.faturamento)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

export default GraficoServicosPizza;

