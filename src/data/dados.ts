export interface QuarentenaItem {
  eventoId: string;
  motivo: string;
  detalhe: string;
}

export const QUARENTENA: QuarentenaItem[] = [
  { eventoId: "EVT-000912", motivo: "solicitacao_inexistente", detalhe: "Aponta para SOL-2019-00004, fora da fila" },
  { eventoId: "EVT-001087", motivo: "solicitacao_inexistente", detalhe: "Aponta para SOL-2020-00231, fora da fila" },
  { eventoId: "EVT-001341", motivo: "data_futura", detalhe: "data_evento 02/11/2026, após a referência" },
  { eventoId: "EVT-000455", motivo: "tipo_desconhecido", detalhe: "tipo_evento 'telemedicina' fora do domínio" },
  { eventoId: "EVT-000780", motivo: "paciente_divergente", detalhe: "paciente_id diferente do da solicitação" },
  { eventoId: "EVT-001502", motivo: "valor_ausente", detalhe: "HbA1c sem valor numérico" },
];

export interface ForaDaFilaItem {
  sid: string;
  paciente: string;
  status: "duplicata" | "saiu";
  detalhe: string;
}

export const FORA_DA_FILA: ForaDaFilaItem[] = [
  { sid: "SOL-2025-00318", paciente: "Antônio Ferreira", status: "duplicata", detalhe: "Fundida em SOL-2023-00074" },
  { sid: "SOL-2025-00412", paciente: "Marina Lopes", status: "duplicata", detalhe: "Fundida em SOL-2024-00058" },
  { sid: "SOL-2024-00990", paciente: "José Pereira", status: "saiu", detalhe: "contato_telefonico = desistiu em 12/08/2026" },
  { sid: "SOL-2024-00865", paciente: "Carla Reis", status: "saiu", detalhe: "informou_cirurgia_outro_servico em 09/09/2026" },
  { sid: "SOL-2023-00701", paciente: "Mário Góes", status: "saiu", detalhe: "Observação: operou pelo convênio" },
];

export interface ExecucaoItem {
  versao: number;
  data: string;
  regras: string;
  nAtivas: number;
  status: string;
}

export const EXECUCOES: ExecucaoItem[] = [
  { versao: 1, data: "23/10/2026 14:02", regras: "v2.0.0", nAtivas: 897, status: "ok" },
];

export const RESUMO_DADOS = {
  lidas: 941,
  unicas: 919,
  ativas: 897,
  duplicatas: 22,
  saidas: 22,
  quarentena: 9,
  duplicados: 7,
};
