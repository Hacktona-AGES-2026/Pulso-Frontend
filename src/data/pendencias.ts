import type { FilaCodigo } from "./fila";

export interface PendenciaItem {
  sid: string;
  paciente: string;
  fila: FilaCodigo;
  tipo: string;
  rotulo: string;
  detalhe: string;
}

export const PENDENCIAS: PendenciaItem[] = [
  { sid: "SOL-2022-00005", paciente: "Paulo Cardoso", fila: "G6", tipo: "sem_contato", rotulo: "Sem contato", detalhe: "Observação: número não existe" },
  { sid: "SOL-2022-00005", paciente: "Paulo Cardoso", fila: "G6", tipo: "nao_atendeu_2x", rotulo: "Não atendeu 2×", detalhe: "2 tentativas de contato sem sucesso" },
  { sid: "SOL-2022-00012", paciente: "Diego Matos", fila: "G5", tipo: "faltas_2x", rotulo: "Faltas 2×", detalhe: "Faltou a 2 consultas/exames" },
  { sid: "SOL-2024-00071", paciente: "Helena Duarte", fila: "G2", tipo: "hba1c_alta", rotulo: "HbA1c alta", detalhe: "Última HbA1c 9,2% (> 8,5%)" },
  { sid: "SOL-2023-00074", paciente: "Antônio Ferreira", fila: "G1a", tipo: "duplicata_fundida", rotulo: "Duplicata fundida", detalhe: "Mestre de 1 solicitação duplicada" },
  { sid: "SOL-2022-00008", paciente: "Íris Campos", fila: "G6", tipo: "confirmar_saida", rotulo: "Confirmar saída", detalhe: "“Não deseja mais operar no momento”" },
  { sid: "SOL-2025-00051", paciente: "Rafael Nunes", fila: "G2", tipo: "irma_com_evento", rotulo: "Irmã com evento", detalhe: "Outra solicitação do paciente teve internação" },
];

export const CONTAGEM_PENDENCIAS = PENDENCIAS.length;
