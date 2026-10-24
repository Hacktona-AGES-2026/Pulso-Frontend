import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Cartao, SeloFila, TOM_FILA, cx } from '../../components/ui'
import { NOME_FILA, ORDEM_FILAS } from '../../data/fila'
import { formatarData, HOJE } from '../../lib/datas'
import { usePulso } from '../../store/PulsoStore'
import { Indicadores } from './Indicadores'

export function VisaoGeral() {
  const { fila, pendentes, linha } = usePulso()

  const porNivel = useMemo(
    () => ORDEM_FILAS.map((f) => ({ f, n: fila.filter((l) => l.paciente.fila === f).length })),
    [fila],
  )
  const maior = Math.max(...porNivel.map((x) => x.n))
  const altas = pendentes.filter((m) => m.severidade === 'alta')

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <header>
        <p className="tabular text-sm text-tinta-soft">{formatarData(HOJE)}</p>
        <h1 className="text-[2.5rem]">Visão geral</h1>
      </header>

      <Indicadores />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Cartao className="p-6">
          <h2 className="text-2xl">Distribuição por nível</h2>
          <ul className="mt-5 space-y-2.5">
            {porNivel.map(({ f, n }) => (
              <li key={f}>
                <Link
                  to={`/profissional/fila?nivel=${f}`}
                  className="-mx-2 grid grid-cols-[3.25rem_minmax(0,1fr)_2.5rem] items-center gap-3 rounded-md px-2 py-1 hover:bg-areia sm:grid-cols-[3.25rem_12rem_minmax(0,1fr)_2.5rem]"
                >
                  <SeloFila f={f} compacto />
                  <span className="hidden truncate text-sm sm:block">{NOME_FILA[f]}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-nevoa-50" aria-hidden="true">
                    <span className={cx('block h-full rounded-full', TOM_FILA[f].barra)} style={{ width: `${(n / maior) * 100}%` }} />
                  </span>
                  <span className="tabular text-right text-sm font-semibold">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Cartao>

        <Cartao className="p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-2xl">Precisa de olho humano</h2>
            <Link to="/profissional/revisao" className="text-sm font-semibold text-petroleo hover:underline">
              {altas.length} de severidade alta
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-linha">
            {altas.map((m) => {
              const l = linha(m.sid)
              if (!l) return null
              return (
                <li key={m.id}>
                  <Link to={`/profissional/pacientes/${m.sid}`} className="-mx-2 flex items-start gap-3 rounded-md px-2 py-3 hover:bg-areia">
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-g1" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{l.paciente.nome}</span>
                      <span className="block text-[13px] text-tinta-soft">{m.descricao}</span>
                    </span>
                    <SeloFila f={l.paciente.fila} compacto />
                  </Link>
                </li>
              )
            })}
            {altas.length === 0 && <li className="py-6 text-sm text-tinta-soft">Nada pendente.</li>}
          </ul>
        </Cartao>
      </div>
    </div>
  )
}
