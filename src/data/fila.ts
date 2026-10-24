// Dados de exemplo da fila priorizada (desktop).
// Estrutura espelha a saída do backend (fila_detalhada): ordem, paciente, procedimento, fila.
// `dataCirurgia` e `hospital` são do passo de agendamento (fora do escopo 1–6) — aqui mockados.

export type FilaCodigo = "G1a" | "G1b" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7";
export type Familia = "red" | "org" | "amb" | "blu" | "grn";
export type Severidade = "alta" | "media" | "baixa" | "informativa";

export const ORDEM_FILAS: FilaCodigo[] = ["G1a", "G1b", "G2", "G3", "G4", "G5", "G6", "G7"];

export const NOME_FILA: Record<FilaCodigo, string> = {
  G1a: "Oncológico em progressão",
  G1b: "Agudo não oncológico",
  G2: "Oncológico confirmado",
  G3: "Suspeita oncológica",
  G4: "Deterioração recente",
  G5: "Alta carga de sintomas",
  G6: "Sintomático moderado",
  G7: "Eletivo estável",
};

export const PRAZO_FILA: Record<FilaCodigo, number> = {
  G1a: 15, G1b: 15, G2: 21, G3: 60, G4: 60, G5: 60, G6: 180, G7: 360,
};

export const TAMANHO_FILA: Record<FilaCodigo, number> = {
  G1a: 53, G1b: 70, G2: 142, G3: 16, G4: 118, G5: 95, G6: 194, G7: 209,
};

export const FAMILIA_DA_FILA: Record<FilaCodigo, Familia> = {
  G1a: "red",
  G1b: "red",
  G2: "org",
  G3: "org",
  G4: "amb",
  G5: "amb",
  G6: "blu",
  G7: "grn",
};

export interface Paciente {
  nome: string;
  id: string;
}

export interface ItemFila {
  ordem: number;
  paciente: Paciente;
  dataCirurgia: string; // dd/mm/aaaa
  diaSemana: string;
  procedimento: string;
  hospital: string;
  fila: FilaCodigo;
}

export const FILA: ItemFila[] = [
  { ordem: 1, paciente: { nome: "Antônio Ferreira", id: "PAC-00685" }, dataCirurgia: "27/10/2026", diaSemana: "terça-feira", procedimento: "Exérese de tumor de pele", hospital: "Hospital São Lucas", fila: "G1a" },
  { ordem: 2, paciente: { nome: "Carlos Menezes", id: "PAC-00224" }, dataCirurgia: "28/10/2026", diaSemana: "quarta-feira", procedimento: "Prostatectomia radical", hospital: "Santa Casa", fila: "G1a" },
  { ordem: 3, paciente: { nome: "João Baptista", id: "PAC-00330" }, dataCirurgia: "30/10/2026", diaSemana: "sexta-feira", procedimento: "Safenectomia / varizes", hospital: "Hospital de Clínicas", fila: "G1b" },
  { ordem: 4, paciente: { nome: "Helena Duarte", id: "PAC-00660" }, dataCirurgia: "03/11/2026", diaSemana: "segunda-feira", procedimento: "Mastectomia / setorectomia", hospital: "Hospital São Lucas", fila: "G2" },
  { ordem: 5, paciente: { nome: "Roberto Simões", id: "PAC-00467" }, dataCirurgia: "05/11/2026", diaSemana: "quarta-feira", procedimento: "Colectomia", hospital: "Santa Casa", fila: "G2" },
  { ordem: 6, paciente: { nome: "Marina Lopes", id: "PAC-00075" }, dataCirurgia: "12/11/2026", diaSemana: "quinta-feira", procedimento: "Exérese de lesão suspeita", hospital: "Hospital Moinhos", fila: "G3" },
  { ordem: 7, paciente: { nome: "Beatriz Antunes", id: "PAC-00384" }, dataCirurgia: "20/11/2026", diaSemana: "sexta-feira", procedimento: "Histerectomia", hospital: "Hospital de Clínicas", fila: "G4" },
  { ordem: 8, paciente: { nome: "Sebastião Rocha", id: "PAC-00480" }, dataCirurgia: "01/12/2026", diaSemana: "terça-feira", procedimento: "Artroplastia de quadril", hospital: "Hospital Ortopédico", fila: "G5" },
  { ordem: 9, paciente: { nome: "Paulo Cardoso", id: "PAC-00403" }, dataCirurgia: "10/01/2027", diaSemana: "domingo", procedimento: "RTU de próstata", hospital: "Santa Casa", fila: "G6" },
  { ordem: 10, paciente: { nome: "Luíza Fontes", id: "PAC-00849" }, dataCirurgia: "15/03/2027", diaSemana: "segunda-feira", procedimento: "Facectomia (catarata)", hospital: "Hospital São Lucas", fila: "G7" },
];

export type IconeKpi = "users" | "target" | "alarm" | "flag" | "phone";

export interface Kpi {
  valor: string;
  rotulo: string;
  icone: IconeKpi;
  cor: string;
  fundo: string;
}

export const KPIS: Kpi[] = [
  { valor: "897", rotulo: "ativas", icone: "users", cor: "#4a6cf7", fundo: "#e9edff" },
  { valor: "195", rotulo: "oncológicos no topo", icone: "target", cor: "#f3892f", fundo: "var(--org-t)" },
  { valor: "578", rotulo: "prazo estourado", icone: "alarm", cor: "#f0495a", fundo: "var(--red-t)" },
  { valor: "68", rotulo: "revisão humana", icone: "flag", cor: "#d79a0a", fundo: "var(--amb-t)" },
  { valor: "151", rotulo: "pendências", icone: "phone", cor: "#3f83d6", fundo: "var(--blu-t)" },
];

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const a = partes[0]?.[0] ?? "";
  const b = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (a + b).toUpperCase();
}
