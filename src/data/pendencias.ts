import type { Pendencia } from './types'

export const PENDENCIAS: Pendencia[] = [
  { sid: 'SOL-2022-00005', tipo: 'sem_contato', rotulo: 'Sem contato', detalhe: 'Observação: número não existe' },
  { sid: 'SOL-2022-00005', tipo: 'nao_atendeu_2x', rotulo: 'Não atendeu 2×', detalhe: '2 tentativas de contato sem sucesso' },
  { sid: 'SOL-2022-00012', tipo: 'faltas_2x', rotulo: 'Faltas 2×', detalhe: 'Faltou a 2 consultas/exames' },
  { sid: 'SOL-2024-00071', tipo: 'hba1c_alta', rotulo: 'HbA1c alta', detalhe: 'Última HbA1c 9,2% (> 8,5%)' },
  { sid: 'SOL-2025-00190', tipo: 'hba1c_alta', rotulo: 'HbA1c alta', detalhe: 'Última HbA1c 9,1% (> 8,5%)' },
  { sid: 'SOL-2022-00002', tipo: 'duplicata_fundida', rotulo: 'Duplicata fundida', detalhe: 'Mestre de 1 solicitação duplicada' },
  { sid: 'SOL-2022-00008', tipo: 'confirmar_saida', rotulo: 'Confirmar saída', detalhe: '“Não deseja mais operar no momento”' },
  { sid: 'SOL-2023-00088', tipo: 'irma_com_evento', rotulo: 'Irmã com evento', detalhe: 'Outra solicitação do paciente teve internação' },
]
