// Cliente da API do Pulso (FastAPI em backend/, uvicorn src.main:app).
// Base configurável por VITE_API_URL; o backend libera CORS para localhost.

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

async function get<T>(caminho: string): Promise<T> {
  const r = await fetch(`${BASE}${caminho}`);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} em ${caminho}`);
  return r.json() as Promise<T>;
}

async function post<T>(caminho: string, corpo: unknown): Promise<T> {
  const r = await fetch(`${BASE}${caminho}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  if (!r.ok) {
    let detalhe = `${r.status} ${r.statusText}`;
    try {
      const j = await r.json();
      if (j?.detail) detalhe = String(j.detail);
    } catch {
      /* corpo sem json */
    }
    throw new Error(detalhe);
  }
  return r.json() as Promise<T>;
}

// ---- Tipos espelhando os payloads do backend ----

export interface Marcacao {
  marcacao: string;
  severidade: "alta" | "media" | "baixa" | "informativa";
  descricao?: string | null;
}

export interface ItemFilaApi {
  posicao: number;
  solicitacao_id: string;
  fila: string;
  posicao_fila: number | null;
  data_limite_efetiva: string | null;
  posicao_inicial: number | null;
  justificativa: string;
  marcacoes: Marcacao[];
  cid_principal: string;
  oncologico: boolean;
  paciente_id: string;
  paciente_nome: string;
  municipio: string | null;
  procedimento: string;
  hospital: string;
  data_entrada_fila: string | null;
  prioridade_regulacao: string | null;
  mudanca_pendente: number | null;
  mudanca_tipo: string | null;
  fila_proposta: string | null;
}

export interface FilaResumo {
  codigo: string;
  nome: string;
  oficial: number;
  recomendada: number;
}

export interface Resumo {
  solicitacoes: Record<string, number>;
  eventos: { processados: number; pendentes: number; quarentena: number };
  filas: FilaResumo[];
  mudancas: Record<string, number>;
  regra_de_ouro: Record<string, { ok: boolean; erro?: string }>;
}

export interface MarcacaoLinha {
  solicitacao_id: string;
  fila: string;
  posicao: number;
  paciente_nome: string;
  cid_principal: string;
  marcacao: string;
  severidade: Marcacao["severidade"];
  descricao: string | null;
}

export interface Evidencia {
  data?: string;
  tipo?: string;
  origem: string;
  trecho: string;
  evento_id?: string;
  somente_texto?: boolean;
}

export interface MudancaApi {
  id: number;
  solicitacao_id: string;
  tipo: "subir" | "sair";
  status: string;
  fila_atual: string | null;
  fila_proposta: string | null;
  posicao_atual: number | null;
  posicao_proposta: number | null;
  motivo: string;
  evidencias: Evidencia[] | null;
  evento_id: string | null;
  oncologico: boolean;
  criada_em: string;
  medico_id: number | null;
  decidida_em: string | null;
  motivo_decisao: string | null;
}

export interface EventoApi {
  id: string;
  data_evento: string;
  tipo_evento: string;
  resultado: string;
  valor_numerico: number | null;
  descricao: string;
  origem: string;
  processado_em: string | null;
}

export interface SolicitacaoDetalhe {
  id: string;
  paciente_id: string;
  paciente_nome: string;
  idade: number | null;
  municipio: string | null;
  sexo: string | null;
  especialidade: string | null;
  procedimento: string;
  cid_principal: string;
  cid_descricao: string;
  intensidade_dor_eva: number | null;
  limitacao_funcional: string | null;
  justificativa_clinica: string;
  observacoes: string | null;
  data_entrada_fila: string;
  prioridade_regulacao: string | null;
  status: string;
  fila_oficial: {
    posicao: number;
    posicao_inicial: number;
    fila: string;
    posicao_fila: number;
    data_limite_efetiva: string | null;
    justificativa: string;
    marcacoes: Marcacao[];
  } | null;
  estado_motor: Record<string, unknown> | null;
  eventos: EventoApi[];
  mudancas: Array<Record<string, unknown>>;
  features: Record<string, unknown> | null;
}

export interface Medico {
  id: number;
  nome: string;
  crm: string;
  especialidade: string;
}

// ---- Endpoints ----

export const api = {
  resumo: () => get<Resumo>("/resumo"),
  fila: (modo: "oficial" | "recomendada" = "oficial", limite = 1000) =>
    get<ItemFilaApi[]>(`/fila?modo=${modo}&limite=${limite}`),
  marcacoes: (severidade?: string) =>
    get<MarcacaoLinha[]>(`/marcacoes${severidade ? `?severidade=${severidade}` : ""}`),
  mudancas: (status = "pendente", limite = 1000) =>
    get<MudancaApi[]>(`/mudancas?status=${status}&limite=${limite}`),
  solicitacao: (id: string) => get<SolicitacaoDetalhe>(`/solicitacoes/${id}`),
  medicos: () => get<Medico[]>("/medicos"),
  decidir: (id: number, decisao: "aprovar" | "rejeitar", medico_id: number, motivo?: string) =>
    post<unknown>(`/mudancas/${id}/decisao`, { decisao, medico_id, motivo }),
};
