import type { FilaCodigo } from '../data/fila'
import { diasEntre } from '../lib/datas'
import { soDigitos } from '../lib/documentos'
import type { LinhaFila } from '../lib/prioridade'

/**
 * Único recorte de dados que sai para a área pública.
 * Nada de posição, pontuação, justificativa clínica ou dados de terceiros.
 */
export interface EncaminhamentoPublico {
  nome: string
  procedimento: string
  especialidade: string
  dataEncaminhamento: string
  diasEspera: number
  ultimaAtualizacao: string
  fila: FilaCodigo
  revisao?: { data: string; motivo: string }
}

export function consultarEncaminhamento(
  fila: LinhaFila[],
  documento: string,
  nascimento: string,
): Promise<EncaminhamentoPublico | null> {
  const doc = soDigitos(documento)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!navigator.onLine) return reject(new Error('sem conexão'))
      const p = fila
        .map((l) => l.paciente)
        .find((p) => (p.cpf === doc || p.cns === doc) && p.nascimento === nascimento)
      if (!p) return resolve(null)

      const revisao = [...p.decisoes]
        .reverse()
        .find((d) => d.tipo !== 'inclusao' && d.de !== d.para && d.motivoPublico)
      const datas = [...p.eventos.map((e) => e.data), ...p.decisoes.map((d) => d.data.slice(0, 10))].sort()
      resolve({
        nome: p.nome,
        procedimento: p.procedimento,
        especialidade: p.especialidade,
        dataEncaminhamento: p.dataEntrada,
        diasEspera: diasEntre(p.dataEntrada),
        ultimaAtualizacao: datas[datas.length - 1],
        fila: p.fila,
        revisao: revisao && { data: revisao.data, motivo: revisao.motivoPublico! },
      })
    }, 900)
  })
}
