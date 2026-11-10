import React, { useState, useEffect, useCallback } from 'react';
import { agendamentosService } from '../../services/agendamentosService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDataBR, formatHoraBR, formatMoeda, formatTelefone } from '../../utils/formatters';
import { criarMensagemConfirmacao, gerarLinkWhatsApp } from '../../utils/whatsapp';
import {
  MessageCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Send,
  Play,
  RotateCcw,
  Check,
  CalendarCheck
} from 'lucide-react';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ConfirmacoesPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [agendamentosAmanha, setAgendamentosAmanha] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rodada de confirmações guiada
  const [rodadaAtiva, setRodadaAtiva] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState(0);

  const carregarConfirmacoes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await agendamentosService.listarDeAmanhaNaoConfirmados();
      if (error) throw error;
      setAgendamentosAmanha(data || []);
    } catch (err) {
      console.error('Erro ao carregar confirmações:', err);
      toast.error('Erro ao carregar agendamentos de amanhã.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    carregarConfirmacoes();
  }, [carregarConfirmacoes]);

  const amanha = addDays(new Date(), 1);
  const textoAmanha = format(amanha, "EEEE, dd 'de' MMMM", { locale: ptBR });

  // Disparar WhatsApp para um agendamento individual
  const enviarWhatsApp = (agendamento) => {
    const nomeCliente = agendamento.clientes?.nome || 'Cliente';
    const telefone = agendamento.clientes?.telefone || '';
    const nomeServico = agendamento.servicos_base?.nome || 'atendimento';
    const nomeEstudio = profile?.nome_estudio || 'Studio NailFlow';

    if (!telefone) {
      toast.warning('Esta cliente não possui número de telefone cadastrado.');
      return;
    }

    const mensagem = criarMensagemConfirmacao({
      nomeCliente,
      nomeEstudio,
      dataHora: agendamento.data_hora,
      nomeServico,
    });

    const link = gerarLinkWhatsApp(telefone, mensagem);
    window.open(link, '_blank');
  };

  // Marcar como confirmado
  const handleConfirmar = async (agendamentoId) => {
    try {
      await agendamentosService.atualizarStatus(agendamentoId, 'confirmado');
      setAgendamentosAmanha((prev) => prev.filter((a) => a.id !== agendamentoId));
      toast.success('Horário confirmado com sucesso!');
    } catch {
      toast.error('Erro ao confirmar.');
    }
  };

  // Iniciar rodada passo-a-passo
  const iniciarRodada = () => {
    if (agendamentosAmanha.length === 0) return;
    setRodadaAtiva(true);
    setIndiceAtual(0);
    // Abre direto o primeiro WhatsApp
    enviarWhatsApp(agendamentosAmanha[0]);
  };

  const proximoDaRodada = () => {
    if (indiceAtual + 1 < agendamentosAmanha.length) {
      const proximo = agendamentosAmanha[indiceAtual + 1];
      setIndiceAtual((prev) => prev + 1);
      enviarWhatsApp(proximo);
    } else {
      setRodadaAtiva(false);
      toast.success('🎉 Parabéns! Todos os lembretes de amanhã foram enviados!');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Topo com Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Central de Confirmações
          </h1>
          <p className="text-xs text-brand-600 font-semibold mt-0.5 capitalize">
            {textoAmanha}
          </p>
        </div>

        {agendamentosAmanha.length > 0 && !rodadaAtiva && (
          <Button
            variant="primary"
            size="sm"
            onClick={iniciarRodada}
            icon={Play}
          >
            Iniciar Rodada
          </Button>
        )}
      </div>

      {/* Banner Informativo */}
      <Card padding="p-3.5" className="bg-gradient-to-r from-brand-50 to-pink-50 border-brand-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm text-brand-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-800">Régua Automática</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Mensagens personalizadas com horário, serviço e opções rápidas de resposta para evitar faltas e furos na sua grade.
            </p>
          </div>
        </div>
      </Card>

      {/* Assistente da Rodada Ativa */}
      {rodadaAtiva && agendamentosAmanha[indiceAtual] && (
        <Card padding="p-4" className="border-2 border-brand-500 bg-brand-50/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wide">
              Rodada em Andamento: {indiceAtual + 1} de {agendamentosAmanha.length}
            </span>
            <button
              onClick={() => setRodadaAtiva(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Finalizar
            </button>
          </div>

          <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-brand-200">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {agendamentosAmanha[indiceAtual].clientes?.nome}
              </h3>
              <p className="text-xs text-brand-600 font-medium">
                {agendamentosAmanha[indiceAtual].servicos_base?.nome} • {formatHoraBR(agendamentosAmanha[indiceAtual].data_hora)}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => enviarWhatsApp(agendamentosAmanha[indiceAtual])}
              icon={RotateCcw}
            >
              Reabrir Chat
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="success"
              fullWidth
              size="md"
              icon={Check}
              onClick={() => {
                handleConfirmar(agendamentosAmanha[indiceAtual].id);
                proximoDaRodada();
              }}
            >
              Confirmado! Próxima
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={proximoDaRodada}
            >
              Pular
            </Button>
          </div>
        </Card>
      )}

      {/* Lista de Atendimentos Pendentes para Amanhã */}
      {loading ? (
        <LoadingSpinner text="Buscando agendamentos de amanhã..." />
      ) : agendamentosAmanha.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="Tudo pronto para amanhã!"
          description="Nenhum atendimento pendente de confirmação para o dia de amanhã. Todos já foram confirmados ou não há horários agendados."
          actionLabel="Atualizar Lista"
          onAction={carregarConfirmacoes}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            {agendamentosAmanha.length} {agendamentosAmanha.length === 1 ? 'cliente aguardando confirmação' : 'clientes aguardando confirmação'}
          </span>

          {agendamentosAmanha.map((agendamento) => {
            const cliente = agendamento.clientes;
            const servico = agendamento.servicos_base;

            return (
              <Card key={agendamento.id} padding="p-3.5" className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {cliente?.nome || 'Cliente'}
                      </h4>
                      <Badge variant="pendente" size="sm" dot>
                        Aguardando
                      </Badge>
                    </div>
                    <p className="text-xs text-brand-600 font-semibold mt-0.5">
                      {servico?.nome || 'Procedimento'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {cliente?.telefone ? formatTelefone(cliente.telefone) : 'Sem telefone'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-brand-500" />
                      {formatHoraBR(agendamento.data_hora)}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block">
                      {formatMoeda(agendamento.valor || servico?.valor_padrao || 0)}
                    </span>
                  </div>
                </div>

                {/* Ações Rápidas: Enviar WhatsApp & Confirmar */}
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5">
                  <Button
                    variant="success"
                    size="sm"
                    icon={MessageCircle}
                    onClick={() => enviarWhatsApp(agendamento)}
                  >
                    Enviar WhatsApp
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => handleConfirmar(agendamento.id)}
                  >
                    Marcar Confirmado
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ConfirmacoesPage;
