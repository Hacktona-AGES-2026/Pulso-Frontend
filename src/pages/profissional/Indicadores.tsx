import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '../../components/ui'
import { PENDENCIAS } from '../../data/pendencias'
import { usePulso } from '../../store/PulsoStore'

export function Indicadores() {
  const { fila, pendentes } = usePulso()
  const estourado = useMemo(() => fila.filter((l) => l.fatores.percentualPrazo > 1).length, [fila])

  const itens = [
    { valor: fila.length, rotulo: 'ativas', link: '/profissional/fila', tom: 'text-petroleo' },
    { valor: estourado, rotulo: 'prazo estourado', link: '/profissional/fila?ordem=dias&dir=desc', tom: 'text-g1' },
    { valor: pendentes.length, rotulo: 'revisão humana', link: '/profissional/revisao', tom: 'text-g3' },
    { valor: PENDENCIAS.length, rotulo: 'pendências', link: '/profissional/pendencias', tom: 'text-g6' },
  ]

  return (
    <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-linha bg-linha sm:grid-cols-4">
      {itens.map((i) => (
        <Link key={i.rotulo} to={i.link} className="bg-white px-5 py-4 transition-colors hover:bg-nevoa-50 sm:px-6">
          <p className={cx('tabular font-titulo text-[2.2rem] font-semibold leading-none', i.tom)}>{i.valor}</p>
          <p className="mt-1.5 text-[13px] text-tinta-soft">{i.rotulo}</p>
        </Link>
      ))}
    </div>
  )
}
