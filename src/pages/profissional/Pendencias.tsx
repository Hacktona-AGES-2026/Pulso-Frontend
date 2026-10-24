import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarX, Files, FlaskConical, LogOut, PhoneOff, type LucideIcon } from 'lucide-react'
import { api } from '../../api/cliente'
import { ROTULO_PENDENCIA } from '../../api/rotulos'
import { useApi } from '../../api/useApi'
import { Paginacao } from '../../components/Paginacao'
import { Carregando, FalhaApi, SeloFila } from '../../components/ui'

const POR_PAGINA = 25

const ICONE: Record<string, LucideIcon> = {
  sem_contato: PhoneOff,
  nao_atendeu_2x: PhoneOff,
  faltas_2x: CalendarX,
  hba1c_alta: FlaskConical,
  duplicata_fundida: Files,
  irma_com_evento: Files,
  confirmar_saida: LogOut,
}

export function Pendencias() {
  const { dados, erro, recarregar } = useApi(api.pendencias)
  // Uma linha por pendência, na ordem da fila
  const linhas = useMemo(
    () => (dados ?? []).flatMap((p) => p.pendencias.map((tipo) => ({ ...p, tipo }))),
    [dados],
  )
  const [pagina, setPagina] = useState(1)
  const visiveis = linhas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  function irPara(n: number) {
    setPagina(n)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[2.5rem]">Pendências operacionais</h1>
        {dados && <p className="tabular text-sm text-tinta-soft">{linhas.length} pendências · {dados.length} pacientes</p>}
      </header>

      {erro ? (
        <FalhaApi erro={erro} aoTentar={recarregar} />
      ) : !dados ? (
        <Carregando />
      ) : (
        <ul className="mt-6 divide-y divide-linha overflow-hidden rounded-xl border border-linha bg-white">
          <li
            className="hidden grid-cols-[14rem_minmax(0,1fr)_5rem_4rem] gap-4 bg-nevoa-50/70 px-5 py-3 text-[13px] text-tinta-soft md:grid"
            aria-hidden="true"
          >
            <span>Pendência</span>
            <span>Paciente</span>
            <span className="text-right">Posição</span>
            <span className="text-right">Nível</span>
          </li>
          {visiveis.map((p) => {
            const Icone = ICONE[p.tipo] ?? PhoneOff
            return (
              <li key={p.solicitacao_id + p.tipo}>
                <Link
                  to={`/profissional/pacientes/${p.solicitacao_id}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-areia md:grid-cols-[14rem_minmax(0,1fr)_5rem_4rem] md:items-center"
                >
                  <span className="flex items-center gap-2.5 text-sm font-semibold">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-g6-50 text-g6">
                      <Icone size={15} />
                    </span>
                    {ROTULO_PENDENCIA[p.tipo] ?? p.tipo}
                  </span>
                  <span className="col-start-1 md:col-start-auto">
                    <span className="block text-sm font-semibold">{p.paciente_nome}</span>
                    <span className="tabular block text-xs text-tinta-soft">{p.solicitacao_id}</span>
                  </span>
                  <span className="tabular hidden text-right text-sm md:block">{p.posicao}</span>
                  <span className="col-start-2 row-start-1 text-right md:col-start-auto md:row-start-auto">
                    <SeloFila f={p.fila} compacto />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      {dados && (
        <Paginacao className="mt-4" atual={pagina} porPagina={POR_PAGINA} totalItens={linhas.length} aoMudar={irPara} />
      )}
    </div>
  )
}
