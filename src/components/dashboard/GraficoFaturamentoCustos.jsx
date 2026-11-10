import React, { useState, useMemo } from 'react';
import Card from '../ui/Card';
import { formatMoeda } from '../../utils/formatters';
import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameYear,
  isSameDay,
  addYears,
  subYears,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar
} from 'lucide-react';

export function GraficoFaturamentoCustos({
  agendamentos = [],
  despesas = [],
  dataInicial = new Date(),
}) {
  const [tipoFiltro, setTipoFiltro] = useState('mes'); // 'ano' | 'mes' | 'semana'
  const [dataReferencia, setDataReferencia] = useState(dataInicial);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  // Navegação do período selecionado
  const handleAnterior = () => {
    if (tipoFiltro === 'ano') setDataReferencia((prev) => subYears(prev, 1));
    else if (tipoFiltro === 'mes') setDataReferencia((prev) => subMonths(prev, 1));
    else setDataReferencia((prev) => subWeeks(prev, 1));
    setItemSelecionado(null);
  };

  const handleProximo = () => {
    if (tipoFiltro === 'ano') setDataReferencia((prev) => addYears(prev, 1));
    else if (tipoFiltro === 'mes') setDataReferencia((prev) => addMonths(prev, 1));
    else setDataReferencia((prev) => addWeeks(prev, 1));
    setItemSelecionado(null);
  };

  // Cálculo das colunas com base no filtro selecionado (Ano / Mês / Semana)
  const dadosGrafico = useMemo(() => {
    // 1. FILTRO POR ANO: Mostra os 12 meses do ano
    if (tipoFiltro === 'ano') {
      const inicio = startOfYear(dataReferencia);
      const fim = endOfYear(dataReferencia);
      const meses = eachMonthOfInterval({ start: inicio, end: fim });

      return meses.map((mes) => {
        // Faturamento: Agendamentos concluídos no mês
        const agsMes = agendamentos.filter((a) => {
          if (a.status !== 'concluido' || !a.data_hora) return false;
          try {
            const d = parseISO(a.data_hora);
            return isSameMonth(d, mes) && isSameYear(d, mes);
          } catch {
            return false;
          }
        });
        const faturamento = agsMes.reduce(
          (acc, cur) => acc + Number(cur.valor || cur.servicos_base?.valor_padrao || 0),
          0
        );

        // Custos: Despesas do mês
        const despMes = despesas.filter((d) => {
          const dataStr = d.data_vencimento || d.created_at;
          if (!dataStr) return false;
          try {
            const dataD = parseISO(dataStr);
            return isSameMonth(dataD, mes) && isSameYear(dataD, mes);
          } catch {
            return false;
          }
        });
        const custos = despMes.reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        const nomeMesAbrev = format(mes, 'MMM', { locale: ptBR }).replace('.', '');
        const nomeMesCompleto = format(mes, 'MMMM yyyy', { locale: ptBR });

        return {
          id: format(mes, 'yyyy-MM'),
          label: nomeMesAbrev.charAt(0).toUpperCase() + nomeMesAbrev.slice(1),
          tituloCompleto: nomeMesCompleto.charAt(0).toUpperCase() + nomeMesCompleto.slice(1),
          faturamento,
          custos,
          lucro: faturamento - custos,
          qtdAtendimentos: agsMes.length,
        };
      });
    }

    // 2. FILTRO POR MÊS: Mostra as semanas do mês selecionado
    if (tipoFiltro === 'mes') {
      const inicioM = startOfMonth(dataReferencia);
      const fimM = endOfMonth(dataReferencia);
      const semanasIniciais = eachWeekOfInterval(
        { start: inicioM, end: fimM },
        { weekStartsOn: 1 }
      );

      return semanasIniciais.map((inicioSemana, idx) => {
        const fimSemana = endOfWeek(inicioSemana, { weekStartsOn: 1 });
        const realInicio = inicioSemana < inicioM ? inicioM : inicioSemana;
        const realFim = fimSemana > fimM ? fimM : fimSemana;

        const agsSemana = agendamentos.filter((a) => {
          if (a.status !== 'concluido' || !a.data_hora) return false;
          try {
            const d = parseISO(a.data_hora);
            return d >= realInicio && d <= realFim;
          } catch {
            return false;
          }
        });
        const faturamento = agsSemana.reduce(
          (acc, cur) => acc + Number(cur.valor || cur.servicos_base?.valor_padrao || 0),
          0
        );

        const despSemana = despesas.filter((d) => {
          const dataStr = d.data_vencimento || d.created_at;
          if (!dataStr) return false;
          try {
            const dataD = parseISO(dataStr);
            return dataD >= realInicio && dataD <= realFim;
          } catch {
            return false;
          }
        });
        const custos = despSemana.reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

        const periodoLabel = `${format(realInicio, 'dd/MM')} a ${format(realFim, 'dd/MM')}`;

        return {
          id: `sem-${idx + 1}`,
          label: `Sem ${idx + 1}`,
          tituloCompleto: `Semana ${idx + 1} (${periodoLabel})`,
          periodoLabel,
          faturamento,
          custos,
          lucro: faturamento - custos,
          qtdAtendimentos: agsSemana.length,
        };
      });
    }

    // 3. FILTRO POR SEMANA: Mostra os 7 dias da semana (Seg a Dom)
    const inicioSemana = startOfWeek(dataReferencia, { weekStartsOn: 1 });
    const dias = eachDayOfInterval({
      start: inicioSemana,
      end: endOfWeek(dataReferencia, { weekStartsOn: 1 }),
    });

    return dias.map((dia) => {
      const agsDia = agendamentos.filter((a) => {
        if (a.status !== 'concluido' || !a.data_hora) return false;
        try {
          return isSameDay(parseISO(a.data_hora), dia);
        } catch {
          return false;
        }
      });
      const faturamento = agsDia.reduce(
        (acc, cur) => acc + Number(cur.valor || cur.servicos_base?.valor_padrao || 0),
        0
      );

      const despDia = despesas.filter((d) => {
        const dataStr = d.data_vencimento || d.created_at;
        if (!dataStr) return false;
        try {
          return isSameDay(parseISO(dataStr), dia);
        } catch {
          return false;
        }
      });
      const custos = despDia.reduce((acc, cur) => acc + Number(cur.valor || 0), 0);

      const nomeDia = format(dia, 'EEE', { locale: ptBR });
      const tituloCompleto = format(dia, "EEEE, dd 'de' MMMM", { locale: ptBR });

      return {
        id: format(dia, 'yyyy-MM-dd'),
        label: nomeDia.charAt(0).toUpperCase() + nomeDia.slice(1, 3),
        sublabel: format(dia, 'dd'),
        tituloCompleto: tituloCompleto.charAt(0).toUpperCase() + tituloCompleto.slice(1),
        faturamento,
        custos,
        lucro: faturamento - custos,
        qtdAtendimentos: agsDia.length,
      };
    });
  }, [tipoFiltro, dataReferencia, agendamentos, despesas]);

  // Totais gerais do período filtrado
  const totalFaturamentoPeriodo = dadosGrafico.reduce((acc, cur) => acc + cur.faturamento, 0);
  const totalCustosPeriodo = dadosGrafico.reduce((acc, cur) => acc + cur.custos, 0);
  const lucroLiquidoPeriodo = totalFaturamentoPeriodo - totalCustosPeriodo;

  // Cálculo das faixas e valores adaptados em R$ para o Eixo Y
  const { ticksY, maxValorGrafico, faixasDivisao } = useMemo(() => {
    let max = 100;
    dadosGrafico.forEach((item) => {
      if (item.faturamento > max) max = item.faturamento;
      if (item.custos > max) max = item.custos;
    });

    // Encontra um número "bonito" e arredondado para o topo do eixo Y
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    let step = magnitude;
    if (max / step <= 2) step = magnitude / 2;
    else if (max / step <= 5) step = magnitude;
    else step = magnitude * 2;

    const teto = Math.ceil(max / step) * step;
    const numDivisoes = 4; // 4 faixas bem visíveis = 5 linhas (100%, 75%, 50%, 25%, 0%)
    const stepSize = teto / numDivisoes;

    const ticks = [];
    for (let i = numDivisoes; i >= 0; i--) {
      const val = Math.round(i * stepSize);
      let label = 'R$ 0';
      if (val > 0) {
        label = val.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0,
          maximumFractionDigits: val % 1 === 0 ? 0 : 2,
        });
      }
      ticks.push({
        val,
        label,
        pct: (i / numDivisoes) * 100,
      });
    }

    const faixas = Array.from({ length: numDivisoes }, (_, idx) => ({
      index: idx,
      isPar: idx % 2 === 0,
    }));

    return { ticksY: ticks, maxValorGrafico: teto, faixasDivisao: faixas };
  }, [dadosGrafico]);

  // Título exibido no navegador de período
  const tituloNavegador = useMemo(() => {
    if (tipoFiltro === 'ano') {
      return format(dataReferencia, 'yyyy');
    }
    if (tipoFiltro === 'mes') {
      const str = format(dataReferencia, "MMMM 'de' yyyy", { locale: ptBR });
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    const ini = startOfWeek(dataReferencia, { weekStartsOn: 1 });
    const fim = endOfWeek(dataReferencia, { weekStartsOn: 1 });
    return `${format(ini, 'dd/MM')} a ${format(fim, 'dd/MM/yyyy')}`;
  }, [tipoFiltro, dataReferencia]);

  const itemAtivo = itemSelecionado || dadosGrafico[dadosGrafico.length - 1];

  return (
    <Card padding="p-4.5" className="flex flex-col gap-3">
      {/* Topo: Título e Alternador de Filtro (Ano / Mês / Semana) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Faturamento vs Custos
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparativo de colunas: entradas e despesas
          </p>
        </div>

        {/* Botões de Filtro: Ano | Mês | Semana */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl self-start sm:self-auto">
          {[
            { id: 'ano', label: 'Ano' },
            { id: 'mes', label: 'Mês' },
            { id: 'semana', label: 'Semana' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setTipoFiltro(tab.id);
                setItemSelecionado(null);
              }}
              className={`
                text-xs font-bold px-3 py-1 rounded-lg transition-all
                ${tipoFiltro === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navegador de Período (Anterior / Próximo) */}
      <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100">
        <button
          onClick={handleAnterior}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
          title="Período anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-bold text-slate-800 tracking-tight">
          {tituloNavegador}
        </span>

        <button
          onClick={handleProximo}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
          title="Próximo período"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Resumo Rápido dos Totais do Período */}
      <div className="grid grid-cols-3 gap-2 text-center py-1 border-b border-slate-100 text-[11px]">
        <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-xl p-2">
          <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">
            Faturamento
          </span>
          <span className="text-xs font-black text-emerald-800">
            {formatMoeda(totalFaturamentoPeriodo)}
          </span>
        </div>

        <div className="bg-rose-50/70 border border-rose-100/80 rounded-xl p-2">
          <span className="text-[10px] text-rose-700 font-bold block uppercase tracking-wider">
            Custos
          </span>
          <span className="text-xs font-black text-rose-800">
            {formatMoeda(totalCustosPeriodo)}
          </span>
        </div>

        <div
          className={`rounded-xl p-2 border ${lucroLiquidoPeriodo >= 0
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-rose-100/60 border-rose-200 text-rose-800'
            }`}
        >
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
            Resultado
          </span>
          <span className="text-xs font-black">
            {formatMoeda(lucroLiquidoPeriodo)}
          </span>
        </div>
      </div>

      {/* GRÁFICO EM COLUNAS COM EIXO Y E DIVISÕES BEM VISÍVEIS */}
      <div className="pt-2">
        {/* Gráfico com Eixo Y à Esquerda e Linhas de Grade Horizontais */}
        <div className="flex">
          {/* Eixo Y à Esquerda com os valores adaptados em R$ e traços de divisão */}
          <div className="relative w-10 sm:w-24 shrink-0 h-52 select-none border-r-2 border-slate-300 pr-2">
            {ticksY.map((tick, i) => {
              const topPct = 100 - tick.pct;
              const transformClass =
                topPct === 0
                  ? 'translate-y-0'
                  : topPct === 100
                    ? '-translate-y-full'
                    : '-translate-y-1/2';

              return (
                <div
                  key={i}
                  className={`absolute right-0 flex items-center justify-end gap-1.5 w-full ${transformClass}`}
                  style={{ top: `${topPct}%` }}
                >
                  <span className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-tight whitespace-nowrap">
                    {tick.label}
                  </span>
                  <span className="w-2.5 h-[2px] bg-slate-400 rounded-full" />
                </div>
              );
            })}
          </div>

          {/* Gráfico de Colunas com Linhas de Grade e Faixas Alternadas Bem Visíveis */}
          <div className="relative flex-1 h-52 overflow-hidden bg-white border-t border-slate-300">
            {/* Linhas de Grade Horizontais com Divisões Bem Visíveis e Zebra Shading */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
              {faixasDivisao.map((faixa, idx) => (
                <div
                  key={faixa.index}
                  className={`flex-1 w-full border-b ${
                    idx === faixasDivisao.length - 1
                      ? 'border-b-2 border-slate-500'
                      : 'border-b border-slate-300'
                  } ${faixa.isPar ? 'bg-slate-50/80' : 'bg-white'}`}
                />
              ))}
            </div>

            {/* Colunas Verdes e Vermelhas */}
            <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-2 px-1">
              {dadosGrafico.map((item) => {
                const alturaFaturamento =
                  maxValorGrafico > 0
                    ? Math.max(
                      item.faturamento > 0 ? 5 : 0,
                      (item.faturamento / maxValorGrafico) * 208
                    )
                    : 0;

                const alturaCustos =
                  maxValorGrafico > 0
                    ? Math.max(
                      item.custos > 0 ? 5 : 0,
                      (item.custos / maxValorGrafico) * 208
                    )
                    : 0;

                const isSelected = itemAtivo?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setItemSelecionado(item)}
                    className={`
                      flex-1 flex items-end justify-center gap-0.5 sm:gap-1.5 h-full cursor-pointer group transition-all pb-[2px]
                      ${isSelected ? 'opacity-100 z-10' : 'opacity-85 hover:opacity-100'}
                    `}
                    title={`${item.tituloCompleto}\nFaturamento: ${formatMoeda(item.faturamento)}\nCustos: ${formatMoeda(item.custos)}`}
                  >
                    {/* Coluna Verde (Faturamento) */}
                    <div
                      style={{ height: `${alturaFaturamento}px` }}
                      className={`
                        w-1/2 max-w-[18px] rounded-t-sm transition-all duration-300
                        ${item.faturamento > 0
                          ? 'bg-emerald-500 group-hover:bg-emerald-600 shadow-xs'
                          : 'bg-emerald-100/40'
                        }
                        ${isSelected ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}
                      `}
                    />

                    {/* Coluna Vermelha (Custos / Despesas) */}
                    <div
                      style={{ height: `${alturaCustos}px` }}
                      className={`
                        w-1/2 max-w-[18px] rounded-t-sm transition-all duration-300
                        ${item.custos > 0
                          ? 'bg-rose-500 group-hover:bg-rose-600 shadow-xs'
                          : 'bg-rose-100/40'
                        }
                        ${isSelected ? 'ring-2 ring-rose-400 ring-offset-1' : ''}
                      `}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rótulos do Eixo X (alinhados com a largura do gráfico) */}
        <div className="flex pl-20 sm:pl-24 pt-2">
          <div className="w-full flex items-center justify-between px-1">
            {dadosGrafico.map((item) => {
              const isSelected = itemAtivo?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setItemSelecionado(item)}
                  className="flex-1 text-center cursor-pointer select-none py-0.5 hover:bg-slate-50 rounded"
                >
                  <span
                    className={`
                      text-[10px] sm:text-[11px] block leading-tight font-bold transition-colors
                      ${isSelected ? 'text-slate-900 font-black' : 'text-slate-600'}
                    `}
                  >
                    {item.label}
                  </span>
                  {item.sublabel && (
                    <span className="text-[9px] text-slate-400 block leading-none mt-0.5 font-medium">
                      {item.sublabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detalhes Interativos do Item Clicado / Selecionado */}
      {itemAtivo && (
        <div className="bg-slate-50/90 rounded-xl p-2.5 mt-3 border border-slate-100 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div>
            <span className="font-bold text-slate-800 block">
              {itemAtivo.tituloCompleto}
            </span>
            <span className="text-[11px] text-slate-500">
              {itemAtivo.qtdAtendimentos} atendimento(s) concluído(s)
            </span>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-[10px] text-emerald-700 font-bold block">
                Entrada
              </span>
              <span className="font-extrabold text-emerald-800">
                {formatMoeda(itemAtivo.faturamento)}
              </span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[10px] text-rose-700 font-bold block">
                Saída
              </span>
              <span className="font-extrabold text-rose-800">
                {formatMoeda(itemAtivo.custos)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legenda das Cores */}
      <div className="flex items-center justify-center gap-6 pt-3 text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500 shadow-xs" />
          <span>Faturamento (Entradas)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-500 shadow-xs" />
          <span>Custos (Despesas)</span>
        </div>
      </div>
    </Card>
  );
}

export default GraficoFaturamentoCustos;
