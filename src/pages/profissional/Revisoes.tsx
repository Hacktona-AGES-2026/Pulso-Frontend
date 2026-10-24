import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCheck } from 'lucide-react'
import { ModalDecisao } from '../../components/modais'
import { Botao, SeloPrioridade, useAviso } from '../../components/ui'
import type { Revisao } from '../../data/types'
import { formatarData } from '../../lib/datas'
import { ORDEM } from '../../lib/prioridade'
import { usePulso } from '../../store/PulsoStore'

export function Revisoes() {
  const { pendentes, revisoes, linha } = usePulso()
  const avisar = useAviso()
  const [aberta, setAberta] = useState<{ revisao: Revisao; decisao: 'confirmar' | 'manter' } | null>(null)
  const [ultima, setUltima] = useState<{ pacienteId: string; antes: number; decisao: 'confirmar' | 'manter' } | null>(null)

  // Depois que a fila é recalculada, informa a nova posição do paciente.
  useEffect(() => {
    if (!ultima) return
    const l = linha(ultima.pacienteId)
    if (!l) return
    avisar(
      'Decisão registrada',
      ultima.decisao === 'confirmar' && l.posicao !== ultima.antes
        ? `${l.paciente.nome}: posição ${ultima.antes} → ${l.posicao}.`
        : `${l.paciente.nome}: prioridade ${l.paciente.prioridade} mantida.`,
    )
    setUltima(null)
  }, [ultima, linha, avisar])

  const decididas = revisoes.filter((r) => r.status !== 'pendente')

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="text-[2.5rem]">Revisões pendentes</h1>
      <p className="mt-1 max-w-2xl text-sm text-tinta-soft">
        Propostas de mudança de prioridade geradas a partir de eventos clínicos. O sistema sugere; a decisão é sua.
      </p>

      {pendentes.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-linha bg-white px-6 py-14 text-center">
          <CheckCheck size={26} className="mx-auto text-oceano" />
          <p className="mt-3 font-serif text-2xl text-petroleo">Nenhuma revisão pendente</p>
          <p className="mt-1 text-sm text-tinta-soft">Novas propostas aparecem aqui quando um evento clínico indicar mudança.</p>
        </div>
      ) : (
        <ul className="mt-7 grid gap-5 xl:grid-cols-2">
          {pendentes.map((r) => {
            const l = linha(r.pacienteId)
            if (!l) return null
            const sobe = ORDEM.indexOf(r.para) < ORDEM.indexOf(r.de)
            return (
              <li key={r.id} className="anim-subir flex flex-col rounded-xl border border-linha bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/profissional/pacientes/${r.pacienteId}`}
                      className="font-serif text-[1.65rem] font-semibold leading-tight text-petroleo hover:underline"
                    >
                      {l.paciente.nome}
                    </Link>
                    <p className="tabular mt-0.5 text-xs text-tinta-soft">
                      {l.paciente.id} · {l.paciente.procedimento} · {l.paciente.cid}
                    </p>
                  </div>
                  <span className={sobe ? 'text-xs font-semibold text-prioritario' : 'text-xs font-semibold text-tinta-soft'}>
                    {sobe ? 'Proposta de aumento' : 'Proposta de redução'}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <SeloPrioridade p={r.de} /> <span aria-hidden="true">→</span> <SeloPrioridade p={r.para} />
                  <span className="sr-only">
                    Prioridade atual {r.de}, proposta {r.para}
                  </span>
                </div>

                <p className="mt-4 text-[15px]">
                  <span className="font-semibold">Motivo: </span>
                  {r.motivo}
                </p>
                <div className="mt-3 rounded-lg bg-nevoa-50 px-4 py-3">
                  <p className="text-xs font-semibold text-petroleo">Evidências</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {r.evidencias.map((e) => (
                      <li key={e} className="flex gap-2">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-oceano" aria-hidden="true" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="tabular text-xs text-tinta-soft">Proposta em {formatarData(r.data)}</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Botao variante="secundario" onClick={() => setAberta({ revisao: r, decisao: 'manter' })}>
                      Manter prioridade atual
                    </Botao>
                    <Botao onClick={() => setAberta({ revisao: r, decisao: 'confirmar' })}>Confirmar alteração</Botao>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {decididas.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl">Decisões registradas</h2>
          <ul className="mt-3 divide-y divide-linha rounded-xl border border-linha bg-white">
            {decididas.map((r) => {
              const l = linha(r.pacienteId)
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <Link to={`/profissional/pacientes/${r.pacienteId}`} className="font-semibold hover:text-petroleo hover:underline">
                    {l?.paciente.nome}
                  </Link>
                  <span className="text-tinta-soft">
                    {r.status === 'confirmada' ? `Alterada ${r.de} → ${r.para}` : `Mantida em ${r.de}`}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <ModalDecisao
        revisao={aberta?.revisao ?? null}
        paciente={aberta ? linha(aberta.revisao.pacienteId)?.paciente : undefined}
        decisao={aberta?.decisao ?? 'confirmar'}
        aoFechar={() => setAberta(null)}
        aoDecidir={(r, decisao) =>
          setUltima({ pacienteId: r.pacienteId, antes: linha(r.pacienteId)?.posicao ?? 0, decisao })
        }
      />
    </div>
  )
}
