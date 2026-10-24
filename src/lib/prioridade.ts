import type { Paciente, Prioridade } from '../data/types'
import { diasEntre, HOJE } from './datas'

export const PRIORIDADES: Record<
  Prioridade,
  { rotulo: string; prazo: number; descricaoPublica: string }
> = {
  A: {
    rotulo: 'Urgente',
    prazo: 21,
    descricaoPublica: 'Sua condição exige que a cirurgia aconteça o quanto antes.',
  },
  B: {
    rotulo: 'Prioritário',
    prazo: 60,
    descricaoPublica: 'Sua condição clínica coloca a cirurgia à frente dos casos eletivos.',
  },
  C: {
    rotulo: 'Eletivo',
    prazo: 180,
    descricaoPublica: 'A cirurgia é necessária, sem sinais de urgência no momento.',
  },
  D: {
    rotulo: 'Programável',
    prazo: 365,
    descricaoPublica: 'A cirurgia pode ser programada sem prejuízo à sua saúde.',
  },
}

export const ORDEM: Prioridade[] = ['A', 'B', 'C', 'D']

export function rotuloPrioridade(p: Prioridade) {
  return `${p} · ${PRIORIDADES[p].rotulo}`
}

export function ehOncologico(cid: string) {
  return cid.toUpperCase().startsWith('C')
}

/** Neoplasia maligna nunca fica abaixo de um caso sem urgência clínica. */
export function prioridadeMinima(cid: string): Prioridade {
  return ehOncologico(cid) ? 'B' : 'D'
}

export function permitida(p: Prioridade, cid: string) {
  return ORDEM.indexOf(p) <= ORDEM.indexOf(prioridadeMinima(cid))
}

export interface Fatores {
  gravidade: number
  piora: number
  eventosPiora: number
  tempo: number
  percentualPrazo: number
  risco: number
  total: number
}

export const LIMITES = { gravidade: 40, piora: 25, tempo: 20, risco: 15 }

export function calcularFatores(p: Paciente): Fatores {
  const dias = diasEntre(p.dataEntrada)
  const percentualPrazo = dias / PRIORIDADES[p.prioridade].prazo
  const eventosPiora = p.eventos.filter(
    (e) => e.piora && diasEntre(e.data, HOJE) <= 30 && diasEntre(e.data, HOJE) >= 0,
  ).length
  const piora = Math.min(LIMITES.piora, eventosPiora * 11)
  const tempo = Math.min(LIMITES.tempo, Math.round(percentualPrazo * LIMITES.tempo))
  const total = p.gravidade + piora + tempo + p.risco
  return { gravidade: p.gravidade, piora, eventosPiora, tempo, percentualPrazo, risco: p.risco, total }
}

export interface LinhaFila {
  paciente: Paciente
  posicao: number
  posicaoChegada: number
  dias: number
  fatores: Fatores
  resumo: string
}

export function resumoMotivo(p: Paciente, f: Fatores, dias: number) {
  const prazo = PRIORIDADES[p.prioridade].prazo
  const espera = `${dias} dias na fila (prazo de referência: ${prazo} dias)`
  if (ehOncologico(p.cid)) return `Neoplasia maligna ${p.cid}; ${espera}.`
  const partes = [p.motivo]
  if (!p.motivo && f.eventosPiora > 0)
    partes.push(`${f.eventosPiora} ${f.eventosPiora > 1 ? 'eventos' : 'evento'} de piora em 30 dias`)
  if (!p.motivo && f.eventosPiora === 0) partes.push(p.cidDescricao)
  return `${partes.filter(Boolean).join('; ')}; ${espera}.`
}

/**
 * Ordena a fila: classe de prioridade primeiro (o que garante oncológicos acima
 * de casos sem urgência), depois pontuação total e, por fim, tempo de espera.
 */
export function ordenarFila(pacientes: Paciente[]): LinhaFila[] {
  const chegada = [...pacientes]
    .sort((a, b) => a.dataEntrada.localeCompare(b.dataEntrada) || a.id.localeCompare(b.id))
    .reduce<Record<string, number>>((acc, p, i) => ((acc[p.id] = i + 1), acc), {})

  return pacientes
    .map((paciente) => {
      const fatores = calcularFatores(paciente)
      const dias = diasEntre(paciente.dataEntrada)
      return { paciente, fatores, dias }
    })
    .sort(
      (a, b) =>
        ORDEM.indexOf(a.paciente.prioridade) - ORDEM.indexOf(b.paciente.prioridade) ||
        b.fatores.total - a.fatores.total ||
        b.dias - a.dias,
    )
    .map((l, i) => ({
      ...l,
      posicao: i + 1,
      posicaoChegada: chegada[l.paciente.id],
      resumo: resumoMotivo(l.paciente, l.fatores, l.dias),
    }))
}
