import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAgendamentos } from '../../hooks/useAgendamentos';
import { useClientes } from '../../hooks/useClientes';
import { useServicos } from '../../hooks/useServicos';
import AgendamentoCard from '../../components/agenda/AgendamentoCard';
import NovoAgendamentoModal from '../../components/agenda/NovoAgendamentoModal';
import EditarAgendamentoModal from '../../components/agenda/EditarAgendamentoModal';
import AgendaMesCalendar from '../../components/agenda/AgendaMesCalendar';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Coffee,
  PartyPopper
} from 'lucide-react';
import {
  format,
  addDays,
  subDays,
  isSameDay,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getFeriado, isDiaTrabalho } from '../../utils/holidays';

export function AgendaPage() {
  const { profile } = useAuth();
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [mesAtual, setMesAtual] = useState(new Date());
  const [visualizacao, setVisualizacao] = useState('mes'); // Padrão 'mes' | 'dia' | 'semana'
  const [modalAberto, setModalAberto] = useState(false);
  const [dataModal, setDataModal] = useState(new Date());
  const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState(null);

  const { agendamentos, carregando, criarAgendamento, atualizarAgendamento, atualizarStatus, removerAgendamento } = useAgendamentos();
  const { clientes } = useClientes();
  const { servicos } = useServicos();

  const diasTrabalhoManicure = profile?.dias_trabalho || [1, 2, 3, 4, 5, 6];

  // Filtragem pela visualização selecionada
  const agendamentosFiltrados = agendamentos.filter((a) => {
    try {
      const dataItem = parseISO(a.data_hora);
      if (visualizacao === 'dia') {
        return isSameDay(dataItem, dataSelecionada);
      }
      if (visualizacao === 'semana') {
        const inicioSemana = startOfWeek(dataSelecionada, { weekStartsOn: 1 });
        const fimSemana = endOfWeek(dataSelecionada, { weekStartsOn: 1 });
        return isWithinInterval(dataItem, { start: inicioSemana, end: fimSemana });
      }
      return true;
    } catch {
      return false;
    }
  });

  const textoDataFormatada = format(dataSelecionada, "EEEE, dd 'de' MMMM", { locale: ptBR });
  const dataFormatadaDisplay = textoDataFormatada.charAt(0).toUpperCase() + textoDataFormatada.slice(1);

  const feriadoAtual = getFeriado(dataSelecionada);
  const trabalhaNoDia = isDiaTrabalho(dataSelecionada, diasTrabalhoManicure);

  const abrirModalComData = (data = dataSelecionada) => {
    setDataModal(data);
    setModalAberto(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Topo com Título e Botão de Agendar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Agenda
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calendário completo, ciclos e recorrência inteligente
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => abrirModalComData(dataSelecionada)}
          icon={Plus}
        >
          Agendar
        </Button>
      </div>

      {/* Seletor de Visualização: Mês / Semana / Dia */}
      <Tabs
        tabs={[
          { id: 'mes', label: 'Mês' },
          { id: 'semana', label: 'Semana' },
          { id: 'dia', label: 'Hoje / Dia' },
        ]}
        activeTab={visualizacao}
        onChange={setVisualizacao}
      />

      {/* VISUALIZAÇÃO 1: MÊS (Calendário Completo com Cores Inteligentes) */}
      {visualizacao === 'mes' && (
        <AgendaMesCalendar
          mesAtual={mesAtual}
          onMesChange={setMesAtual}
          dataSelecionada={dataSelecionada}
          onSelectData={setDataSelecionada}
          agendamentos={agendamentos}
          diasTrabalho={diasTrabalhoManicure}
          onNovoAgendamento={abrirModalComData}
          onStatusChange={atualizarStatus}
          onDelete={removerAgendamento}
          onEdit={(item) => setAgendamentoEmEdicao(item)}
        />
      )}

      {/* VISUALIZAÇÃO 2 & 3: DIA OU SEMANA */}
      {visualizacao !== 'mes' && (
        <>
          {/* Navegador de Data (Dia / Semana) */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-soft p-2 px-3">
            <button
              onClick={() => setDataSelecionada(subDays(dataSelecionada, visualizacao === 'semana' ? 7 : 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-center">
              <CalendarIcon className="w-4 h-4 text-brand-500" />
              <span className="text-xs font-bold text-slate-800">
                {visualizacao === 'semana'
                  ? `Semana de ${format(startOfWeek(dataSelecionada, { weekStartsOn: 1 }), 'dd/MM')} a ${format(endOfWeek(dataSelecionada, { weekStartsOn: 1 }), 'dd/MM')}`
                  : dataFormatadaDisplay}
              </span>
            </div>

            <button
              onClick={() => setDataSelecionada(addDays(dataSelecionada, visualizacao === 'semana' ? 7 : 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Avisos de Feriado ou Folga na visualização de Dia */}
          {visualizacao === 'dia' && (
            <div className="flex flex-col gap-1.5">
              {feriadoAtual && (
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 px-3 flex items-center gap-2 text-xs font-semibold text-amber-900">
                  <PartyPopper className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Feriado Nacional: <strong>{feriadoAtual.nome}</strong>
                  </span>
                </div>
              )}
              {!trabalhaNoDia && (
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-2.5 px-3 flex items-center gap-2 text-xs font-medium text-slate-700">
                  <Coffee className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    Dia de folga configurado pela manicure.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Lista de Agendamentos */}
          {carregando ? (
            <LoadingSpinner text="Carregando horários da agenda..." />
          ) : agendamentosFiltrados.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Nenhum horário marcado"
              description="Nenhum agendamento encontrado para o período selecionado."
              actionLabel="Agendar Horário"
              onAction={() => abrirModalComData(dataSelecionada)}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>
                  <strong>{agendamentosFiltrados.length}</strong> atendimento(s) encontrado(s)
                </span>
              </div>
              {agendamentosFiltrados.map((item) => (
                <AgendamentoCard
                  key={item.id}
                  agendamento={item}
                  onStatusChange={atualizarStatus}
                  onDelete={removerAgendamento}
                  onEdit={(ag) => setAgendamentoEmEdicao(ag)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de Novo Agendamento com Projeção de Recorrência */}
      <NovoAgendamentoModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        clientes={clientes}
        servicos={servicos}
        dataInicial={dataModal}
        onSalvar={criarAgendamento}
      />

      {/* Modal de Edição de Agendamento */}
      <EditarAgendamentoModal
        isOpen={Boolean(agendamentoEmEdicao)}
        onClose={() => setAgendamentoEmEdicao(null)}
        agendamento={agendamentoEmEdicao}
        clientes={clientes}
        servicos={servicos}
        onSalvar={atualizarAgendamento}
      />
    </div>
  );
}

export default AgendaPage;
