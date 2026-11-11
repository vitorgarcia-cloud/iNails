import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientesService } from '../../services/clientesService';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDataBR, formatHoraBR, formatMoeda, formatTelefone } from '../../utils/formatters';
import { normalizarTelefoneWhatsApp } from '../../utils/whatsapp';
import {
  ArrowLeft,
  Phone,
  Calendar,
  MessageCircle,
  FileText
} from 'lucide-react';

export function ClienteDetalhesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDetalhes() {
      setLoading(true);
      try {
        const { data: dadosCliente } = await clientesService.obterPorId(id);
        const dadosMetricas = await clientesService.obterMetricasCliente(id);
        setCliente(dadosCliente);
        setMetricas(dadosMetricas);
      } catch (err) {
        console.error('Erro ao carregar cliente:', err);
      } finally {
        setLoading(false);
      }
    }
    carregarDetalhes();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Carregando dados da cliente..." />;
  }

  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
        <p className="text-sm text-slate-500">Cliente não encontrada.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/clientes')}>
          Voltar para Clientes
        </Button>
      </div>
    );
  }

  const handleWhatsApp = () => {
    if (!cliente.telefone) return;
    const phone = normalizarTelefoneWhatsApp(cliente.telefone);
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const statusVariant = metricas?.status === 'Ativa' ? 'ativa' : metricas?.status === 'Em risco' ? 'em_risco' : 'default';

  return (
    <div className="flex flex-col gap-4">
      {/* Botão Voltar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/clientes')}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-slate-400">Voltar para Clientes</span>
      </div>

      {/* Cartão de Perfil Principal */}
      <Card padding="p-4" className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg">
              {cliente.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{cliente.nome}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{formatTelefone(cliente.telefone)}</span>
              </p>
            </div>
          </div>

          <Badge variant={statusVariant} size="sm" dot>
            {metricas?.status || 'Cliente'}
          </Badge>
        </div>

        {cliente.observacoes && (
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>{cliente.observacoes}</p>
          </div>
        )}

        <Button
          variant="success"
          size="sm"
          fullWidth
          icon={MessageCircle}
          onClick={handleWhatsApp}
        >
          Conversar no WhatsApp
        </Button>
      </Card>

      {/* Métricas da Cliente: LTV & Ciclo de Visita */}
      <div className="grid grid-cols-2 gap-3">
        <Card padding="p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            LTV (Gasto Total)
          </span>
          <h3 className="text-lg font-extrabold text-brand-600 mt-1">
            {formatMoeda(metricas?.ltv || 0)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {metricas?.totalVisitas || 0} visitas concluídas
          </p>
        </Card>

        <Card padding="p-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Último Atendimento
          </span>
          <h3 className="text-sm font-bold text-slate-800 mt-1">
            {metricas?.ultimaVisita ? formatDataBR(metricas.ultimaVisita) : 'Nenhum'}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {metricas?.diasSemVisita !== null
              ? `Há ${metricas.diasSemVisita} dias atrás`
              : 'Sem visitas ainda'}
          </p>
        </Card>
      </div>

      {/* Histórico de Visitas */}
      <div className="flex flex-col gap-2.5 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 px-1">
          Histórico de Atendimentos
        </h3>

        {!metricas?.historico || metricas.historico.length === 0 ? (
          <Card padding="p-6" className="text-center text-xs text-slate-400">
            Nenhuma visita concluída registrada ainda.
          </Card>
        ) : (
          metricas.historico.map((item) => (
            <Card key={item.id} padding="p-3.5" className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {item.servicos_base?.nome || 'Atendimento'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {formatDataBR(item.data_hora, true)}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-slate-800">
                  {formatMoeda(item.valor)}
                </span>
                <div>
                  <Badge variant="concluido" size="sm">
                    Concluído
                  </Badge>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default ClienteDetalhesPage;
