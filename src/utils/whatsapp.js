import { formatDataBR, formatHoraBR } from './formatters';

/**
 * Higieniza o número de telefone e adiciona código do Brasil (55) se necessário
 * @param {string} telefone 
 * @returns {string}
 */
export function normalizarTelefoneWhatsApp(telefone) {
  if (!telefone) return '';
  const digits = telefone.replace(/\D/g, '');
  
  // Se já tiver 55 no início e tiver 12 ou 13 dígitos
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  // Se for celular brasileiro sem DDI (10 ou 11 dígitos)
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

/**
 * Cria a mensagem padrão de confirmação D-1 para o WhatsApp
 * @param {Object} dados
 * @param {string} dados.nomeCliente
 * @param {string} dados.nomeEstudio
 * @param {string|Date} dados.dataHora
 * @param {string} dados.nomeServico
 * @returns {string}
 */
export function criarMensagemConfirmacao({
  nomeCliente,
  nomeEstudio = 'Studio iNails',
  dataHora,
  nomeServico = 'atendimento'
}) {
  const primeiroNome = nomeCliente ? nomeCliente.split(' ')[0] : 'Cliente';
  const data = formatDataBR(dataHora);
  const hora = formatHoraBR(dataHora);

  return `Olá, ${primeiroNome}! ✨ Aqui é do *${nomeEstudio}*.\n\nPassando para confirmar seu agendamento de *${nomeServico}* marcado para amanhã (*${data}*) às *${hora}*.\n\nPodemos confirmar seu horário? Responda com:\n1️⃣ *Confirmar*\n2️⃣ *Preciso Reagendar*`;
}

/**
 * Gera o link wa.me pronto para clique
 * @param {string} telefone 
 * @param {string} mensagem 
 * @returns {string}
 */
export function gerarLinkWhatsApp(telefone, mensagem) {
  const phone = normalizarTelefoneWhatsApp(telefone);
  const text = encodeURIComponent(mensagem);
  return `https://wa.me/${phone}?text=${text}`;
}
