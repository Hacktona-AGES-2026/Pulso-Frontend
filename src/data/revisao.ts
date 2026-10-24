import type { FilaCodigo, Severidade } from "./fila";

export interface MarcacaoItem {
  sid: string;
  paciente: string;
  fila: FilaCodigo;
  marcacao: string;
  descricao: string;
  severidade: Severidade;
}

export const MARCACOES: MarcacaoItem[] = [
  { sid: "SOL-2024-00071", paciente: "Helena Duarte", fila: "G2", marcacao: "atualizar_cid", descricao: "Biópsia positiva, mas CID ainda benigno", severidade: "alta" },
  { sid: "SOL-2023-00088", paciente: "Rafael Nunes", fila: "G2", marcacao: "atualizar_cid", descricao: "AP: carcinoma — CID cadastrado como D48", severidade: "alta" },
  { sid: "SOL-2023-00045", paciente: "João Baptista", fila: "G1b", marcacao: "conflito_laudos", descricao: "Biópsia positiva e negativa no mesmo paciente", severidade: "alta" },
  { sid: "SOL-2022-00047", paciente: "Marcos Vidal", fila: "G1b", marcacao: "somente_texto", descricao: "Fila sustentada só por texto da justificativa", severidade: "alta" },
  { sid: "SOL-2022-00042", paciente: "Clara Pons", fila: "G4", marcacao: "confirmar_saida_g4", descricao: "Piora com mais de 180 dias — confirmar com regulador", severidade: "media" },
  { sid: "SOL-2023-00045b", paciente: "Edu Farias", fila: "G1b", marcacao: "texto_antigo", descricao: "Justificativa com mais de 365 dias", severidade: "media" },
  { sid: "SOL-2024-00112", paciente: "Vera Lúcia", fila: "G2", marcacao: "justificativa_pobre", descricao: "Justificativa com menos de 40 caracteres", severidade: "media" },
  { sid: "SOL-2022-00018", paciente: "Beatriz Antunes", fila: "G4", marcacao: "dados_faltantes", descricao: "Dor ou limitação funcional vazias", severidade: "media" },
  { sid: "SOL-2023-00010", paciente: "Roberto Simões", fila: "G2", marcacao: "flag_divergente", descricao: "Flag manual diferente dos dados clínicos", severidade: "baixa" },
  { sid: "SOL-2022-00002", paciente: "Antônio Ferreira", fila: "G1a", marcacao: "prazo_estourado", descricao: "Espera acima de 2× o prazo da fila", severidade: "informativa" },
  { sid: "SOL-2022-00005", paciente: "Paulo Cardoso", fila: "G6", marcacao: "alerta_prazo", descricao: "Espera já passou de 80% do prazo", severidade: "informativa" },
];

export const CONTAGEM_SEVERIDADE = {
  alta: MARCACOES.filter((m) => m.severidade === "alta").length,
  media: MARCACOES.filter((m) => m.severidade === "media").length,
  baixa: MARCACOES.filter((m) => m.severidade === "baixa").length,
  informativa: MARCACOES.filter((m) => m.severidade === "informativa").length,
};
