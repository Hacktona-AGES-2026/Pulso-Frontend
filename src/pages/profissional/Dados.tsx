import { useState } from 'react'
import { cx } from '../../components/ui'
import { EXECUCOES, FORA_DA_FILA, QUARENTENA, RESUMO_DADOS } from '../../data/dados'

type Aba = 'quarentena' | 'fora' | 'execucoes'
const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'quarentena', rotulo: 'Quarentena' },
  { id: 'fora', rotulo: 'Fora da fila' },
  { id: 'execucoes', rotulo: 'Execuções' },
]

const RESUMO: [keyof typeof RESUMO_DADOS, string][] = [
  ['lidas', 'lidas'],
  ['unicas', 'únicas'],
  ['ativas', 'ativas'],
  ['duplicatas', 'duplicatas'],
  ['saidas', 'saídas'],
  ['quarentena', 'quarentena'],
  ['duplicados', 'duplicados'],
]

export function Dados() {
  const [aba, setAba] = useState<Aba>('quarentena')

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="text-[2.5rem]">Dados</h1>

      <dl className="mt-6 grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-linha bg-linha sm:grid-cols-7">
        {RESUMO.map(([k, rotulo]) => (
          <div key={k} className="flex flex-col-reverse bg-white px-4 py-3.5">
            <dt className="mt-1 text-xs text-tinta-soft">{rotulo}</dt>
            <dd className="tabular font-serif text-[1.8rem] font-semibold leading-none text-petroleo">{RESUMO_DADOS[k]}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex gap-1 border-b border-linha" role="tablist">
        {ABAS.map((a) => (
          <button
            key={a.id}
            role="tab"
            aria-selected={aba === a.id}
            onClick={() => setAba(a.id)}
            className={cx(
              '-mb-px border-b-2 px-3 py-2.5 text-sm font-semibold',
              aba === a.id ? 'border-petroleo text-petroleo' : 'border-transparent text-tinta-soft hover:text-tinta',
            )}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-linha bg-white" role="tabpanel">
        <table className="w-full min-w-[560px] text-sm">
          {aba === 'quarentena' && (
            <>
              <Cabeca colunas={['Evento', 'Motivo', 'Detalhe']} />
              <tbody className="divide-y divide-linha">
                {QUARENTENA.map((q) => (
                  <tr key={q.eventoId}>
                    <td className="tabular px-5 py-3 font-medium">{q.eventoId}</td>
                    <td className="px-5 py-3">
                      <code className="rounded bg-g3-50 px-1.5 py-0.5 text-xs text-g3">{q.motivo}</code>
                    </td>
                    <td className="px-5 py-3 text-tinta-soft">{q.detalhe}</td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
          {aba === 'fora' && (
            <>
              <Cabeca colunas={['Solicitação', 'Situação', 'Evidência']} />
              <tbody className="divide-y divide-linha">
                {FORA_DA_FILA.map((f) => (
                  <tr key={f.sid}>
                    <td className="px-5 py-3">
                      <span className="block font-semibold">{f.paciente}</span>
                      <span className="tabular text-xs text-tinta-soft">{f.sid}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cx(
                          'rounded-md px-2 py-0.5 text-xs font-semibold',
                          f.status === 'duplicata' ? 'bg-g7-50 text-g7' : 'bg-g2-50 text-g2',
                        )}
                      >
                        {f.status === 'duplicata' ? 'Duplicata' : 'Saiu'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-tinta-soft">{f.detalhe}</td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
          {aba === 'execucoes' && (
            <>
              <Cabeca colunas={['Versão', 'Data', 'Regras', 'Ativas']} />
              <tbody className="divide-y divide-linha">
                {EXECUCOES.map((e) => (
                  <tr key={e.versao}>
                    <td className="tabular px-5 py-3 font-semibold">#{e.versao}</td>
                    <td className="tabular px-5 py-3">{e.data}</td>
                    <td className="tabular px-5 py-3">{e.regras}</td>
                    <td className="tabular px-5 py-3">
                      {e.nAtivas} <span className="ml-1 rounded-md bg-sucesso-50 px-2 py-0.5 text-xs font-semibold text-sucesso">{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>
      </div>
    </div>
  )
}

function Cabeca({ colunas }: { colunas: string[] }) {
  return (
    <thead className="border-b border-linha bg-nevoa-50/70 text-left text-[13px] text-tinta-soft">
      <tr>
        {colunas.map((c) => (
          <th key={c} scope="col" className="px-5 py-3 font-medium">
            {c}
          </th>
        ))}
      </tr>
    </thead>
  )
}
