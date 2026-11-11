import { addDays, subDays, parseISO } from 'date-fns';
import { getFeriado, isDiaTrabalho } from './holidays.js';

/**
 * Ajusta uma data caso caia em dia de folga ou feriado.
 * Joga para o dia seguinte (+1) ou anterior (-1), o que estiver mais próximo.
 * Preserva o horário original (horas e minutos).
 *
 * @param {Date|string} data Data a verificar
 * @param {number[]} diasTrabalho Dias da semana trabalhados (0=Dom, 1=Seg... 6=Sab)
 * @returns {Date} Data ajustada (ou a própria data se já for dia útil)
 */
export function ajustarParaDiaUtil(data, diasTrabalho = [1, 2, 3, 4, 5, 6]) {
  const d = typeof data === 'string' ? parseISO(data) : new Date(data);

  const ehDiaValido = (date) => {
    // 1. Deve ser dia de trabalho configurado (não pode ser folga)
    if (!isDiaTrabalho(date, diasTrabalho)) {
      return false;
    }

    // 2. Não pode ser feriado nacional
    if (getFeriado(date)) {
      return false;
    }

    return true;
  };

  // Se a data já for um dia de atendimento normal sem feriado, mantém
  if (ehDiaValido(d)) {
    return d;
  }

  // Busca o dia válido mais próximo.
  // Avalia distâncias crescentes: dia seguinte (+1), dia anterior (-1), +2, -2...
  for (let offset = 1; offset <= 14; offset++) {
    const diaSeguinte = addDays(d, offset);
    if (ehDiaValido(diaSeguinte)) {
      return diaSeguinte;
    }

    const diaAnterior = subDays(d, offset);
    if (ehDiaValido(diaAnterior)) {
      return diaAnterior;
    }
  }

  return d;
}

/**
 * Calcula as próximas manutenções de um procedimento
 * @param {string|Date} dataInicial Data do primeiro atendimento
 * @param {number} intervaloDias Intervalo em dias (ex: 21 dias para fibra/gel)
 * @param {number} qtdCiclos Quantidade de ciclos futuros a projetar (padrão: 2)
 * @param {number[]} diasTrabalho Dias da semana trabalhados (padrão: [1,2,3,4,5,6])
 * @returns {Array<{ ciclo: number, data: Date, dataISO: string, dataCalculada: Date, ajustado: boolean, motivo: string }>}
 */
export function calcularProximasManutencoes(
  dataInicial,
  intervaloDias,
  qtdCiclos = 2,
  diasTrabalho = [1, 2, 3, 4, 5, 6]
) {
  if (!dataInicial || !intervaloDias || intervaloDias <= 0) {
    return [];
  }

  const baseDate = typeof dataInicial === 'string' ? parseISO(dataInicial) : new Date(dataInicial);
  const projecoes = [];
  let dataReferencia = baseDate;

  for (let i = 1; i <= qtdCiclos; i++) {
    const dataCalculada = addDays(dataReferencia, intervaloDias);
    const dataAjustada = ajustarParaDiaUtil(dataCalculada, diasTrabalho);
    const ajustado = dataCalculada.getTime() !== dataAjustada.getTime();

    let motivo = '';
    if (ajustado) {
      const feriado = getFeriado(dataCalculada);
      const ehFolga = !isDiaTrabalho(dataCalculada, diasTrabalho);
      if (ehFolga) {
        motivo = 'Dia de folga';
      } else if (feriado) {
        motivo = `Feriado: ${feriado.nome}`;
      }
    }

    projecoes.push({
      ciclo: i,
      data: dataAjustada,
      dataISO: dataAjustada.toISOString(),
      dataCalculada,
      ajustado,
      motivo,
    });

    // Cada próximo ciclo parte da data da manutenção anterior
    dataReferencia = dataAjustada;
  }

  return projecoes;
}

export default {
  ajustarParaDiaUtil,
  calcularProximasManutencoes,
};
