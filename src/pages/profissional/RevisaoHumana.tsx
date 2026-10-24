import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCheck } from 'lucide-react'
import { ModalDecisao, rotulosDecisao } from '../../components/modais'
import { Botao, ROTULO_SEVERIDADE, SeloFila, SeloSeveridade, cx, useAviso } from '../../components/ui'
import { rotuloMarcacao } from '../../data/revisao'
import type { Marcacao, Severidade } from '../../data/types'
import { formatarData } from '../../lib/datas'
import { usePulso } from '../../store/PulsoStore'

const FILTROS: ('todas' | Severidade)[] = ['todas', 'alta', 'media', 'baixa', 'informativa']

const BORDA: Record<Severidade, string> = {
  alta: 'border-t-g1',
  media: 'border-t-g3',
  baixa: 'border-t-g6',
  informativa: 'border-t-linha',
}

export function RevisaoHumana() {
  const { pendentes, marcacoes, linha } = usePulso()
  const avisar = useAviso()
  const [filtro, setFiltro] = useState<'todas' | Severidade>('todas')
  const [aberta, setAberta] = useState<{ marcacao: Marcacao; decisao: 'confirmar' | 'manter' } | null>(null)
  const [ultima, setUltima] = useState<{ sid: string; antes: number; mudou: boolean } | null>(null)

  // Depois que a fila é recalculada, informa a nova posição do paciente.
  useEffect(() => {
    if (!ultima) return
    const l = linha(ultima.sid)
    if (!l) return
    avisar(
      'Decisão registrada',
      ultima.mudou && l.posicao !== ultima.antes ? `${l.paciente.nome}: posição ${ultima.antes} → ${l.posicao}.` : l.paciente.nome,
    )
    setUltima(null)
  }, [ultima, linha, avisar])

  const visiveis = pendentes.filter((m) => filtro === 'todas' || m.severidade === filtro)
  const decididas = marcacoes.filter((m) => m.status !== 'pendente')

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="text-[2.5rem]">Revisão humana</h1>

      <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por severidade">
        {FILTROS.map((f) => {
          const n = f === 'todas' ? pendentes.length : pendentes.filter((m) => m.severidade === f).length
          return (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              aria-pressed={filtro === f}
              className={cx(
                'tabular inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-colors',
                filtro === f ? 'border-petroleo bg-petroleo text-white' : 'border-linha bg-white hover:border-petroleo/40',
              )}
            >
              {f === 'todas' ? 'Todas' : ROTULO_SEVERIDADE[f]}
              <span className={filtro === f ? 'text-white/70' : 'text-tinta-soft'}>{n}</span>
            </button>
          )
        })}
      </div>

      {visiveis.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-linha bg-white px-6 py-14 text-center">
          <CheckCheck size={26} className="mx-auto text-oceano" />
          <p className="mt-3 font-serif text-2xl text-petroleo">Nada pendente</p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {visiveis.map((m) => {
            const l = linha(m.sid)
            if (!l) return null
            const rotulos = rotulosDecisao(m)
            return (
              <li
                key={m.id}
                className={cx('anim-subir flex flex-col rounded-xl border border-t-4 border-linha bg-white p-5', BORDA[m.severidade])}
              >
                <div className="flex items-start justify-between gap-3">
                  <SeloSeveridade s={m.severidade} />
                  <span className="tabular text-xs text-tinta-soft">{formatarData(m.data)}</span>
                </div>

                <Link
                  to={`/profissional/pacientes/${m.sid}`}
                  className="mt-2 font-serif text-[1.55rem] font-semibold leading-tight text-petroleo hover:underline"
                >
                  {l.paciente.nome}
                </Link>
                <p className="tabular text-xs text-tinta-soft">
                  {m.sid} · {l.paciente.procedimento}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {m.proposta ? (
                    <>
                      <SeloFila f={m.proposta.de} /> <span aria-hidden="true">→</span> <SeloFila f={m.proposta.para} />
                      <span className="sr-only">
                        Nível atual {m.proposta.de}, proposto {m.proposta.para}
                      </span>
                    </>
                  ) : (
                    <SeloFila f={l.paciente.fila} />
                  )}
                </div>

                <p className="mt-3 text-sm font-semibold">{rotuloMarcacao(m.marcacao)}</p>
                <p className="text-sm text-tinta-soft">{m.descricao}</p>

                {m.evidencias && (
                  <ul className="mt-3 space-y-1 rounded-lg bg-nevoa-50 px-3.5 py-2.5 text-[13px]">
                    {m.evidencias.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
                  <Botao variante="secundario" className="min-h-10 px-4" onClick={() => setAberta({ marcacao: m, decisao: 'manter' })}>
                    {rotulos.manter}
                  </Botao>
                  <Botao className="min-h-10 px-4" onClick={() => setAberta({ marcacao: m, decisao: 'confirmar' })}>
                    {rotulos.confirmar}
                  </Botao>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {decididas.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl">Decididas</h2>
          <ul className="mt-3 divide-y divide-linha rounded-xl border border-linha bg-white">
            {decididas.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                <Link to={`/profissional/pacientes/${m.sid}`} className="font-semibold hover:text-petroleo hover:underline">
                  {linha(m.sid)?.paciente.nome}
                </Link>
                <span className="text-tinta-soft">
                  {rotuloMarcacao(m.marcacao)} ·{' '}
                  {m.status === 'confirmada'
                    ? m.proposta
                      ? `${m.proposta.de} → ${m.proposta.para}`
                      : 'resolvida'
                    : m.proposta
                      ? `mantido em ${m.proposta.de}`
                      : 'dispensada'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ModalDecisao
        marcacao={aberta?.marcacao ?? null}
        paciente={aberta ? linha(aberta.marcacao.sid)?.paciente : undefined}
        decisao={aberta?.decisao ?? 'confirmar'}
        aoFechar={() => setAberta(null)}
        aoDecidir={(m, decisao) =>
          setUltima({ sid: m.sid, antes: linha(m.sid)?.posicao ?? 0, mudou: decisao === 'confirmar' && !!m.proposta })
        }
      />
    </div>
  )
}
