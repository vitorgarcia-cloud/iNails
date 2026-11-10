import { addDays, subDays, format, parseISO, isSameDay } from 'date-fns';

/**
 * Algoritmo de Meeus/Jones/Butcher para calcular a Páscoa em qualquer ano
 * @param {number} year 
 * @returns {Date}
 */
export function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = Março, 4 = Abril
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Retorna todos os feriados nacionais brasileiros para o ano informado
 * @param {number} year 
 * @returns {Array<{ data: Date, nome: string, tipo: string }>}
 */
export function getFeriadosNacionais(year) {
  const easter = getEasterDate(year);

  // Feriados Móveis baseados na Páscoa
  const carnaval = subDays(easter, 47);
  const sextaFeiraSanta = subDays(easter, 2);
  const corpusChristi = addDays(easter, 60);

  // Feriados Nacionais Fixos (Brasil)
  const feriados = [
    { data: new Date(year, 0, 1), nome: 'Confraternização Universal (Ano Novo)', tipo: 'nacional' },
    { data: carnaval, nome: 'Carnaval', tipo: 'nacional' },
    { data: sextaFeiraSanta, nome: 'Sexta-feira Santa (Paixão de Cristo)', tipo: 'nacional' },
    { data: easter, nome: 'Páscoa', tipo: 'comemorativo' },
    { data: new Date(year, 3, 21), nome: 'Tiradentes', tipo: 'nacional' },
    { data: new Date(year, 4, 1), nome: 'Dia do Trabalhador', tipo: 'nacional' },
    { data: corpusChristi, nome: 'Corpus Christi', tipo: 'nacional' },
    { data: new Date(year, 8, 7), nome: 'Independência do Brasil', tipo: 'nacional' },
    { data: new Date(year, 9, 12), nome: 'Nossa Senhora Aparecida', tipo: 'nacional' },
    { data: new Date(year, 10, 2), nome: 'Finados', tipo: 'nacional' },
    { data: new Date(year, 10, 15), nome: 'Proclamação da República', tipo: 'nacional' },
    { data: new Date(year, 10, 20), nome: 'Dia da Consciência Negra', tipo: 'nacional' },
    { data: new Date(year, 11, 25), nome: 'Natal', tipo: 'nacional' },
  ];

  return feriados;
}

/**
 * Verifica se uma data específica é feriado nacional brasileiro
 * @param {Date|string} date 
 * @returns {{ nome: string, tipo: string } | null}
 */
export function getFeriado(date) {
  if (!date) return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  const year = d.getFullYear();
  const feriados = getFeriadosNacionais(year);

  const encontrado = feriados.find(f => isSameDay(f.data, d));
  return encontrado ? { nome: encontrado.nome, tipo: encontrado.tipo } : null;
}

/**
 * Verifica se um dia da semana é dia de trabalho segundo a configuração da manicure
 * @param {Date|string} date 
 * @param {number[]} diasTrabalho Array com índices de 0 (domingo) a 6 (sábado)
 * @returns {boolean}
 */
export function isDiaTrabalho(date, diasTrabalho = [1, 2, 3, 4, 5, 6]) {
  if (!date) return true;
  const d = typeof date === 'string' ? parseISO(date) : date;
  const diaSemana = d.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  return diasTrabalho.includes(diaSemana);
}

export default {
  getEasterDate,
  getFeriadosNacionais,
  getFeriado,
  isDiaTrabalho,
};

