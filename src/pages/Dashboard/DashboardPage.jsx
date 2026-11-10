import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { agendamentosService } from '../../services/agendamentosService';
import { despesasService } from '../../services/despesasService';
import { servicosService } from '../../services/servicosService';
import KpiCard from '../../components/dashboard/KpiCard';
import MonthFilter from '../../components/dashboard/MonthFilter';
import GraficoFaturamentoCustos from '../../components/dashboard/GraficoFaturamentoCustos';
import GraficoServicosPizza from '../../components/dashboard/GraficoServicosPizza';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatMoeda } from '../../utils/formatters';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  CalendarCheck,
  Plus,
  MessageCircle
} from 'lucide-react';
import { parseISO, isSameMonth } from 'date-fns';

export function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Dados globais para os novos gráficos
  const [todosAgendamentos, setTodosAgendamentos] = useState([]);
  const [todasDespesas, setTodasDespesas] = useState([]);
  const [todosServicos, setTodosServicos] = useState([]);

  // Métricas calculadas do mês selecionado
  const [faturamentoBruto, setFaturamentoBruto] = useState(0);
  const [totalCustos, setTotalCustos] = useState(0);
  const [lucroLiquido, setLucroLiquido] = useState(0);
  const [qtdAtendimentos, setQtdAtendimentos] = useState(0);

  useEffect(() => {
    async function carregarDadosCompletos() {
      setLoading(true);
      try {
        // 1. Busca todos os agendamentos, despesas e serviços do catálogo
        const [resAgendamentos, resDespesas, resServicos] = await Promise.all([
          agendamentosService.listar(),
          despesasService.listar(),
          servicosService.listar(),
        ]);

        const agendamentosLista = resAgendamentos.data || [];
        const despesasLista = resDespesas.data || [];
        const servicosLista = resServicos.data || [];

        setTodosAgendamentos(agendamentosLista);
        setTodasDespesas(despesasLista);
        setTodosServicos(servicosLista);

        // 2. Calcula métricas específicas do mês selecionado no filtro
        const concluidosDoMes = agendamentosLista.filter((a) => {
          if (a.status !== 'concluido' || !a.data_hora) return false;
          try {
            return isSameMonth(parseISO(a.data_hora), currentDate);
          } catch {
            return false;
          }
        });

        const bruto = concluidosDoMes.reduce(
          (acc, cur) => acc + Number(cur.valor || cur.servicos_base?.valor_padrao || 0),
          0
        );

        const despesasDoMes = despesasLista.filter((d) => {
          const dataStr = d.data_vencimento || d.created_at;
          if (!dataStr) return false;
          try {
            return isSameMonth(parseISO(dataStr), currentDate);
          } catch {
            return false;
          }
        });

        const custos = despesasDoMes.reduce(
          (acc, cur) => acc + Number(cur.valor || 0),
          0
        );

        setFaturamentoBruto(bruto);
        setTotalCustos(custos);
        setLucroLiquido(bruto - custos);
        setQtdAtendimentos(concluidosDoMes.length);
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosCompletos();
  }, [currentDate]);

  return (
    <div className="flex flex-col gap-5">
      {/* Saudação Superior */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Olá, {profile?.nome ? profile.nome.split(' ')[0] : 'Nail Designer'}! ✨
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe o balanço financeiro do seu estúdio
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate('/agenda')}
          icon={Plus}
        >
          Novo
        </Button>
      </div>

      {/* Filtro Dinâmico de Mês/Ano */}
      <MonthFilter currentDate={currentDate} onChange={setCurrentDate} />

      {loading ? (
        <LoadingSpinner text="Calculando balanço financeiro e gráficos..." />
      ) : (
        <>
          {/* Grid de Cards KPI */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard
              title="Faturamento"
              value={formatMoeda(faturamentoBruto)}
              subtitle="Atendimentos concluídos"
              icon={DollarSign}
              variant="brand"
            />

            <KpiCard
              title="Custos Totais"
              value={formatMoeda(totalCustos)}
              subtitle="Fixas e Insumos"
              icon={TrendingDown}
              variant="danger"
            />

            <KpiCard
              title="Lucro Líquido"
              value={formatMoeda(lucroLiquido)}
              subtitle={lucroLiquido >= 0 ? 'Margem positiva' : 'Atenção aos custos'}
              icon={TrendingUp}
              variant={lucroLiquido >= 0 ? 'success' : 'danger'}
            />

            <KpiCard
              title="Atendimentos"
              value={qtdAtendimentos}
              subtitle="Ciclos finalizados"
              icon={CalendarCheck}
              variant="default"
            />
          </div>

          {/* GRÁFICO 1 SOLICITADO: Faturamento vs Custos em Colunas (Filtros: Ano, Mês, Semana) */}
          <GraficoFaturamentoCustos
            agendamentos={todosAgendamentos}
            despesas={todasDespesas}
            dataInicial={currentDate}
          />

          {/* GRÁFICO 2 SOLICITADO: Serviços Mais Realizados em Gráfico de Pizza (Últimos 6 Meses) */}
          <GraficoServicosPizza
            agendamentos={todosAgendamentos}
            servicos={todosServicos}
          />

          {/* Card de Atalho para Régua D-1 */}
          <div
            onClick={() => navigate('/confirmacoes')}
            className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl p-4 text-white shadow-soft cursor-pointer active:scale-[0.99] transition-transform flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Central de Confirmações</h4>
                <p className="text-xs text-brand-100 mt-0.5">
                  Dispare lembretes de amanhã pelo WhatsApp
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
