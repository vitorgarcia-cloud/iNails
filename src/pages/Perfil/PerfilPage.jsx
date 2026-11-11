import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useServicos } from '../../hooks/useServicos';
import { useToast } from '../../hooks/useToast';
import { usePWAInstall } from '../../contexts/PWAInstallContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import { formatMoeda } from '../../utils/formatters';
import {
  User,
  Sparkles,
  Store,
  Clock,
  Calendar,
  DollarSign,
  Phone,
  MapPin,
  AtSign,
  QrCode,
  Plus,
  Edit2,
  Trash2,
  Check,
  Coffee,
  MessageCircle,
  Save,
  Upload,
  Smartphone,
  Download,
  CheckCircle2
} from 'lucide-react';

const DIAS_SEMANA = [
  { id: 1, nome: 'Segunda-feira', abrev: 'Seg' },
  { id: 2, nome: 'Terça-feira', abrev: 'Ter' },
  { id: 3, nome: 'Quarta-feira', abrev: 'Qua' },
  { id: 4, nome: 'Quinta-feira', abrev: 'Qui' },
  { id: 5, nome: 'Sexta-feira', abrev: 'Sex' },
  { id: 6, nome: 'Sábado', abrev: 'Sáb' },
  { id: 0, nome: 'Domingo', abrev: 'Dom' },
];

