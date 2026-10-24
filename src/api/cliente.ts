import type {
  Detalhe,
  Explicacao,
  ItemFila,
  MarcacaoApi,
  Medico,
  Mudanca,
  PendenciaApi,
  ResultadoDecisao,
  Resumo,
} from './tipos'

/** Endereço da API. Em desenvolvimento, o backend roda em localhost:8000. */
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000'

export class ErroApi extends Error {
  constructor(
    public status: number,
    mensagem: string,
  ) {
    super(mensagem)
  }
}

async function requisitar<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resposta: Response
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    })
  } catch {
    throw new ErroApi(0, 'Não foi possível conectar ao servidor.')
  }
  if (!resposta.ok) {
    let detalhe = resposta.statusText
    try {
      const corpo = await resposta.json()
      if (typeof corpo?.detail === 'string') detalhe = corpo.detail
    } catch {
      /* resposta sem corpo JSON */
    }
    throw new ErroApi(resposta.status, detalhe)
  }
  return resposta.json() as Promise<T>
}

export const api = {
  resumo: () => requisitar<Resumo>('/resumo'),
  fila: (modo: 'oficial' | 'recomendada' = 'oficial') => requisitar<ItemFila[]>(`/fila?modo=${modo}&limite=1000`),
  solicitacao: (id: string) => requisitar<Detalhe>(`/solicitacoes/${encodeURIComponent(id)}`),
  mudancas: (status: 'pendente' | 'todas' = 'pendente') =>
    requisitar<Mudanca[]>(`/mudancas?status=${status}&limite=1000&com_explicacao=true`),
  // gerar=false: usa o texto já gerado (ou o texto padrão), sem chamar o LLM na hora
  explicacaoSolicitacao: (id: string) =>
    requisitar<Explicacao>(`/solicitacoes/${encodeURIComponent(id)}/explicacao?gerar=false`),
  decidir: (id: number, corpo: { decisao: 'aprovar' | 'rejeitar'; medico_id: number; motivo: string }) =>
    requisitar<ResultadoDecisao>(`/mudancas/${id}/decisao`, { method: 'POST', body: JSON.stringify(corpo) }),
  processarEventos: (limite = 1) =>
    requisitar<unknown>(`/eventos/processar?limite=${limite}`, { method: 'POST' }),
  pendencias: () => requisitar<PendenciaApi[]>('/pendencias'),
  marcacoes: (severidade?: string) => requisitar<MarcacaoApi[]>(`/marcacoes${severidade ? `?severidade=${severidade}` : ''}`),
  medicos: () => requisitar<Medico[]>('/medicos'),
}
