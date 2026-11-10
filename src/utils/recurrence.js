import { addDays, parseISO } from 'date-fns';

/**
 * Calcula as datas projetadas para as próximas manutenções
 * @param {string|Date} dataInicial Data do primeiro atendimento
 * @param {number} intervaloDias Intervalo em dias (ex: 21 dias para fibra)
 * @param {number} qtdCiclos Quantidade de ciclos futuros a projetar (padrão: 3)
 * @returns {Array<{ ciclo: number, data: Date, dataISO: string }>}
 */
export function calcularProximasManutencoes(dataInicial, intervaloDias, qtdCiclos = 3) {
  if (!dataInicial || !intervaloDias || intervaloDias <= 0) {
    return [];
  }

  const baseDate = typeof dataInicial === 'string' ? parseISO(dataInicial) : new Date(dataInicial);
  const projecoes = [];

  for (let i = 1; i <= qtdCiclos; i++) {
    const dataProjetada = addDays(baseDate, intervaloDias * i);
    projecoes.push({
      ciclo: i,
      data: dataProjetada,
      dataISO: dataProjetada.toISOString(),
      diasAPartirDeHoje: intervaloDias * i
    });
  }

  return projecoes;
}
