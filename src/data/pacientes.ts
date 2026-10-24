import { HOJE, idadeEm, somarDias } from '../lib/datas'
import { montarCpf } from '../lib/documentos'
import type { Decisao, EventoClinico, Paciente, Prioridade, SinalIA } from './types'

export const PROFISSIONAIS = ['Dra. Camila Duarte', 'Dr. Henrique Prado', 'Dra. Patrícia Lemos']
export const REGULADOR_ATUAL = 'Dr. Rafael Mendes'

const antes = (dias: number) => somarDias(HOJE, -dias)

function inclusao(data: string, para: Prioridade, justificativa: string, profissional = PROFISSIONAIS[0]): Decisao {
  return { data: `${data}T09:00`, profissional, de: null, para, justificativa, tipo: 'inclusao' }
}

function sinal(id: string, trecho: string, rotulo: string): SinalIA {
  return { id, trecho, rotulo, status: 'sugerido' }
}

type Base = Omit<Paciente, 'eventos' | 'decisoes' | 'sinais' | 'idade'> & {
  idade?: number
  eventos?: EventoClinico[]
  decisoes?: Decisao[]
  sinais?: SinalIA[]
}

function paciente(b: Base): Paciente {
  const eventos: EventoClinico[] = [
    { data: b.dataEntrada, tipo: 'entrada' as const, descricao: `Entrada na fila para ${b.procedimento.toLowerCase()}.` },
    ...(b.eventos ?? []),
  ].sort((x, y) => x.data.localeCompare(y.data))
  return {
    ...b,
    idade: b.idade ?? (b.nascimento ? idadeEm(b.nascimento) : 0),
    eventos,
    sinais: b.sinais ?? [],
    decisoes: b.decisoes ?? [
      inclusao(b.dataEntrada, b.prioridade, 'Classificação inicial na inclusão da solicitação.'),
    ],
  }
}

/* ------------------------------------------------------------------ */
/* Pacientes acompanhados de perto pela regulação                      */
/* ------------------------------------------------------------------ */

