import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata um número como valor monetário brasileiro (BRL - R$ 0,00)
 * @param {number|string} valor 
 * @returns {string}
 */
export function formatMoeda(valor) {
  const numero = typeof valor === 'string' ? parseFloat(valor) : Number(valor);
  if (isNaN(numero)) return 'R$ 0,00';
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata data no padrão brasileiro
 * @param {string|Date} data 
 * @param {boolean} incluirHora 
 * @returns {string}
 */
export function formatDataBR(data, incluirHora = false) {
  if (!data) return '-';
  try {
    const d = typeof data === 'string' ? parseISO(data) : data;
    if (!isValid(d)) return '-';
    const pattern = incluirHora ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy';
    return format(d, pattern, { locale: ptBR });
  } catch {
    return '-';
  }
}

/**
 * Formata a hora de uma data (HH:mm)
 * @param {string|Date} data 
 * @returns {string}
 */
export function formatHoraBR(data) {
  if (!data) return '--:--';
  try {
    const d = typeof data === 'string' ? parseISO(data) : data;
    if (!isValid(d)) return '--:--';
    return format(d, 'HH:mm', { locale: ptBR });
  } catch {
    return '--:--';
  }
}

/**
 * Formata número de telefone celular brasileiro (XX) XXXXX-XXXX
 * @param {string} telefone 
 * @returns {string}
 */
export function formatTelefone(telefone) {
  if (!telefone) return '';
  const limpo = telefone.replace(/\D/g, '');
  if (limpo.length === 11) {
    return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (limpo.length === 10) {
    return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
}

/**
 * Retorna o mês por extenso em português (ex: Novembro 2026)
 * @param {Date|string} data 
 * @returns {string}
 */
export function formatMesExtenso(data) {
  try {
    const d = typeof data === 'string' ? parseISO(data) : data;
    return format(d, 'MMMM yyyy', { locale: ptBR });
  } catch {
    return '';
  }
}
