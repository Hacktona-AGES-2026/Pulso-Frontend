import { useMemo, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { SeloFila, TOM_FILA, cx } from '../../components/ui'
import { NOME_FILA, ORDEM_FILAS, type FilaCodigo } from '../../data/fila'
import { formatarData, HOJE } from '../../lib/datas'
import type { LinhaFila } from '../../lib/prioridade'
import { usePulso } from '../../store/PulsoStore'

const POR_PAGINA = 20

const normalizar = (t: string) =>
  t
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

type Chave = 'posicao' | 'dias'
const ORDENADORES: Record<Chave, (a: LinhaFila, b: LinhaFila) => number> = {
  posicao: (a, b) => a.posicao - b.posicao,
  dias: (a, b) => a.dias - b.dias,
}

export function Fila() {
  const { fila } = usePulso()
  const [params, setParams] = useSearchParams()
  const navegar = useNavigate()

  const busca = params.get('q') ?? ''
  const especialidade = params.get('esp') ?? ''
  const nivel = (params.get('nivel') ?? '') as FilaCodigo | ''
  const chave = (params.get('ordem') ?? 'posicao') as Chave
  const crescente = params.get('dir') !== 'desc'
  const pagina = Math.max(1, Number(params.get('p') ?? 1))

  const atualizar = (mudancas: Record<string, string | null>, manterPagina = false) => {
    const novo = new URLSearchParams(params)
    for (const [k, v] of Object.entries(mudancas)) {
      if (v) novo.set(k, v)
      else novo.delete(k)
    }
    if (!manterPagina) novo.delete('p')
    setParams(novo, { replace: true })
  }

  const especialidades = useMemo(
    () => [...new Set(fila.map((l) => l.paciente.especialidade))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [fila],
  )

  const filtrada = useMemo(() => {
    const termo = normalizar(busca.trim())
    const lista = fila.filter(({ paciente: p }) => {
      if (especialidade && p.especialidade !== especialidade) return false
      if (nivel && p.fila !== nivel) return false
      return !termo || normalizar(`${p.nome} ${p.id} ${p.pacienteId} ${p.procedimento} ${p.cid}`).includes(termo)
    })
    const ordenar = ORDENADORES[chave] ?? ORDENADORES.posicao
    return lista.sort((a, b) => (crescente ? 1 : -1) * ordenar(a, b))
  }, [fila, busca, especialidade, nivel, chave, crescente])

  const totalPaginas = Math.max(1, Math.ceil(filtrada.length / POR_PAGINA))
  const atual = Math.min(pagina, totalPaginas)
  const visiveis = filtrada.slice((atual - 1) * POR_PAGINA, atual * POR_PAGINA)
  const filtrando = busca || especialidade || nivel

  const ordenarPor = (k: Chave) =>
    atualizar({ ordem: k === 'posicao' ? null : k, dir: chave === k && crescente ? 'desc' : null })

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <header>
        <p className="tabular text-sm text-tinta-soft">{formatarData(HOJE)}</p>
        <h1 className="text-[2.5rem]">Fila priorizada</h1>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="relative">
          <label htmlFor="busca" className="sr-only">
            Buscar
          </label>
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tinta-soft" />
          <input
            id="busca"
            type="search"
            value={busca}
            onChange={(e) => atualizar({ q: e.target.value || null })}
            placeholder="Buscar paciente, ID, procedimento ou CID"
            className="min-h-11 w-full rounded-lg border border-linha bg-white pl-10 pr-3 text-sm outline-none focus:border-oceano focus:ring-2 focus:ring-oceano/25"
          />
        </div>
        <div>
          <label htmlFor="esp" className="sr-only">
            Especialidade
          </label>
          <select
            id="esp"
            value={especialidade}
            onChange={(e) => atualizar({ esp: e.target.value || null })}
            className="min-h-11 w-full rounded-lg border border-linha bg-white px-3 text-sm outline-none focus:border-oceano focus:ring-2 focus:ring-oceano/25"
          >
            <option value="">Todas as especialidades</option>
            {especialidades.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por nível">
        <Chip ativo={!nivel} aoClicar={() => atualizar({ nivel: null })}>
          Todos
        </Chip>
        {ORDEM_FILAS.map((f) => (
          <Chip key={f} ativo={nivel === f} aoClicar={() => atualizar({ nivel: nivel === f ? null : f })} titulo={NOME_FILA[f]}>
            <span className={cx('size-2 rounded-full', TOM_FILA[f].barra)} aria-hidden="true" />
            {f}
          </Chip>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[13px] text-tinta-soft">
        <p aria-live="polite">
          {filtrada.length === fila.length ? `${fila.length} pacientes` : `${filtrada.length} de ${fila.length}`}
          {nivel && ` · ${NOME_FILA[nivel]}`}
        </p>
        {filtrando && (
          <button onClick={() => atualizar({ q: null, esp: null, nivel: null })} className="font-semibold text-petroleo hover:underline">
            Limpar filtros
          </button>
        )}
      </div>

      {visiveis.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-linha bg-white px-6 py-14 text-center">
          <p className="font-titulo text-2xl text-petroleo">Nenhum paciente encontrado</p>
          <p className="mt-1 text-sm text-tinta-soft">Revise a busca ou os filtros aplicados.</p>
        </div>
      ) : (
        <>
          {/* Tabela (telas largas) */}
          <div className="mt-3 hidden overflow-x-auto rounded-xl border border-linha bg-white xl:block">
            <table className="w-full min-w-[1000px] text-sm">
              <caption className="sr-only">Fila priorizada de cirurgias, página {atual}</caption>
              <thead className="border-b border-linha bg-nevoa-50/70 text-left text-[13px] text-tinta-soft">
                <tr>
                  <Cabecalho chave="posicao" atual={chave} crescente={crescente} aoOrdenar={ordenarPor} className="w-20 pl-5">
                    Posição
                  </Cabecalho>
                  <th scope="col" className="w-24 px-3 py-3 font-medium" title="Em relação à ordem de chegada">
                    Mudança
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">Paciente</th>
                  <th scope="col" className="px-3 py-3 font-medium">Procedimento · CID</th>
                  <th scope="col" className="px-3 py-3 font-medium">Nível</th>
                  <Cabecalho chave="dias" atual={chave} crescente={crescente} aoOrdenar={ordenarPor} className="text-right">
                    Dias na fila
                  </Cabecalho>
                  <th scope="col" className="px-3 py-3 pr-5 font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linha">
                {visiveis.map((l) => (
                  <tr
                    key={l.paciente.id}
                    onClick={() => navegar(`/profissional/pacientes/${l.paciente.id}`)}
                    className="cursor-pointer align-top transition-colors hover:bg-areia/70"
                  >
                    <td className="tabular relative py-3.5 pl-5 pr-3 font-titulo text-xl font-semibold text-petroleo">
                      <span className={cx('absolute inset-y-0 left-0 w-1', TOM_FILA[l.paciente.fila].barra)} aria-hidden="true" />
                      {l.posicao}
                    </td>
                    <td className="px-3 py-4">
                      <Mudanca linha={l} />
                    </td>
                    <td className="min-w-44 px-3 py-3.5">
                      <Link
                        to={`/profissional/pacientes/${l.paciente.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-tinta hover:text-petroleo hover:underline"
                      >
                        {l.paciente.nome}
                      </Link>
                      <p className="tabular whitespace-nowrap text-xs text-tinta-soft">
                        {l.paciente.id} · {l.paciente.idade} anos
                      </p>
                    </td>
                    <td className="min-w-44 px-3 py-3.5">
                      {l.paciente.procedimento}
                      <p className="text-xs font-semibold text-tinta-soft">{l.paciente.cid}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <SeloFila f={l.paciente.fila} compacto />
                    </td>
                    <td className="tabular px-3 py-3.5 text-right font-medium">{l.dias}</td>
                    <td className="min-w-64 px-3 py-3.5 pr-5 text-[13px] leading-snug text-tinta-soft">{l.resumo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lista (celular e tablet) */}
          <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:hidden">
            {visiveis.map((l) => (
              <li key={l.paciente.id}>
                <Link
                  to={`/profissional/pacientes/${l.paciente.id}`}
                  className="block rounded-xl border border-linha bg-white p-4 transition-colors hover:border-petroleo/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="tabular font-titulo text-2xl font-semibold text-petroleo">{l.posicao}</span>
                      <div>
                        <p className="font-semibold">{l.paciente.nome}</p>
                        <p className="tabular text-xs text-tinta-soft">
                          {l.paciente.id} · {l.paciente.idade} anos
                        </p>
                      </div>
                    </div>
                    <SeloFila f={l.paciente.fila} compacto />
                  </div>
                  <p className="mt-3 text-sm">
                    {l.paciente.procedimento} <span className="text-tinta-soft">· {l.paciente.cid}</span>
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                    <span>
                      <span className="tabular font-semibold">{l.dias}</span>{' '}
                      <span className="text-tinta-soft">dias na fila</span>
                    </span>
                    <Mudanca linha={l} />
                  </div>
                  <p className="mt-3 border-t border-linha pt-3 text-[13px] leading-snug text-tinta-soft">{l.resumo}</p>
                </Link>
              </li>
            ))}
          </ul>

          <nav aria-label="Paginação" className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="tabular text-tinta-soft">
              {(atual - 1) * POR_PAGINA + 1}–{Math.min(atual * POR_PAGINA, filtrada.length)} de {filtrada.length}
            </p>
            <div className="flex items-center gap-1">
              <BotaoPagina
                rotulo="Página anterior"
                desativado={atual === 1}
                aoClicar={() => atualizar({ p: String(atual - 1) }, true)}
              >
                <ChevronLeft size={17} />
              </BotaoPagina>
              {paginas(atual, totalPaginas).map((n, i) =>
                n === null ? (
                  <span key={`r${i}`} className="px-1 text-tinta-soft">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => atualizar({ p: n === 1 ? null : String(n) }, true)}
                    aria-current={n === atual ? 'page' : undefined}
                    className={cx(
                      'tabular min-w-9 rounded-md px-2 py-1.5 font-medium',
                      n === atual ? 'bg-petroleo text-white' : 'hover:bg-nevoa-50',
                    )}
                  >
                    {n}
                  </button>
                ),
              )}
              <BotaoPagina
                rotulo="Próxima página"
                desativado={atual === totalPaginas}
                aoClicar={() => atualizar({ p: String(atual + 1) }, true)}
              >
                <ChevronRight size={17} />
              </BotaoPagina>
            </div>
          </nav>
        </>
      )}
    </div>
  )
}

function paginas(atual: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const set = new Set([1, total, atual - 1, atual, atual + 1].filter((n) => n >= 1 && n <= total))
  const lista = [...set].sort((a, b) => a - b)
  return lista.flatMap((n, i) => (i > 0 && n - lista[i - 1] > 1 ? [null, n] : [n]))
}



function Cabecalho({
  chave,
  atual,
  crescente,
  aoOrdenar,
  className,
  children,
}: {
  chave: Chave
  atual: Chave
  crescente: boolean
  aoOrdenar: (k: Chave) => void
  className?: string
  children: string
}) {
  const ativo = chave === atual
  return (
    <th
      scope="col"
      aria-sort={ativo ? (crescente ? 'ascending' : 'descending') : undefined}
      className={cx('px-3 py-3 font-medium', className)}
    >
      <button
        onClick={() => aoOrdenar(chave)}
        className={cx('inline-flex items-center gap-1 hover:text-petroleo', ativo && 'font-semibold text-petroleo')}
      >
        {children}
        {ativo && (crescente ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
      </button>
    </th>
  )
}

function Mudanca({ linha }: { linha: LinhaFila }) {
  const delta = linha.posicaoChegada - linha.posicao
  if (delta === 0) return <span className="text-xs text-tinta-soft">sem mudança</span>
  const subiu = delta > 0
  return (
    <span
      className={cx('tabular inline-flex items-center gap-0.5 whitespace-nowrap text-xs font-semibold', subiu ? 'text-oceano' : 'text-tinta-soft')}
      aria-label={`${subiu ? 'Subiu' : 'Desceu'}; era a posição ${linha.posicaoChegada} na ordem de chegada`}
    >
      {subiu ? <ArrowUp size={12} strokeWidth={2.5} /> : <ArrowDown size={12} strokeWidth={2.5} />}
      era {linha.posicaoChegada}
    </span>
  )
}

function BotaoPagina({
  rotulo,
  desativado,
  aoClicar,
  children,
}: {
  rotulo: string
  desativado: boolean
  aoClicar: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={aoClicar}
      disabled={desativado}
      aria-label={rotulo}
      className="grid size-9 place-items-center rounded-md hover:bg-nevoa-50 disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}

function Chip({
  ativo,
  aoClicar,
  titulo,
  children,
}: {
  ativo: boolean
  aoClicar: () => void
  titulo?: string
  children: ReactNode
}) {
  return (
    <button
      onClick={aoClicar}
      title={titulo}
      aria-pressed={ativo}
      className={cx(
        'tabular inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition-colors',
        ativo ? 'border-petroleo bg-petroleo text-white' : 'border-linha bg-white text-tinta hover:border-petroleo/40',
      )}
    >
      {children}
    </button>
  )
}