const acompanhados: Paciente[] = [
  paciente({
    id: 'SOL-104382',
    nome: 'Maria Oliveira',
    sexo: 'F',
    nascimento: '1974-03-14',
    cpf: '52998224725',
    cns: '898001234567891',
    municipio: 'Porto Alegre',
    procedimento: 'Colecistectomia videolaparoscópica',
    especialidade: 'Cirurgia Geral',
    cid: 'K80.1',
    cidDescricao: 'Calculose da vesícula biliar com colecistite',
    prioridade: 'C',
    dataEntrada: '2026-05-12',
    gravidade: 30,
    risco: 8,
    motivo: 'Colecistite com atendimento no pronto-socorro',
    eventos: [
      { data: '2026-07-21', tipo: 'consulta', descricao: 'Consulta ambulatorial de cirurgia geral. Mantém indicação cirúrgica.' },
      { data: '2026-10-03', tipo: 'pronto-socorro', descricao: 'Pronto-socorro: dor em hipocôndrio direito, febre e vômitos. Colecistite aguda tratada clinicamente.', piora: true },
      { data: '2026-10-04', tipo: 'contato', descricao: 'Contato telefônico da regulação: paciente relata piora da dor e intolerância alimentar.', piora: true },
    ],
    justificativa:
      'Paciente com colelitíase sintomática e episódios recorrentes de cólica biliar. Em 03/10/2026, atendida no pronto-socorro com dor em hipocôndrio direito, febre e vômitos; ultrassonografia sugestiva de colecistite aguda, tratada clinicamente. Relata piora da dor nas últimas semanas, com intolerância alimentar. Indico colecistectomia videolaparoscópica.',
    sinais: [
      sinal('mo-1', 'febre e vômitos', 'Sinal de agudização'),
      sinal('mo-2', 'colecistite aguda', 'Complicação documentada'),
      sinal('mo-3', 'piora da dor nas últimas semanas', 'Piora relatada'),
    ],
    decisoes: [
      inclusao('2026-05-12', 'C', 'Colelitíase sintomática, sem complicações no momento da inclusão.'),
    ],
  }),
  paciente({
    id: 'SOL-098114',
    nome: 'Ana Beatriz Costa',
    sexo: 'F',
    nascimento: '1972-08-02',
    cpf: montarCpf('318204557'),
    municipio: 'Porto Alegre',
    procedimento: 'Mastectomia com linfonodo sentinela',
    especialidade: 'Mastologia',
    cid: 'C50.9',
    cidDescricao: 'Neoplasia maligna da mama',
    prioridade: 'A',
    dataEntrada: antes(96),
    gravidade: 40,
    risco: 7,
    eventos: [
      { data: antes(104), tipo: 'biopsia', descricao: 'Biópsia por agulha grossa: carcinoma ductal invasivo.' },
      { data: antes(51), tipo: 'consulta', descricao: 'Consulta com oncologia clínica. Sem metástases no estadiamento.' },
    ],
    justificativa:
      'Nódulo de 2,8 cm em quadrante superior externo da mama esquerda. Biópsia confirma carcinoma ductal invasivo, receptor hormonal positivo. Sem metástases à distância no estadiamento. Indicada mastectomia com pesquisa de linfonodo sentinela.',
    sinais: [sinal('ab-1', 'carcinoma ductal invasivo', 'Diagnóstico oncológico confirmado')],
  }),
  paciente({
    id: 'SOL-099507',
    nome: 'José Antônio Ribeiro',
    sexo: 'M',
    nascimento: '1959-01-22',
    cpf: montarCpf('402115983'),
    municipio: 'Canoas',
    procedimento: 'Prostatectomia radical',
    especialidade: 'Urologia',
    cid: 'C61',
    cidDescricao: 'Neoplasia maligna da próstata',
    prioridade: 'A',
    dataEntrada: antes(118),
    gravidade: 36,
    risco: 9,
    eventos: [
      { data: antes(135), tipo: 'biopsia', descricao: 'Biópsia de próstata: adenocarcinoma, Gleason 7 (4+3).' },
      { data: '2026-10-08', tipo: 'exame', descricao: 'PSA subiu de 9,8 para 14,2 ng/mL.', piora: true },
    ],
    justificativa:
      'Adenocarcinoma de próstata Gleason 7 (4+3), PSA 9,8 ng/mL ao diagnóstico. Doença localizada à ressonância magnética. Indicada prostatectomia radical.',
    sinais: [sinal('ja-1', 'Gleason 7 (4+3)', 'Doença de risco intermediário')],
  }),
  paciente({
    id: 'SOL-101233',
    nome: 'Lúcia Fernandes',
    sexo: 'F',
    nascimento: '1965-05-30',
    cpf: montarCpf('227390416'),
    municipio: 'Gravataí',
    procedimento: 'Colectomia parcial',
    especialidade: 'Coloproctologia',
    cid: 'C18.7',
    cidDescricao: 'Neoplasia maligna do cólon sigmoide',
    prioridade: 'A',
    dataEntrada: antes(41),
    gravidade: 40,
    risco: 10,
    eventos: [
      { data: antes(52), tipo: 'biopsia', descricao: 'Colonoscopia com biópsia: adenocarcinoma de sigmoide.' },
      { data: '2026-10-11', tipo: 'pronto-socorro', descricao: 'Pronto-socorro por sangramento retal. Liberada após observação.', piora: true },
    ],
    justificativa:
      'Lesão vegetante em sigmoide a 25 cm da borda anal, biópsia com adenocarcinoma moderadamente diferenciado. Episódios de sangramento retal e alteração do hábito intestinal. Indicada colectomia parcial.',
    sinais: [sinal('lf-1', 'sangramento retal', 'Sangramento ativo')],
  }),
  paciente({
    id: 'SOL-102871',
    nome: 'Beatriz Nunes',
    sexo: 'F',
    nascimento: '1960-11-09',
    cpf: montarCpf('150664729'),
    municipio: 'Alvorada',
    procedimento: 'Gastrectomia subtotal',
    especialidade: 'Cirurgia Geral',
    cid: 'C16.9',
    cidDescricao: 'Neoplasia maligna do estômago',
    prioridade: 'A',
    dataEntrada: antes(33),
    gravidade: 40,
    risco: 12,
    eventos: [
      { data: antes(43), tipo: 'biopsia', descricao: 'Endoscopia com biópsia: adenocarcinoma gástrico.' },
      { data: '2026-10-14', tipo: 'internacao', descricao: 'Internação por anemia (Hb 7,1 g/dL), com transfusão.', piora: true },
    ],
    justificativa:
      'Adenocarcinoma gástrico em antro, sem doença à distância. Perda de 8 kg em três meses e anemia ferropriva. Indicada gastrectomia subtotal.',
    sinais: [
      sinal('bn-1', 'Perda de 8 kg em três meses', 'Perda de peso relevante'),
      sinal('bn-2', 'anemia ferropriva', 'Anemia'),
    ],
  }),
  paciente({
    id: 'SOL-100946',
    nome: 'Raimundo Nonato Lima',
    sexo: 'M',
    nascimento: '1954-02-17',
    cpf: montarCpf('284903371'),
    municipio: 'Viamão',
    procedimento: 'Revascularização do miocárdio',
    especialidade: 'Cirurgia Cardiovascular',
    cid: 'I25.1',
    cidDescricao: 'Doença aterosclerótica do coração',
    prioridade: 'A',
    dataEntrada: antes(58),
    gravidade: 34,
    risco: 15,
    motivo: 'Angina com dois atendimentos no pronto-socorro',
    eventos: [
      { data: '2026-09-29', tipo: 'pronto-socorro', descricao: 'Pronto-socorro por dor torácica aos pequenos esforços.', piora: true },
      { data: '2026-10-17', tipo: 'pronto-socorro', descricao: 'Novo atendimento por angina. Troponina negativa.', piora: true },
    ],
    justificativa:
      'Doença triarterial com lesão de 80% em tronco de coronária esquerda. Angina aos pequenos esforços, apesar de tratamento clínico otimizado. Indicada revascularização do miocárdio.',
    sinais: [
      sinal('rn-1', 'lesão de 80% em tronco de coronária esquerda', 'Anatomia de alto risco'),
      sinal('rn-2', 'Angina aos pequenos esforços', 'Sintoma limitante'),
    ],
    decisoes: [inclusao(antes(58), 'A', 'Doença coronariana de alto risco anatômico.', PROFISSIONAIS[1])],
  }),
  paciente({
    id: 'SOL-097652',
    nome: 'Joana Cardoso',
    sexo: 'F',
    nascimento: '1963-06-25',
    cpf: montarCpf('361728804'),
    municipio: 'Cachoeirinha',
    procedimento: 'Nefrectomia parcial',
    especialidade: 'Urologia',
    cid: 'C64',
    cidDescricao: 'Neoplasia maligna do rim',
    prioridade: 'B',
    dataEntrada: antes(140),
    gravidade: 34,
    risco: 8,
    eventos: [
      { data: '2026-10-09', tipo: 'exame', descricao: 'Tomografia de controle: lesão renal passou de 3,1 para 4,2 cm.', piora: true },
    ],
    justificativa:
      'Massa renal sólida à direita, de 3,1 cm, com realce ao contraste, compatível com carcinoma de células renais. Função renal preservada. Indicada nefrectomia parcial.',
    sinais: [sinal('jc-1', 'compatível com carcinoma de células renais', 'Suspeita oncológica')],
  }),
  paciente({
    id: 'SOL-103415',
    nome: 'Paulo Henrique Souza',
    sexo: 'M',
    nascimento: '1968-09-12',
    cpf: montarCpf('472019388'),
    municipio: 'Porto Alegre',
    procedimento: 'Tireoidectomia total',
    especialidade: 'Cabeça e Pescoço',
    cid: 'C73',
    cidDescricao: 'Neoplasia maligna da glândula tireoide',
    prioridade: 'B',
    dataEntrada: antes(74),
    gravidade: 28,
    risco: 5,
    justificativa:
      'Carcinoma papilífero de tireoide, nódulo de 1,6 cm, sem linfonodos suspeitos à ultrassonografia. Indicada tireoidectomia total.',
    sinais: [sinal('ph-1', 'Carcinoma papilífero', 'Diagnóstico oncológico confirmado')],
  }),
  paciente({
    id: 'SOL-099980',
    nome: 'Tereza Lopes',
    sexo: 'F',
    nascimento: '1965-04-03',
    cpf: montarCpf('509337162'),
    municipio: 'Esteio',
    procedimento: 'Tireoidectomia parcial',
    especialidade: 'Cabeça e Pescoço',
    cid: 'E04.1',
    cidDescricao: 'Nódulo tireoidiano solitário não tóxico',
    prioridade: 'C',
    dataEntrada: antes(150),
    gravidade: 18,
    risco: 5,
    motivo: 'Punção com resultado suspeito (Bethesda IV)',
    eventos: [
      { data: '2026-10-12', tipo: 'exame', descricao: 'Punção aspirativa: Bethesda IV, neoplasia folicular suspeita.', piora: true },
    ],
    justificativa:
      'Nódulo tireoidiano de 2,4 cm em lobo direito, com crescimento progressivo e queixa de disfagia leve. Indicada tireoidectomia parcial.',
    sinais: [
      sinal('tl-1', 'crescimento progressivo', 'Evolução da lesão'),
      sinal('tl-2', 'disfagia leve', 'Sintoma compressivo'),
    ],
  }),
  paciente({
    id: 'SOL-102204',
    nome: 'Carla Mendonça',
    sexo: 'F',
    nascimento: '1980-01-19',
    cpf: montarCpf('613840295'),
    municipio: 'Sapucaia do Sul',
    procedimento: 'Histerectomia',
    especialidade: 'Ginecologia',
    cid: 'D25.9',
    cidDescricao: 'Leiomioma do útero',
    prioridade: 'B',
    dataEntrada: antes(88),
    gravidade: 24,
    risco: 6,
    motivo: 'Sangramento uterino com anemia (Hb 8,4 g/dL)',
    eventos: [{ data: '2026-09-30', tipo: 'exame', descricao: 'Hemoglobina 8,4 g/dL.', piora: true }],
    justificativa:
      'Miomatose uterina com sangramento uterino aumentado e anemia sintomática, sem resposta ao tratamento hormonal. Indicada histerectomia.',
    sinais: [sinal('cm-1', 'anemia sintomática', 'Anemia')],
  }),
  paciente({
    id: 'SOL-096318',
    nome: 'Miguel Freitas',
    sexo: 'M',
    nascimento: '1968-07-07',
    cpf: montarCpf('720448516'),
    municipio: 'Canoas',
    procedimento: 'Herniorrafia inguinal',
    especialidade: 'Cirurgia Geral',
    cid: 'K40.9',
    cidDescricao: 'Hérnia inguinal unilateral',
    prioridade: 'C',
    dataEntrada: antes(210),
    gravidade: 16,
    risco: 6,
    motivo: 'Encarceramento reduzido no pronto-socorro',
    eventos: [
      { data: '2026-10-07', tipo: 'pronto-socorro', descricao: 'Pronto-socorro: hérnia encarcerada, reduzida manualmente.', piora: true },
    ],
    justificativa:
      'Hérnia inguinal direita volumosa, com dor ao esforço e episódio de encarceramento reduzido em pronto-socorro. Indicada herniorrafia com tela.',
    sinais: [sinal('mf-1', 'episódio de encarceramento', 'Risco de estrangulamento')],
  }),
  paciente({
    id: 'SOL-094275',
    nome: 'Rosa Carvalho',
    sexo: 'F',
    nascimento: '1955-03-28',
    cpf: montarCpf('835102647'),
    municipio: 'Novo Hamburgo',
    procedimento: 'Artroplastia total de joelho',
    especialidade: 'Ortopedia',
    cid: 'M17.1',
    cidDescricao: 'Gonartrose primária',
    prioridade: 'C',
    dataEntrada: antes(320),
    gravidade: 14,
    risco: 9,
    motivo: 'Queda recente e perda de marcha independente',
    eventos: [
      { data: '2026-10-02', tipo: 'pronto-socorro', descricao: 'Pronto-socorro após queda em domicílio. Sem fraturas.', piora: true },
      { data: '2026-10-10', tipo: 'contato', descricao: 'Contato telefônico: passou a usar cadeira de rodas fora de casa.', piora: true },
    ],
    justificativa:
      'Gonartrose avançada à direita, dor intensa (EVA 8) e limitação para caminhar mais de 100 metros. Falha de tratamento conservador. Indicada artroplastia total de joelho.',
    sinais: [sinal('rc-1', 'limitação para caminhar mais de 100 metros', 'Limitação funcional')],
  }),
  paciente({
    id: 'SOL-101760',
    nome: 'Daniel Moreira',
    sexo: 'M',
    nascimento: '1987-10-15',
    cpf: montarCpf('946211730'),
    municipio: 'Porto Alegre',
    procedimento: 'Septoplastia',
    especialidade: 'Otorrinolaringologia',
    cid: 'J34.2',
    cidDescricao: 'Desvio do septo nasal',
    prioridade: 'B',
    dataEntrada: antes(95),
    gravidade: 8,
    risco: 2,
    motivo: 'Epistaxe de repetição',
    eventos: [
      { data: '2026-10-13', tipo: 'contato', descricao: 'Contato telefônico: melhora após tratamento clínico, sem novos sangramentos.' },
    ],
    justificativa:
      'Desvio septal com obstrução nasal e epistaxe de repetição, três episódios no último mês. Indicada septoplastia.',
    sinais: [sinal('dm-1', 'epistaxe de repetição', 'Sangramento recorrente')],
    decisoes: [inclusao(antes(95), 'B', 'Epistaxe de repetição na época da inclusão.', PROFISSIONAIS[2])],
  }),
  paciente({
    id: 'SOL-093841',
    nome: 'Ivone Batista',
    sexo: 'F',
    nascimento: '1958-12-01',
    cpf: montarCpf('157936240'),
    municipio: 'São Leopoldo',
    procedimento: 'Colecistectomia videolaparoscópica',
    especialidade: 'Cirurgia Geral',
    cid: 'K80.2',
    cidDescricao: 'Calculose da vesícula biliar sem colecistite',
    prioridade: 'C',
    dataEntrada: antes(280),
    gravidade: 18,
    risco: 12,
    motivo: 'Diabetes descompensado (HbA1c 9,1%)',
    eventos: [{ data: '2026-10-01', tipo: 'exame', descricao: 'HbA1c 9,1% (anterior: 7,8%).', piora: true }],
    justificativa:
      'Colelitíase com cólicas biliares mensais. Diabetes tipo 2 em uso de insulina. Indicada colecistectomia videolaparoscópica.',
    observacao: 'Enfermagem: encaminhar para ajuste glicêmico antes da cirurgia.',
    sinais: [sinal('ib-1', 'Diabetes tipo 2 em uso de insulina', 'Comorbidade relevante')],
  }),
  paciente({
    id: 'SOL-090562',
    nome: 'Helena Martins',
    sexo: 'F',
    nascimento: '1956-05-21',
    municipio: 'Viamão',
    procedimento: 'Artroplastia total de quadril',
    especialidade: 'Ortopedia',
    cid: 'M16.1',
    cidDescricao: 'Coxartrose primária',
    prioridade: 'C',
    dataEntrada: antes(260),
    gravidade: 14,
    risco: 9,
    justificativa: 'Coxartrose à esquerda com dor noturna e uso de bengala. Indicada artroplastia total de quadril.',
  }),
  paciente({
    id: 'SOL-095127',
    nome: 'Antônio Carlos Dias',
    sexo: 'M',
    nascimento: '1979-08-30',
    municipio: 'Gravataí',
    procedimento: 'Artroscopia de joelho',
    especialidade: 'Ortopedia',
    cid: 'M23.2',
    cidDescricao: 'Lesão de menisco',
    prioridade: 'C',
    dataEntrada: antes(140),
    gravidade: 8,
    risco: 3,
    justificativa: 'Lesão de menisco medial com bloqueio articular intermitente. Indicada artroscopia.',
  }),
  paciente({
    id: 'SOL-091934',
    nome: 'Roberto Almeida',
    sexo: 'M',
    nascimento: '1950-04-11',
    municipio: 'Porto Alegre',
    procedimento: 'Facectomia com implante de lente',
    especialidade: 'Oftalmologia',
    cid: 'H25.1',
    cidDescricao: 'Catarata senil nuclear',
    prioridade: 'D',
    dataEntrada: antes(300),
    gravidade: 6,
    risco: 3,
    justificativa: 'Catarata nuclear em olho direito, acuidade visual 20/80. Indicada facectomia.',
  }),
  paciente({
    id: 'SOL-088410',
    nome: 'Sebastião Pereira',
    sexo: 'M',
    nascimento: '1971-02-05',
    municipio: 'Alvorada',
    procedimento: 'Tratamento cirúrgico de varizes',
    especialidade: 'Cirurgia Vascular',
    cid: 'I83.9',
    cidDescricao: 'Varizes dos membros inferiores sem úlcera ou inflamação',
    prioridade: 'D',
    dataEntrada: antes(410),
    gravidade: 4,
    risco: 4,
    justificativa: 'Varizes em membro inferior esquerdo, sem úlcera, com sensação de peso ao fim do dia. Indicado tratamento cirúrgico.',
  }),
  paciente({
    id: 'SOL-097003',
    nome: 'Fernanda Rocha',
    sexo: 'F',
    nascimento: '1992-06-18',
    municipio: 'Canoas',
    procedimento: 'Herniorrafia umbilical',
    especialidade: 'Cirurgia Geral',
    cid: 'K42.9',
    cidDescricao: 'Hérnia umbilical sem obstrução ou gangrena',
    prioridade: 'D',
    dataEntrada: antes(230),
    gravidade: 5,
    risco: 2,
    motivo: 'Hérnia sem sintomas',
    justificativa: 'Hérnia umbilical de 1,5 cm, assintomática, redutível. Indicada correção eletiva.',
  }),
  paciente({
    id: 'SOL-098866',
    nome: 'Marcos Vinícius Teixeira',
    sexo: 'M',
    nascimento: '1997-01-26',
    municipio: 'Esteio',
    procedimento: 'Amigdalectomia',
    especialidade: 'Otorrinolaringologia',
    cid: 'J35.0',
    cidDescricao: 'Amigdalite crônica',
    prioridade: 'D',
    dataEntrada: antes(190),
    gravidade: 5,
    risco: 1,
    justificativa: 'Amigdalites de repetição, quatro episódios no último ano. Indicada amigdalectomia.',
  }),
]

