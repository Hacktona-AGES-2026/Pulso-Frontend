import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/cliente'
import { useApi } from '../../api/useApi'
import { Carregando, FalhaApi, cx } from '../../components/ui'
import { useProfissional } from '../../layouts/ProfissionalLayout'
import { formatarData, formatarInstante } from '../../lib/datas'

type Aba = 'carga' | 'quarentena' | 'fora' | 'execucoes'
const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'carga', rotulo: 'Correções da carga' },
  { id: 'quarentena', rotulo: 'Quarentena' },
  { id: 'fora', rotulo: 'Fora da fila' },
  { id: 'execucoes', rotulo: 'Execuções' },
]

export function Dados() {
  const { resumo } = useProfissional()
  const { dados, erro, recarregar } = useApi(api.dados)
  const [aba, setAba] = useState<Aba>('carga')

  const s = resumo?.solicitacoes ?? {}
  const total = Object.values(s).reduce((a, n) => a + n, 0)
  const numeros: [string, number | undefined][] = [
    ['lidas', resumo ? total : undefined],
    ['ativas', s.ativa],
    ['duplicatas', s.duplicata],
    ['saídas', s.saiu],
    ['eventos', resumo ? resumo.eventos.processados + resumo.eventos.pendentes : undefined],
    ['processados', resumo?.eventos.processados],
    ['quarentena', resumo?.eventos.quarentena],
  ]

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="text-[2.5rem]">Dados</h1>

      <dl className="mt-6 grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-linha bg-linha sm:grid-cols-7">
        {numeros.map(([rotulo, n]) => (
          <div key={rotulo} className="flex flex-col-reverse bg-white px-4 py-3.5">
            <dt className="mt-1 text-xs text-tinta-soft">{rotulo}</dt>
            <dd className="tabular font-titulo text-[1.6rem] font-semibold leading-none text-petroleo">{n ?? '–'}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-linha" role="tablist">
        {ABAS.map((a) => (
          <button
            key={a.id}
            role="tab"
            aria-selected={aba === a.id}
            onClick={() => setAba(a.id)}
            className={cx(
              '-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold',
              aba === a.id ? 'border-petroleo text-petroleo' : 'border-transparent text-tinta-soft hover:text-tinta',
            )}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      {erro ? (
        <FalhaApi erro={erro} aoTentar={recarregar} />
      ) : !dados ? (
        <Carregando />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-linha bg-white" role="tabpanel">
          <table className="w-full min-w-[560px] text-sm">
            {aba === 'carga' && (
              <>
                <Cabeca colunas={['Problema', 'Quantidade', 'Ação']} />
                <tbody className="divide-y divide-linha">
                  {(dados.execucoes.find((e) => e.tipo === 'carga')?.relatorio ?? []).map((r) => (
                    <tr key={r.problema}>
                      <td className="px-5 py-3">{r.problema}</td>
                      <td className="tabular px-5 py-3 font-semibold">{r.quantidade}</td>
                      <td className="px-5 py-3 text-tinta-soft">{r.acao}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
            {aba === 'quarentena' && (
              <>
                <Cabeca colunas={['Evento', 'Motivo', 'Solicitação', 'Tipo', 'Data']} />
                <tbody className="divide-y divide-linha">
                  {dados.quarentena.map((q) => (
                    <tr key={q.evento_id}>
                      <td className="tabular px-5 py-3 font-medium">{q.evento_id}</td>
                      <td className="px-5 py-3">
                        <code className="rounded bg-g3-50 px-1.5 py-0.5 text-xs text-g3">{q.motivo}</code>
                      </td>
                      <td className="tabular px-5 py-3 text-tinta-soft">{q.solicitacao_id}</td>
                      <td className="px-5 py-3 text-tinta-soft">{q.tipo_evento}</td>
                      <td className="tabular px-5 py-3 text-tinta-soft">{q.data_evento ? formatarData(q.data_evento) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
            {aba === 'fora' && (
              <>
                <Cabeca colunas={['Solicitação', 'Situação', 'Evidência']} />
                <tbody className="divide-y divide-linha">
                  {dados.fora_da_fila.map((f) => (
                    <tr key={f.solicitacao_id}>
                      <td className="px-5 py-3">
                        <Link to={`/profissional/pacientes/${f.solicitacao_id}`} className="block font-semibold hover:text-petroleo hover:underline">
                          {f.paciente_nome}
                        </Link>
                        <span className="tabular text-xs text-tinta-soft">{f.solicitacao_id}</span>
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
                      <td className="px-5 py-3 text-tinta-soft">
                        {f.status === 'duplicata' ? `Fundida em ${f.duplicata_de}` : f.motivo_status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
            {aba === 'execucoes' && (
              <>
                <Cabeca colunas={['#', 'Tipo', 'Referência', 'Regras', 'Início']} />
                <tbody className="divide-y divide-linha">
                  {dados.execucoes.map((e) => (
                    <tr key={e.id}>
                      <td className="tabular px-5 py-3 font-semibold">{e.id}</td>
                      <td className="px-5 py-3">{e.tipo}</td>
                      <td className="tabular px-5 py-3">{formatarData(e.data_referencia)}</td>
                      <td className="tabular px-5 py-3">v{e.regras_versao}</td>
                      <td className="tabular px-5 py-3 text-tinta-soft">{formatarInstante(e.iniciada_em)}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      )}
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
