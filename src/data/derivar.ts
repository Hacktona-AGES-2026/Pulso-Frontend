import { FAMILIA_DA_FILA, type Familia, type FilaCodigo, type Kpi } from "./fila";
import type { ItemFilaApi, Resumo } from "./api";

export const HOJE = "2026-10-23"; // data de referência do dataset (PULSO_DATA_REFERENCIA)

// A API devolve `fila` como string; mapeia para família de cor com fallback neutro.
export function familiaDe(fila: string): Familia {
  return FAMILIA_DA_FILA[fila as FilaCodigo] ?? "grn";
}

function temAlta(i: ItemFilaApi): boolean {
  return (i.marcacoes ?? []).some((m) => m.severidade === "alta");
}

function prazoEstourado(i: ItemFilaApi): boolean {
  return i.data_limite_efetiva != null && i.data_limite_efetiva < HOJE;
}

// KPIs da barra superior, calculados a partir da fila oficial + resumo.
export function kpisDe(resumo: Resumo | null, itens: ItemFilaApi[] | null): Kpi[] {
  const ativas = resumo?.solicitacoes?.ativa ?? itens?.length ?? 0;
  const lista = itens ?? [];
  const onco = lista.filter((i) => i.oncologico).length;
  const estourado = lista.filter(prazoEstourado).length;
  const revisao = lista.filter(temAlta).length;
  const pendentes = Object.entries(resumo?.mudancas ?? {})
    .filter(([k]) => k.endsWith("/pendente"))
    .reduce((s, [, n]) => s + n, 0);

  return [
    { valor: String(ativas), rotulo: "ativas", icone: "users", cor: "#4a6cf7", fundo: "#e9edff" },
    { valor: String(onco), rotulo: "oncológicos", icone: "target", cor: "#f3892f", fundo: "var(--org-t)" },
    { valor: String(estourado), rotulo: "fora do prazo-limite", icone: "alarm", cor: "#f0495a", fundo: "var(--red-t)" },
    { valor: String(revisao), rotulo: "revisão humana", icone: "flag", cor: "#d79a0a", fundo: "var(--amb-t)" },
    { valor: String(pendentes), rotulo: "mudanças p/ médico", icone: "phone", cor: "#3f83d6", fundo: "var(--blu-t)" },
  ];
}

export function regraDeOuroOk(resumo: Resumo | null): boolean {
  return resumo?.regra_de_ouro?.fila_priorizada?.ok ?? false;
}

// Descrições legíveis para as marcações (o backend guarda só o código).
export const MARCACAO_LABEL: Record<string, string> = {
  atualizar_cid: "Biópsia/laudo diverge do CID cadastrado",
  conflito_laudos: "Laudos conflitantes no mesmo paciente",
  somente_texto: "Fila sustentada só pelo texto da justificativa",
  confirmar_saida_g4: "Piora com mais de 180 dias — confirmar com regulador",
  texto_antigo: "Justificativa com mais de 365 dias",
  justificativa_pobre: "Justificativa muito curta",
  dados_faltantes: "Dor ou limitação funcional vazias",
  flag_divergente: "Flag manual diferente dos dados clínicos",
  prazo_estourado: "Espera acima de 2× o prazo da fila",
  alerta_prazo: "Espera já passou de 80% do prazo",
};

export function descreverMarcacao(codigo: string, descricao?: string | null): string {
  return descricao || MARCACAO_LABEL[codigo] || codigo.replace(/_/g, " ");
}

// "2024-12-13" -> "13/12/2024"; mantém vazio seguro.
export function dataBr(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return d && m && a ? `${d}/${m}/${a}` : iso;
}

const SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
export function diaSemana(iso: string | null | undefined): string {
  if (!iso) return "";
  const dt = new Date(`${iso}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? "" : SEMANA[dt.getDay()];
}
