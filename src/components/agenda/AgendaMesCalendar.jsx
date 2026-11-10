import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Coffee,
  Sparkles,
  PartyPopper,
  Clock,
  CheckCircle2,
  CalendarCheck2,
  MousePointerClick
} from 'lucide-react';
import { getFeriado, isDiaTrabalho } from '../../utils/holidays';
import AgendamentoCard from './AgendamentoCard';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatMoeda } from '../../utils/formatters';

export function AgendaMesCalendar({
  mesAtual,
  onMesChange,
  dataSelecionada,
  onSelectData,
  agendamentos = [],
  diasTrabalho = [1, 2, 3, 4, 5, 6],
  onNovoAgendamento,
  onStatusChange,
  onDelete,
  onEdit,
  onVerDiaDetalhado,
}) {
  const inicioMes = startOfMonth(mesAtual);
  const fimMes = endOfMonth(mesAtual);
  const inicioCalendario = startOfWeek(inicioMes, { weekStartsOn: 1 }); // Começa na Segunda-feira
  const fimCalendario = endOfWeek(fimMes, { weekStartsOn: 1 }); // Termina no Domingo
  const diasGrid = eachDayOfInterval({ start: inicioCalendario, end: fimCalendario });

  const diasSemanaNomes = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  // Controle de Long-Press (segurar apertado para agendar)
  const longPressTimerRef = React.useRef(null);
  const isLongPressTriggeredRef = React.useRef(false);
  const touchStartPosRef = React.useRef({ x: 0, y: 0 });
  const [pressingDiaKey, setPressingDiaKey] = React.useState(null);

  React.useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const startPress = (e, dia, ehMesmoMes) => {
    isLongPressTriggeredRef.current = false;
    const chave = format(dia, 'yyyy-MM-dd');
    setPressingDiaKey(chave);

    if (e.touches && e.touches[0]) {
      touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // Segurar por 420ms ativa o agendamento rápido
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setPressingDiaKey(null);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch (_) {}
      }
      onSelectData(dia);
      if (!ehMesmoMes) {
        onMesChange(dia);
      }
      // Abre o modal de agendamento com a data clicada pré-setada
      onNovoAgendamento(dia);
    }, 420);
  };

  const cancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setPressingDiaKey(null);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      const dx = Math.abs(e.touches[0].clientX - touchStartPosRef.current.x);
      const dy = Math.abs(e.touches[0].clientY - touchStartPosRef.current.y);
      if (dx > 8 || dy > 8) {
        cancelPress();
      }
    }
  };

  const handleDayClick = (e, dia, ehMesmoMes) => {
    if (isLongPressTriggeredRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPressTriggeredRef.current = false;
      return;
    }
    onSelectData(dia);
    if (!ehMesmoMes) {
      onMesChange(dia);
    }
  };

  // Agrupa agendamentos por dia (chave yyyy-MM-dd)
  const agendamentosPorDia = React.useMemo(() => {
    const mapa = new Map();
    agendamentos.forEach((a) => {
      try {
        const d = parseISO(a.data_hora);
        const chave = format(d, 'yyyy-MM-dd');
        if (!mapa.has(chave)) {
          mapa.set(chave, []);
        }
        mapa.get(chave).push(a);
      } catch {
        // Ignora datas inválidas
      }
    });
    return mapa;
  }, [agendamentos]);

  // Estatísticas rápidas do mês atual
  const estatisticasMes = React.useMemo(() => {
    let totalClientes = 0;
    let diasComAtendimento = 0;
    let totalFaturamentoEstimado = 0;

    const diasDoMes = eachDayOfInterval({ start: inicioMes, end: fimMes });
    let diasFolgaCount = 0;
    let feriadosCount = 0;

    diasDoMes.forEach((dia) => {
      const chave = format(dia, 'yyyy-MM-dd');
      const ags = agendamentosPorDia.get(chave) || [];
      if (ags.length > 0) {
        diasComAtendimento += 1;
        totalClientes += ags.length;
        ags.forEach((a) => {
          totalFaturamentoEstimado += Number(a.valor || a.servicos_base?.valor_padrao || 0);
        });
      }

      if (!isDiaTrabalho(dia, diasTrabalho)) {
        diasFolgaCount += 1;
      }
      if (getFeriado(dia)) {
        feriadosCount += 1;
      }
    });

    return {
      totalClientes,
      diasComAtendimento,
      totalFaturamentoEstimado,
      diasFolgaCount,
      feriadosCount,
    };
  }, [mesAtual, agendamentosPorDia, diasTrabalho]);

  // Agendamentos do dia atualmente selecionado
  const chaveSelecionada = format(dataSelecionada, 'yyyy-MM-dd');
  const agendamentosDoDiaSelecionado = agendamentosPorDia.get(chaveSelecionada) || [];
  const feriadoDiaSelecionado = getFeriado(dataSelecionada);
  const trabalhaDiaSelecionado = isDiaTrabalho(dataSelecionada, diasTrabalho);

  const tituloMesAno = format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR });
  const tituloMesDisplay = tituloMesAno.charAt(0).toUpperCase() + tituloMesAno.slice(1);

  const textoDataSelecionada = format(dataSelecionada, "EEEE, dd 'de' MMMM", { locale: ptBR });
  const textoDataDisplay = textoDataSelecionada.charAt(0).toUpperCase() + textoDataSelecionada.slice(1);

  return (
    <div className="flex flex-col gap-4">
      {/* Navegador do Mês */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onMesChange(subMonths(mesAtual, 1))}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Mês anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-brand-500" />
              {tituloMesDisplay}
            </h2>
            <button
              onClick={() => {
                const hoje = new Date();
                onMesChange(hoje);
                onSelectData(hoje);
              }}
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline mt-0.5"
            >
              Ir para hoje
            </button>
          </div>

          <button
            onClick={() => onMesChange(addMonths(mesAtual, 1))}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Próximo mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo Rápido do Mês */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
          <div className="bg-brand-50/60 rounded-xl p-2 border border-brand-100/60">
            <span className="text-[10px] text-brand-700 font-bold block uppercase tracking-wider">
              Clientes
            </span>
            <span className="text-base font-black text-brand-900">
              {estatisticasMes.totalClientes}
            </span>
          </div>

          <div className="bg-emerald-50/60 rounded-xl p-2 border border-emerald-100/60">
            <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">
              Previsto
            </span>
            <span className="text-xs font-black text-emerald-800">
              {formatMoeda(estatisticasMes.totalFaturamentoEstimado)}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
              Folgas
            </span>
            <span className="text-base font-black text-slate-700">
              {estatisticasMes.diasFolgaCount}d
            </span>
          </div>
        </div>
      </div>

      {/* Dica de Toque Longo / Segurar Apertado */}
      <div className="bg-brand-50/80 border border-brand-100/80 rounded-xl py-1.5 px-3 flex items-center justify-center gap-1.5 text-[11px] text-brand-800">
        <MousePointerClick className="w-3.5 h-3.5 text-brand-600 shrink-0" />
        <span>
          <strong>Dica:</strong> Segure apertado qualquer dia para agendar com a data pré-setada!
        </span>
      </div>

      {/* Grade do Calendário Mensal */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-3">
        {/* Cabeçalho dos Dias da Semana (Seg a Dom) */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {diasSemanaNomes.map((d, index) => (
            <div
              key={d}
              className={`text-[11px] font-bold py-1 ${
                index >= 5 ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Células dos Dias */}
        <div className="grid grid-cols-7 gap-1.5">
          {diasGrid.map((dia) => {
            const ehMesmoMes = isSameMonth(dia, mesAtual);
            const ehHoje = isToday(dia);
            const ehSelecionado = isSameDay(dia, dataSelecionada);
            const chaveDia = format(dia, 'yyyy-MM-dd');
            const agendamentosDia = agendamentosPorDia.get(chaveDia) || [];
            const temClientes = agendamentosDia.length > 0;
            const feriado = getFeriado(dia);
            const manicureTrabalha = isDiaTrabalho(dia, diasTrabalho);
            const isPressingThisDay = pressingDiaKey === chaveDia;

            // Determina as cores e estilos do quadradinho conforme os requisitos do usuário:
            // 1. Dias com cliente: cor de destaque roxa/rosa (brand)
            // 2. Feriado: cor amarelada/dourada (amber)
            // 3. Dia que a manicure não trabalha: tom cinza (slate) com indicação de folga
            let estiloFundo = 'bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-100/60';

            if (temClientes) {
              // Quadradinho com Clientes
              estiloFundo = 'bg-brand-50 border-brand-300 text-brand-950 hover:bg-brand-100/80 font-bold shadow-xs';
            } else if (feriado) {
              // Quadradinho Feriado
              estiloFundo = 'bg-amber-50/90 border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold';
            } else if (!manicureTrabalha) {
              // Quadradinho Dia de Folga
              estiloFundo = 'bg-slate-100 border-dashed border-slate-200/90 text-slate-400 hover:bg-slate-150';
            }

            if (!ehMesmoMes) {
              estiloFundo += ' opacity-35';
            }

            return (
              <button
                key={chaveDia}
                onMouseDown={(e) => startPress(e, dia, ehMesmoMes)}
                onMouseUp={cancelPress}
                onMouseLeave={cancelPress}
                onTouchStart={(e) => startPress(e, dia, ehMesmoMes)}
                onTouchEnd={cancelPress}
                onTouchMove={handleTouchMove}
                onTouchCancel={cancelPress}
                onContextMenu={(e) => {
                  if (isLongPressTriggeredRef.current) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                onClick={(e) => handleDayClick(e, dia, ehMesmoMes)}
                className={`
                  relative min-h-[58px] p-1 rounded-xl border flex flex-col justify-between items-center text-left select-none
                  transition-all duration-150 active:scale-95
                  ${estiloFundo}
                  ${ehSelecionado ? 'ring-2 ring-brand-500 ring-offset-1 z-10 shadow-sm' : ''}
                  ${isPressingThisDay ? 'scale-90 ring-4 ring-brand-400 bg-brand-100 z-20' : ''}
                `}
                title={`${format(dia, 'dd/MM/yyyy')} ${feriado ? `(${feriado.nome})` : ''} - Segure para agendar`}
              >
                {/* Linha Superior: Número do Dia + Indicador Hoje */}
                <div className="w-full flex items-center justify-between pointer-events-none">
                  <span
                    className={`
                      text-xs leading-none font-bold rounded-md px-1 py-0.5
                      ${ehHoje ? 'bg-brand-500 text-white' : ''}
                    `}
                  >
                    {format(dia, 'd')}
                  </span>

                  {/* Indicador de Feriado */}
                  {feriado && (
                    <span
                      className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                      title={feriado.nome}
                    />
                  )}
                </div>

                {/* Conteúdo Central/Inferior do Quadradinho */}
                <div className="w-full flex flex-col items-center justify-center my-auto pointer-events-none">
                  {temClientes ? (
                    <div className="flex items-center gap-0.5 bg-brand-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                      <span>{agendamentosDia.length}</span>
                      <span className="hidden sm:inline">cli</span>
                    </div>
                  ) : feriado ? (
                    <span className="text-[8px] font-bold text-amber-800 bg-amber-100 px-1 rounded truncate max-w-full leading-tight">
                      Feriado
                    </span>
                  ) : !manicureTrabalha ? (
                    <span className="text-[8px] font-medium text-slate-400 bg-slate-200/70 px-1 rounded leading-tight flex items-center gap-0.5">
                      <Coffee className="w-2 h-2" />
                      Folga
                    </span>
                  ) : null}
                </div>

                {/* Marcador de Concluído/Confirmado (quando houver agendamentos) */}
                {temClientes && (
                  <div className="w-full flex justify-center gap-0.5 mt-0.5 pointer-events-none">
                    {agendamentosDia.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className={`w-1 h-1 rounded-full ${
                          item.status === 'concluido'
                            ? 'bg-emerald-500'
                            : item.status === 'confirmado'
                            ? 'bg-sky-500'
                            : 'bg-amber-400'
                        }`}
                      />
                    ))}
                    {agendamentosDia.length > 3 && (
                      <span className="text-[7px] text-brand-700 leading-none font-bold">+</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legenda Visual das Cores */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-brand-50 border border-brand-300 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
            </span>
            <span className="font-medium text-slate-700">Com clientes</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-50 border border-amber-300 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            </span>
            <span className="font-medium text-slate-700">Feriado nacional</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-dashed border-slate-300"></span>
            <span className="font-medium text-slate-700">Dia de folga</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-brand-500 text-white font-bold text-[8px] flex items-center justify-center">
              H
            </span>
            <span className="font-medium text-slate-700">Hoje</span>
          </div>
        </div>
      </div>

      {/* Detalhes do Dia Selecionado */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-4 flex flex-col gap-3">
        {/* Topo do Dia */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                {textoDataDisplay}
              </h3>
              {isToday(dataSelecionada) && (
                <Badge variant="confirmado" size="sm">
                  Hoje
                </Badge>
              )}
            </div>

            {/* Tags de Feriado / Folga / Trabalho */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              {feriadoDiaSelecionado && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <PartyPopper className="w-3 h-3 text-amber-600" />
                  {feriadoDiaSelecionado.nome}
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-medium">
                • {agendamentosDoDiaSelecionado.length} agendamento(s)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNovoAgendamento(dataSelecionada)}
              icon={Plus}
            >
              Agendar
            </Button>
          </div>
        </div>

        {/* Lista de Atendimentos deste Dia */}
        {agendamentosDoDiaSelecionado.length === 0 ? (
          <div className="bg-slate-50/70 rounded-xl p-4 text-center border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-slate-500 font-medium">
              Nenhum cliente agendado para este dia.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNovoAgendamento(dataSelecionada)}
              className="text-brand-600 hover:text-brand-700 font-bold"
            >
              + Marcar horário neste dia
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {agendamentosDoDiaSelecionado.map((item) => (
              <AgendamentoCard
                key={item.id}
                agendamento={item}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AgendaMesCalendar;
