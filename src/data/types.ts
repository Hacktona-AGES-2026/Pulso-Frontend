export type Prioridade = 'A' | 'B' | 'C' | 'D'

export type TipoEvento =
  | 'entrada'
  | 'pronto-socorro'
  | 'internacao'
  | 'exame'
  | 'biopsia'
  | 'contato'
  | 'consulta'
  | 'falta'

export interface EventoClinico {
  data: string // ISO yyyy-mm-dd
  tipo: TipoEvento
  descricao: string
  /** Conta como sinal de piora no cálculo de prioridade */
  piora?: boolean
}

export interface SinalIA {
  id: string
  /** Trecho exato da justificativa que é destacado */
  trecho: string
  rotulo: string
  status: 'sugerido' | 'confirmado' | 'descartado'
}

export interface Decisao {
  data: string // ISO com horário
  profissional: string
  de: Prioridade | null
  para: Prioridade
  justificativa: string
  tipo: 'inclusao' | 'ajuste' | 'revisao-confirmada' | 'revisao-mantida'
  /** Texto curto, em linguagem simples, que o paciente pode ver */
  motivoPublico?: string
}

export interface Paciente {
  id: string
  nome: string
  idade: number
  sexo: 'F' | 'M'
  nascimento?: string
  cpf?: string
  cns?: string
  municipio: string
  procedimento: string
  especialidade: string
  cid: string
  cidDescricao: string
  prioridade: Prioridade
  dataEntrada: string
  /** Pontos de gravidade clínica (0–40) */
  gravidade: number
  /** Pontos de risco estimado (0–15) */
  risco: number
  /** Frase curta usada no resumo do motivo */
  motivo?: string
  eventos: EventoClinico[]
  justificativa: string
  observacao?: string
  sinais: SinalIA[]
  decisoes: Decisao[]
}

export interface Revisao {
  id: string
  pacienteId: string
  de: Prioridade
  para: Prioridade
  motivo: string
  motivoPublico: string
  evidencias: string[]
  data: string
  status: 'pendente' | 'confirmada' | 'mantida'
}
