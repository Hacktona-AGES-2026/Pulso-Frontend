import type { ItemFila, Severidade } from "./fila";
import { NOME_FILA, PRAZO_FILA } from "./fila";

export interface Evidencia {
  sinal: string;
  data?: string;
  origem: string;
  trecho: string;
}

export interface EventoTL {
  data: string;
  titulo: string;
  resultado: string;
  expirado?: boolean;
}

export interface MarcacaoDet {
  marcacao: string;
  severidade: Severidade;
}

export interface PacienteDetalhe {
  especialidade: string;
  municipio: string;
  idade: number;
  posicaoFila: number;
  diasEmFila: number;
  prioridadeManual: string;
  divergente: boolean;
  justificativa: string;
  evidencias: Evidencia[];
  eventos: EventoTL[];
  marcacoes: MarcacaoDet[];
  pendencias: string[];
}

const RICOS: Record<string, PacienteDetalhe> = {
  "PAC-00660": {
    especialidade: "Mastologia",
    municipio: "Porto Alegre",
    idade: 58,
    posicaoFila: 2,
    diasEmFila: 862,
    prioridadeManual: "baixa",
    divergente: true,
    justificativa: "Nódulo mamário com BI-RADS 5, biópsia confirmando malignidade; encaminhada para cirurgia.",
    evidencias: [
      { sinal: "biópsia positiva", data: "12/06/2024", origem: "laboratório de patologia", trecho: "AP: carcinoma ductal invasivo, grau II." },
      { sinal: "maligno", origem: "derivado", trecho: "Oncológico confirmado por biópsia positiva." },
      { sinal: "suspeita no texto", origem: "justificativa", trecho: "nódulo mamário com bi-rads 5" },
    ],
    eventos: [
      { data: "12/06/2024", titulo: "Biópsia", resultado: "positivo · patologia" },
      { data: "01/08/2024", titulo: "HbA1c", resultado: "9,2% · laboratório" },
      { data: "20/09/2024", titulo: "Contato telefônico", resultado: "relata piora · call center" },
      { data: "03/11/2023", titulo: "Pronto-socorro", resultado: "observação · UPA", expirado: true },
    ],
    marcacoes: [
      { marcacao: "atualizar_cid", severidade: "alta" },
      { marcacao: "flag_divergente", severidade: "baixa" },
      { marcacao: "prazo_estourado", severidade: "informativa" },
    ],
    pendencias: ["hba1c_alta"],
  },
};

export function getDetalhe(item: ItemFila): PacienteDetalhe {
  const rico = RICOS[item.paciente.id];
  if (rico) return rico;
  return {
    especialidade: "—",
    municipio: "Porto Alegre",
    idade: 60,
    posicaoFila: item.ordem,
    diasEmFila: 420,
    prioridadeManual: "baixa",
    divergente: false,
    justificativa: `${item.fila} ${NOME_FILA[item.fila]} · prazo ${PRAZO_FILA[item.fila]}d · ${item.procedimento}.`,
    evidencias: [
      { sinal: "triagem", origem: "estado do paciente", trecho: `Classificado em ${item.fila} (${NOME_FILA[item.fila]}).` },
    ],
    eventos: [{ data: item.dataCirurgia, titulo: "Data da cirurgia prevista", resultado: "classificador padrão" }],
    marcacoes: [{ marcacao: "prazo_estourado", severidade: "informativa" }],
    pendencias: [],
  };
}