/* ------------------------------------------------------------------ */
/* Restante da fila                                                    */
/* ------------------------------------------------------------------ */

function gerador(semente: number) {
  let s = semente
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Modelo {
  procedimento: string
  especialidade: string
  cids: [string, string][]
  gravidade: [number, number]
  peso: number
  sexo?: 'F' | 'M'
  texto: string
}

const MODELOS: Modelo[] = [
  { procedimento: 'Colecistectomia videolaparoscópica', especialidade: 'Cirurgia Geral', cids: [['K80.2', 'Calculose da vesícula biliar sem colecistite']], gravidade: [10, 22], peso: 14, texto: 'Colelitíase sintomática com cólicas biliares. Indicada colecistectomia.' },
  { procedimento: 'Herniorrafia inguinal', especialidade: 'Cirurgia Geral', cids: [['K40.9', 'Hérnia inguinal unilateral']], gravidade: [6, 16], peso: 12, texto: 'Hérnia inguinal redutível com desconforto aos esforços. Indicada herniorrafia.' },
  { procedimento: 'Herniorrafia umbilical', especialidade: 'Cirurgia Geral', cids: [['K42.9', 'Hérnia umbilical sem obstrução ou gangrena']], gravidade: [4, 12], peso: 6, texto: 'Hérnia umbilical redutível. Indicada correção eletiva.' },
  { procedimento: 'Facectomia com implante de lente', especialidade: 'Oftalmologia', cids: [['H25.1', 'Catarata senil nuclear'], ['H25.9', 'Catarata senil']], gravidade: [4, 10], peso: 14, texto: 'Catarata com baixa de acuidade visual progressiva. Indicada facectomia.' },
  { procedimento: 'Tratamento cirúrgico de varizes', especialidade: 'Cirurgia Vascular', cids: [['I83.9', 'Varizes dos membros inferiores sem úlcera ou inflamação']], gravidade: [3, 10], peso: 9, texto: 'Varizes de membros inferiores sem úlcera. Indicado tratamento cirúrgico.' },
  { procedimento: 'Artroplastia total de joelho', especialidade: 'Ortopedia', cids: [['M17.1', 'Gonartrose primária']], gravidade: [10, 20], peso: 8, texto: 'Gonartrose com dor e limitação para a marcha. Indicada artroplastia.' },
  { procedimento: 'Artroplastia total de quadril', especialidade: 'Ortopedia', cids: [['M16.1', 'Coxartrose primária']], gravidade: [10, 22], peso: 5, texto: 'Coxartrose com dor e limitação funcional. Indicada artroplastia.' },
  { procedimento: 'Artroscopia de joelho', especialidade: 'Ortopedia', cids: [['M23.2', 'Lesão de menisco']], gravidade: [6, 12], peso: 5, texto: 'Lesão meniscal com dor e bloqueio intermitente. Indicada artroscopia.' },
  { procedimento: 'Histerectomia', especialidade: 'Ginecologia', cids: [['D25.9', 'Leiomioma do útero']], gravidade: [10, 22], peso: 6, sexo: 'F', texto: 'Miomatose uterina com sangramento aumentado. Indicada histerectomia.' },
  { procedimento: 'Ressecção transuretral de próstata', especialidade: 'Urologia', cids: [['N40', 'Hiperplasia da próstata']], gravidade: [8, 18], peso: 6, sexo: 'M', texto: 'Hiperplasia prostática com sintomas urinários obstrutivos. Indicada ressecção transuretral.' },
  { procedimento: 'Hemorroidectomia', especialidade: 'Coloproctologia', cids: [['K64.9', 'Hemorroidas']], gravidade: [4, 12], peso: 4, texto: 'Doença hemorroidária com sangramento eventual. Indicada hemorroidectomia.' },
  { procedimento: 'Septoplastia', especialidade: 'Otorrinolaringologia', cids: [['J34.2', 'Desvio do septo nasal']], gravidade: [3, 8], peso: 3, texto: 'Desvio septal com obstrução nasal. Indicada septoplastia.' },
  { procedimento: 'Amigdalectomia', especialidade: 'Otorrinolaringologia', cids: [['J35.0', 'Amigdalite crônica']], gravidade: [3, 8], peso: 2, texto: 'Amigdalites de repetição. Indicada amigdalectomia.' },
  { procedimento: 'Tireoidectomia parcial', especialidade: 'Cabeça e Pescoço', cids: [['E04.1', 'Nódulo tireoidiano solitário não tóxico']], gravidade: [8, 18], peso: 3, texto: 'Nódulo tireoidiano com indicação cirúrgica. Indicada tireoidectomia parcial.' },
]

const ONCOLOGICOS: Modelo[] = [
  { procedimento: 'Mastectomia com linfonodo sentinela', especialidade: 'Mastologia', cids: [['C50.9', 'Neoplasia maligna da mama']], gravidade: [30, 40], peso: 3, sexo: 'F', texto: 'Carcinoma de mama confirmado por biópsia. Indicada mastectomia.' },
  { procedimento: 'Prostatectomia radical', especialidade: 'Urologia', cids: [['C61', 'Neoplasia maligna da próstata']], gravidade: [26, 36], peso: 3, sexo: 'M', texto: 'Adenocarcinoma de próstata localizado. Indicada prostatectomia radical.' },
  { procedimento: 'Colectomia parcial', especialidade: 'Coloproctologia', cids: [['C18.9', 'Neoplasia maligna do cólon']], gravidade: [32, 40], peso: 2, texto: 'Adenocarcinoma de cólon confirmado por colonoscopia. Indicada colectomia.' },
  { procedimento: 'Tireoidectomia total', especialidade: 'Cabeça e Pescoço', cids: [['C73', 'Neoplasia maligna da glândula tireoide']], gravidade: [24, 32], peso: 2, texto: 'Carcinoma de tireoide confirmado por punção. Indicada tireoidectomia total.' },
  { procedimento: 'Nefrectomia parcial', especialidade: 'Urologia', cids: [['C64', 'Neoplasia maligna do rim']], gravidade: [28, 36], peso: 1, texto: 'Massa renal compatível com carcinoma. Indicada nefrectomia parcial.' },
]

const NOMES_F = ['Adriana', 'Aline', 'Aparecida', 'Bruna', 'Camila', 'Cláudia', 'Cristina', 'Daniela', 'Denise', 'Eliane', 'Fátima', 'Gabriela', 'Gisele', 'Jaqueline', 'Juliana', 'Larissa', 'Luana', 'Luciana', 'Márcia', 'Marlene', 'Neusa', 'Patrícia', 'Regina', 'Rita', 'Sandra', 'Simone', 'Sônia', 'Tânia', 'Vera', 'Vanessa']
const NOMES_M = ['Alexandre', 'André', 'Antônio', 'Carlos', 'César', 'Claudio', 'Diego', 'Edson', 'Fábio', 'Felipe', 'Francisco', 'Gilberto', 'Gustavo', 'Jorge', 'Leandro', 'Luiz', 'Marcelo', 'Mário', 'Nelson', 'Osvaldo', 'Paulo', 'Rafael', 'Renato', 'Ricardo', 'Rodrigo', 'Sérgio', 'Valdir', 'Vinícius', 'Wagner', 'Wilson']
const SOBRENOMES = ['Silva', 'Santos', 'Souza', 'Pereira', 'Lima', 'Ferreira', 'Rodrigues', 'Alves', 'Gomes', 'Ribeiro', 'Martins', 'Carvalho', 'Rocha', 'Barbosa', 'Moraes', 'Machado', 'Cardoso', 'Teixeira', 'Correia', 'Vieira', 'Schmidt', 'Becker', 'Fagundes', 'Brum', 'Quadros', 'Bittencourt', 'Pires', 'Nunes', 'Dutra', 'Medeiros']
const MUNICIPIOS = ['Porto Alegre', 'Porto Alegre', 'Porto Alegre', 'Canoas', 'Gravataí', 'Viamão', 'Alvorada', 'Cachoeirinha', 'Esteio', 'Sapucaia do Sul', 'Novo Hamburgo', 'São Leopoldo', 'Guaíba', 'Eldorado do Sul']

const TOTAL_FILA = 895

function gerarFila(quantidade: number): Paciente[] {
  const r = gerador(2310)
  const entre = (a: number, b: number) => a + Math.floor(r() * (b - a + 1))
  const um = <T,>(lista: T[]) => lista[Math.floor(r() * lista.length)]
  const ponderado = (lista: Modelo[]) => {
    const total = lista.reduce((s, m) => s + m.peso, 0)
    let alvo = r() * total
    return lista.find((m) => (alvo -= m.peso) < 0) ?? lista[0]
  }

  return Array.from({ length: quantidade }, (_, i) => {
    const onco = r() < 0.035
    const m = ponderado(onco ? ONCOLOGICOS : MODELOS)
    const [cid, cidDescricao] = um(m.cids)
    const sexo = m.sexo ?? (r() < 0.55 ? 'F' : 'M')
    const nome = `${um(sexo === 'F' ? NOMES_F : NOMES_M)} ${um(SOBRENOMES)} ${um(SOBRENOMES)}`
    const gravidade = entre(...m.gravidade)
    const dias = onco ? entre(5, 70) : Math.floor(Math.pow(r(), 1.7) * 600) + 6

    let prioridade: Prioridade
    if (onco) prioridade = r() < 0.6 ? 'A' : 'B'
    else if (gravidade >= 18) prioridade = r() < 0.35 ? 'B' : 'C'
    else if (gravidade >= 10) prioridade = r() < 0.7 ? 'C' : 'D'
    else prioridade = r() < 0.25 ? 'C' : 'D'

    const dataEntrada = antes(dias)
    const eventos: EventoClinico[] = []
    const x = r()
    if (x < 0.07) eventos.push({ data: antes(entre(2, 28)), tipo: 'pronto-socorro', descricao: 'Atendimento no pronto-socorro relacionado à condição de base.', piora: true })
    else if (x < 0.12) eventos.push({ data: antes(entre(2, 28)), tipo: 'contato', descricao: 'Contato telefônico: relata piora dos sintomas.', piora: true })
    if (r() < 0.2 && dias > 60) eventos.push({ data: antes(entre(31, dias - 1)), tipo: 'contato', descricao: 'Contato telefônico: dados cadastrais confirmados.' })
    if (r() < 0.04 && dias > 40) eventos.push({ data: antes(entre(31, dias - 1)), tipo: 'falta', descricao: 'Não compareceu à consulta de reavaliação.' })

    return paciente({
      id: `SOL-${110000 + i * 13}`,
      nome,
      sexo,
      idade: entre(onco ? 42 : 24, 84),
      municipio: um(MUNICIPIOS),
      procedimento: m.procedimento,
      especialidade: m.especialidade,
      cid,
      cidDescricao,
      prioridade,
      dataEntrada,
      gravidade,
      risco: entre(1, 12),
      eventos,
      justificativa: m.texto,
      decisoes: [inclusao(dataEntrada, prioridade, 'Classificação inicial na inclusão da solicitação.', um(PROFISSIONAIS))],
    })
  })
}

export function filaInicial(): Paciente[] {
  return [...acompanhados, ...gerarFila(TOTAL_FILA - acompanhados.length)]
}