export function PerfilPage() {
  const { profile, updateProfile } = useAuth();
  const { servicos, adicionarServico, atualizarServico, excluirServico } = useServicos();
  const { isInstalled, installApp, openInstrucoes } = usePWAInstall();
  const toast = useToast();

  const [abaAtiva, setAbaAtiva] = useState('geral');
  const [salvando, setSalvando] = useState(false);

  // Estados do formulário de Perfil
  const [nome, setNome] = useState('');
  const [nomeEstudio, setNomeEstudio] = useState('');
  const [telefone, setTelefone] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [endereco, setEndereco] = useState('');
  const [instagram, setInstagram] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [tipoChavePix, setTipoChavePix] = useState('celular');
  const [diasTrabalho, setDiasTrabalho] = useState([1, 2, 3, 4, 5, 6]);
  const [horarioInicio, setHorarioInicio] = useState('08:00');
  const [horarioFim, setHorarioFim] = useState('19:00');
  const [intervaloPadraoDias, setIntervaloPadraoDias] = useState(21);
  const [mensagemWhatsapp, setMensagemWhatsapp] = useState('');

  // Modais de Serviços
  const [modalServicoAberto, setModalServicoAberto] = useState(false);
  const [servicoEmEdicao, setServicoEmEdicao] = useState(null);
  const [servicoForm, setServicoForm] = useState({
    nome: '',
    valor_padrao: '',
    intervalo_dias_manutencao: 21,
  });

  // Inicializa com dados do profile
  useEffect(() => {
    if (profile) {
      setNome(profile.nome || '');
      setNomeEstudio(profile.nome_estudio || '');
      setTelefone(profile.telefone || '');
      setFotoUrl(profile.foto_url || '/logo.png');
      setEndereco(profile.endereco || '');
      setInstagram(profile.instagram || '');
      setChavePix(profile.chave_pix || '');
      setTipoChavePix(profile.tipo_chave_pix || 'celular');
      setDiasTrabalho(profile.dias_trabalho || [1, 2, 3, 4, 5, 6]);
      setHorarioInicio(profile.horario_inicio || '08:00');
      setHorarioFim(profile.horario_fim || '19:00');
      setIntervaloPadraoDias(profile.intervalo_padrao_dias || 21);
      setMensagemWhatsapp(
        profile.mensagem_whatsapp ||
        'Olá {cliente}! ✨ Passando para confirmar seu horário no {estudio} para {servico} no dia {data} às {hora}. Podemos confirmar? 💅'
      );
    }
  }, [profile]);

  // Toggle de dia de trabalho
  const toggleDiaTrabalho = (diaId) => {
    setDiasTrabalho((prev) => {
      if (prev.includes(diaId)) {
        if (prev.length === 1) {
          toast.error('Você deve manter ao menos 1 dia de atendimento na semana.');
          return prev;
        }
        return prev.filter((d) => d !== diaId);
      } else {
        return [...prev, diaId].sort();
      }
    });
  };

  // Upload de imagem local (converte em Base64)
  const handleUploadFoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoUrl(reader.result);
        toast.success('Foto carregada!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Salvar configurações gerais do perfil
  const handleSalvarPerfil = async () => {
    setSalvando(true);
    try {
      await updateProfile({
        nome,
        nome_estudio: nomeEstudio,
        telefone,
        foto_url: fotoUrl,
        endereco,
        instagram,
        chave_pix: chavePix,
        tipo_chave_pix: tipoChavePix,
        dias_trabalho: diasTrabalho,
        horario_inicio: horarioInicio,
        horario_fim: horarioFim,
        intervalo_padrao_dias: Number(intervaloPadraoDias),
        mensagem_whatsapp: mensagemWhatsapp,
      });
      toast.success('Perfil e configurações atualizados com sucesso!');
    } catch {
      toast.error('Erro ao atualizar configurações.');
    } finally {
      setSalvando(false);
    }
  };

  // Gerenciamento de Serviços
  const abrirModalNovoServico = () => {
    setServicoEmEdicao(null);
    setServicoForm({
      nome: '',
      valor_padrao: '',
      intervalo_dias_manutencao: 21,
    });
    setModalServicoAberto(true);
  };

  const abrirModalEditarServico = (servico) => {
    setServicoEmEdicao(servico);
    setServicoForm({
      nome: servico.nome,
      valor_padrao: servico.valor_padrao,
      intervalo_dias_manutencao: servico.intervalo_dias_manutencao || 21,
    });
    setModalServicoAberto(true);
  };

  const handleSalvarServico = async (e) => {
    e.preventDefault();
    if (!servicoForm.nome.trim() || !servicoForm.valor_padrao) {
      toast.error('Preencha o nome e valor do serviço.');
      return;
    }

    if (servicoEmEdicao) {
      await atualizarServico(servicoEmEdicao.id, {
        nome: servicoForm.nome,
        valor_padrao: parseFloat(servicoForm.valor_padrao),
        intervalo_dias_manutencao: parseInt(servicoForm.intervalo_dias_manutencao, 10),
      });
    } else {
      await adicionarServico({
        nome: servicoForm.nome,
        valor_padrao: parseFloat(servicoForm.valor_padrao),
        intervalo_dias_manutencao: parseInt(servicoForm.intervalo_dias_manutencao, 10),
      });
    }
    setModalServicoAberto(false);
  };

  const handleExcluirServico = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o serviço "${nome}"?`)) {
      await excluirServico(id);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Perfil & Estúdio
        </h1>
        <p className="text-xs text-slate-450 mt-0.5">
          Configure seu negócio, dias de atendimento e catálogo de serviços
        </p>
      </div>

      {/* Tabs de Navegação */}
      <Tabs
        tabs={[
          { id: 'geral', label: 'Meu Estúdio' },
          { id: 'jornada', label: 'Dias' },
          { id: 'servicos', label: 'Serviços' },
          { id: 'whatsapp', label: 'WhatsApp' },
        ]}
        activeTab={abaAtiva}
        onChange={setAbaAtiva}
      />

      {/* ABA 1: MEU ESTÚDIO (SIMPLIFICADO) */}
      {abaAtiva === 'geral' && (
        <div className="flex flex-col gap-4">
          {/* Identidade Visual / Logo */}
          <Card className="flex flex-col gap-3.5" padding="p-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-brand-500" />
              Identidade Visual
            </h3>

            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={fotoUrl || '/logo.png'}
                  alt="Logo do Estúdio"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-200 shadow-xs bg-brand-50"
                />
                <label className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadFoto}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {nomeEstudio || 'Nome do Estúdio'}
                </h4>
                <p className="text-xs text-slate-500 mb-2 truncate">
                  {nome || 'Nome da profissional'}
                </p>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      Alterar
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFoto}
                      className="hidden"
                    />
                  </label>

                  {fotoUrl && fotoUrl !== '/logo.png' && (
                    <button
                      type="button"
                      onClick={() => setFotoUrl('/logo.png')}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Padrão
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Dados do Estúdio */}
          <Card className="flex flex-col gap-3" padding="p-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-500" />
              Informações do Estúdio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nome do Salão"
                placeholder="Ex: Studio Jéssica Silva Nails"
                value={nomeEstudio}
                onChange={(e) => setNomeEstudio(e.target.value)}
                icon={Store}
              />

              <Input
                label="Nail Designer"
                placeholder="Ex: Jéssica Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                icon={User}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Número de Contato"
                placeholder="(11) 98765-4321"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                icon={Phone}
              />

              <Input
                label="Instagram / Redes Sociais"
                placeholder="@seu.estudio"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                icon={AtSign}
              />
            </div>

            <Input
              label="Local de Atendimento"
              placeholder="Rua das Flores, 120 - Sala 4 - Centro"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              icon={MapPin}
            />
          </Card>

          {/* Chave Pix para Cobrança / Sinais */}
          <Card className="flex flex-col gap-3" padding="p-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-brand-500" />
              Chave Pix
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Chave Pix"
                placeholder="Ex: 11987654321 ou chave@email.com"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Tipo de Chave</label>
                <select
                  value={tipoChavePix}
                  onChange={(e) => setTipoChavePix(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none"
                >
                  <option value="celular">Celular</option>
                  <option value="email">E-mail</option>
                  <option value="cpf">CPF/CNPJ</option>
                  <option value="aleatoria">Chave Aleatória</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Atalho na Tela Inicial (Aplicativo) */}
          <Card className="flex flex-col gap-3 border-brand-100 bg-brand-50/20" padding="p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0">
                <Smartphone className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900">
                  Aplicativo iNails
                </h3>
                <p className="text-xs text-slate-500">
                  Instale na tela inicial para acesso rápido e em tela cheia.
                </p>
              </div>
            </div>

            {isInstalled ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Aplicativo já instalado neste dispositivo</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-0.5">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={installApp}
                >
                  Instalar App
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInstrucoes}
                >
                  Instruções
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ABA 2: JORNADA DE TRABALHO & DIAS DA SEMANA */}
      {abaAtiva === 'jornada' && (
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3" padding="p-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-500" />
              Atendimento na semana
            </h3>
            <p className="text-xs text-slate-500">
              Selecione os dias em que você trabalha. Os dias desmarcados serão exibidos com cor de <strong>Folga</strong> na agenda mensal.
            </p>

            {/* Grade dos 7 Dias da Semana */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {DIAS_SEMANA.map((dia) => {
                const ativo = diasTrabalho.includes(dia.id);
                return (
                  <button
                    key={dia.id}
                    type="button"
                    onClick={() => toggleDiaTrabalho(dia.id)}
                    className={`
                      flex items-center justify-between p-3 rounded-xl border transition-all text-left
                      ${ativo
                        ? 'bg-brand-50/70 border-brand-300 text-brand-950 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${ativo ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                      >
                        {dia.abrev}
                      </div>
                      <div>
                        <span className="text-xs block">{dia.nome}</span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {ativo ? 'Atendimento normal' : 'Dia de folga'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {ativo ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Atende
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Coffee className="w-2.5 h-2.5" /> Folga
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Horários do Expediente */}
          <Card className="flex flex-col gap-3" padding="p-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-500" />
              Horário do Expediente
            </h3>
            <p className="text-xs text-slate-500">
              Horário padrão em que você costuma receber os primeiros e últimos agendamentos do dia.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Início do Expediente"
                type="time"
                value={horarioInicio}
                onChange={(e) => setHorarioInicio(e.target.value)}
              />

              <Input
                label="Fim do Expediente"
                type="time"
                value={horarioFim}
                onChange={(e) => setHorarioFim(e.target.value)}
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Input
                label="Ciclo de Manutenção (dias)"
                type="number"
                min="7"
                max="60"
                value={intervaloPadraoDias}
                onChange={(e) => setIntervaloPadraoDias(e.target.value)}
                helperText="Intervalo sugerido automaticamente ao agendar procedimentos com manutenção periódica."
              />
            </div>
          </Card>
        </div>
      )}

      {/* ABA 3: CATÁLOGO DE SERVIÇOS */}
      {abaAtiva === 'servicos' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Catálogo de Procedimentos
              </h3>
              <p className="text-xs text-slate-500">
                Gerencie serviços, preços padrão e ciclos de retorno
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={abrirModalNovoServico}
              icon={Plus}
            >
              Novo Serviço
            </Button>
          </div>

          {servicos.length === 0 ? (
            <Card className="p-6 text-center text-slate-500 text-xs">
              Nenhum serviço cadastrado ainda. Clique em "Novo Serviço" para adicionar seu primeiro procedimento!
            </Card>
          ) : (
            <div className="flex flex-col gap-2.5">
              {servicos.map((servico) => (
                <Card
                  key={servico.id}
                  padding="p-3.5"
                  className="flex items-center justify-between hover:border-brand-200 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {servico.nome}
                      </h4>
                      <Badge variant="recorrente" size="sm">
                        {servico.intervalo_dias_manutencao || 21} dias
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="font-extrabold text-brand-700">
                        {formatMoeda(servico.valor_padrao)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => abrirModalEditarServico(servico)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
                      title="Editar serviço"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExcluirServico(servico.id, servico.nome)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Excluir serviço"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 4: MENSAGEM WHATSAPP */}
      {abaAtiva === 'whatsapp' && (
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3" padding="p-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              Modelo de Confirmação
            </h3>
            <p className="text-xs text-slate-500">
              Personalize o texto padrão que será enviado para suas clientes na aba de confirmações com 1 clique.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Texto da Mensagem
              </label>
              <textarea
                rows={5}
                value={mensagemWhatsapp}
                onChange={(e) => setMensagemWhatsapp(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
                placeholder="Digite a mensagem padrão..."
              />
            </div>

            {/* Tags dinâmicas disponíveis */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-700">
                Tags que você pode usar (serão substituídas automaticamente):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '{cliente}',
                  '{estudio}',
                  '{servico}',
                  '{data}',
                  '{hora}',
                  '{pix}',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setMensagemWhatsapp((prev) => prev + ` ${tag}`)}
                    className="text-[10px] font-mono font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-md hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Simulado do WhatsApp */}
            <div className="mt-2">
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                Preview de como a cliente receberá:
              </span>
              <div className="bg-[#EFEAE2] p-3.5 rounded-2xl border border-slate-200 shadow-inner">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-xs max-w-[85%] text-xs text-slate-800 leading-relaxed">
                  {mensagemWhatsapp
                    .replace('{cliente}', 'Camila Santos')
                    .replace('{estudio}', nomeEstudio || 'Studio Jéssica Silva')
                    .replace('{servico}', 'Manutenção Fibra de Vidro')
                    .replace('{data}', '07/11/2026')
                    .replace('{hora}', '14:00')
                    .replace('{pix}', chavePix || '11987654321')}
                  <span className="block text-[9px] text-slate-400 text-right mt-1">
                    12:30 ✓✓
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Botão de Salvar Geral na parte inferior */}
      <div className="sticky bottom-20 z-20 pt-2">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleSalvarPerfil}
          loading={salvando}
          icon={Save}
          className="shadow-lg shadow-brand-500/25"
        >
          Salvar Todas as Configurações
        </Button>
      </div>

      {/* Modal Adicionar / Editar Serviço */}
      <Modal
        isOpen={modalServicoAberto}
        onClose={() => setModalServicoAberto(false)}
        title={servicoEmEdicao ? 'Editar Procedimento' : 'Novo Procedimento'}
        description="Cadastre as informações do serviço e intervalo de manutenção"
      >
        <form onSubmit={handleSalvarServico} className="flex flex-col gap-4">
          <Input
            label="Nome do Procedimento *"
            placeholder="Ex: Alongamento em Gel, Esmaltação Francesinha"
            value={servicoForm.nome}
            onChange={(e) => setServicoForm({ ...servicoForm, nome: e.target.value })}
            required
          />

          <Input
            label="Valor Padrão (R$) *"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={servicoForm.valor_padrao}
            onChange={(e) => setServicoForm({ ...servicoForm, valor_padrao: e.target.value })}
            icon={DollarSign}
            required
          />

          <Input
            label="Intervalo de Retorno / Manutenção (Dias) *"
            type="number"
            min="1"
            max="90"
            value={servicoForm.intervalo_dias_manutencao}
            onChange={(e) =>
              setServicoForm({ ...servicoForm, intervalo_dias_manutencao: e.target.value })
            }
            helperText="Recomendado: 21 dias para fibra/gel, 15 dias para esmaltação gel, 7 dias para tradicional."
            required
          />

          <div className="pt-2 flex items-center gap-2">
            <Button
              variant="outline"
              fullWidth
              type="button"
              onClick={() => setModalServicoAberto(false)}
            >
              Cancelar
            </Button>
            <Button variant="primary" fullWidth type="submit">
              {servicoEmEdicao ? 'Atualizar Serviço' : 'Salvar Serviço'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default PerfilPage;
