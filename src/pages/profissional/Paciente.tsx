import { Fragment, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CircleAlert,
  ClipboardList,
  FlaskConical,
  Microscope,
  Phone,
  SlidersHorizontal,
  Stethoscope,
  UserX,
} from 'lucide-react'
import { ModalAjuste } from '../../components/modais'
import { Botao, Cartao, SeloPrioridade, cx } from '../../components/ui'
import type { Decisao, EventoClinico, Paciente as TPaciente, SinalIA, TipoEvento } from '../../data/types'
import { formatarData, formatarDataHora } from '../../lib/datas'
import { LIMITES, PRIORIDADES, type LinhaFila } from '../../lib/prioridade'
import { usePulso } from '../../store/PulsoStore'

export function Paciente() {
  const { id = '' } = useParams()
  const { linha: buscar, pendentes } = usePulso()
  const linha = buscar(id)
  const [ajustando, setAjustando] = useState(false)

  if (!linha) {
    return (
      <div className="px-4 py-16 text-center sm:px-6">
        <h1 className="text-[2rem]">Paciente não encontrado</h1>
        <p className="mt-2 text-sm text-tinta-soft">O identificador {id} não está na fila ativa.</p>
        <Link to="/profissional/fila" className="mt-6 inline-block text-sm font-semibold text-petroleo hover:underline">
          Voltar à fila
        </Link>
      </div>
    )
  }

  const p = linha.paciente
  const revisao = pendentes.find((r) => r.pacienteId === p.id)
  const delta = linha.posicaoChegada - linha.posicao

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <Link to="/profissional/fila" className="inline-flex items-center gap-1.5 text-sm font-medium text-petroleo hover:underline">
        <ArrowLeft size={15} /> Fila priorizada
      </Link>

      <header className="mt-5 flex flex-col gap-6 border-b border-linha pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="tabular text-sm text-tinta-soft">
            {p.id} · {p.idade} anos · {p.municipio}
          </p>
          <h1 className="mt-1 text-[2.5rem] sm:text-5xl">{p.nome}</h1>
          <p className="mt-2 text-[15px]">
            {p.procedimento} · {p.especialidade}
          </p>
          <p className="mt-0.5 text-sm text-tinta-soft">
            <span className="font-semibold text-tinta">{p.cid}</span> {p.cidDescricao}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <p className="text-[13px] text-tinta-soft">Posição na fila</p>
            <p className="tabular font-serif text-5xl font-semibold leading-none text-petroleo">{linha.posicao}</p>
            {delta !== 0 && (
              <p className="tabular mt-1 text-xs text-tinta-soft">
                {delta > 0 ? '↑' : '↓'} era {linha.posicaoChegada} por ordem de chegada
              </p>
            )}
          </div>
          <div>
            <p className="mb-1.5 text-[13px] text-tinta-soft">Prioridade atual</p>
            <SeloPrioridade p={p.prioridade} />
          </div>
          <Botao onClick={() => setAjustando(true)}>
            <SlidersHorizontal size={16} /> Ajustar prioridade
          </Botao>
        </div>
      </header>

      {revisao && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-prioritario/30 bg-prioritario-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <CircleAlert size={19} className="mt-0.5 shrink-0 text-prioritario" />
            <p className="text-sm">
              <span className="font-semibold text-prioritario">
                Revisão pendente: {revisao.de} → {revisao.para}.
              </span>{' '}
              {revisao.motivo}
            </p>
          </div>
          <Link
            to="/profissional/revisoes"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-petroleo hover:underline"
          >
            Revisar <ArrowRight size={15} />
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="space-y-6">
          <PorQue linha={linha} />
          <Justificativa paciente={p} />
        </div>
        <div className="space-y-6">
          <LinhaDoTempo eventos={p.eventos} />
          <Historico decisoes={p.decisoes} />
        </div>
      </div>

      <ModalAjuste paciente={p} aberto={ajustando} aoFechar={() => setAjustando(false)} />
    </div>
  )
}

/* Por que está nesta posição ---------------------------------------- */

function PorQue({ linha }: { linha: LinhaFila }) {
  const f = linha.fatores
  const p = linha.paciente
  const fatores = [
    { nome: 'Gravidade', valor: f.gravidade, max: LIMITES.gravidade, detalhe: p.cidDescricao },
    {
      nome: 'Piora recente',
      valor: f.piora,
      max: LIMITES.piora,
      detalhe: f.eventosPiora ? `${f.eventosPiora} ${f.eventosPiora > 1 ? 'eventos' : 'evento'} em 30 dias` : 'Sem eventos em 30 dias',
    },
    {
      nome: 'Tempo de espera',
      valor: f.tempo,
      max: LIMITES.tempo,
      detalhe: `${Math.round(f.percentualPrazo * 100)}% do prazo utilizado (${linha.dias} de ${PRIORIDADES[p.prioridade].prazo} dias)`,
    },
    { nome: 'Risco estimado', valor: f.risco, max: LIMITES.risco, detalhe: 'Condição geral e comorbidades' },
  ]
  return (
    <Cartao className="p-6">
      <h2 className="text-[1.75rem]">Por que está nesta posição?</h2>
      <p className="mt-1 text-sm text-tinta-soft">
        A classe {p.prioridade} define o grupo na fila; a pontuação ordena os pacientes dentro dele.
      </p>
      <dl className="mt-6 space-y-4">
        {fatores.map((x) => (
          <div key={x.nome} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 sm:grid-cols-[10rem_1fr_3rem] sm:items-center">
            <dt className="text-sm font-semibold">{x.nome}</dt>
            <dd className="tabular text-right font-semibold text-petroleo sm:order-3">+{x.valor}</dd>
            <dd className="col-span-2 sm:col-span-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-nevoa" aria-hidden="true">
                <div className="h-full rounded-full bg-oceano" style={{ width: `${(x.valor / x.max) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-tinta-soft">{x.detalhe}</p>
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex items-end justify-between border-t border-linha pt-4">
        <div>
          <p className="text-sm font-semibold">Pontuação total</p>
          <p className="text-xs text-tinta-soft">Apoio à decisão. Não substitui a avaliação clínica.</p>
        </div>
        <p className="tabular font-serif text-4xl font-semibold leading-none text-petroleo">{f.total}</p>
      </div>
    </Cartao>
  )
}

/* Justificativa médica com sinais da IA ----------------------------- */

function Justificativa({ paciente }: { paciente: TPaciente }) {
  const { marcarSinal } = usePulso()
  const ativos = paciente.sinais.filter((s) => s.status !== 'descartado')

  return (
    <Cartao className="p-6">
      <h2 className="text-[1.75rem]">Justificativa médica</h2>
      <p className="mt-1 text-sm text-tinta-soft">Texto original da solicitação.</p>
      <blockquote className="mt-5 border-l-2 border-bege pl-4 text-[15px] leading-relaxed">
        {destacar(paciente.justificativa, ativos)}
      </blockquote>
      {paciente.observacao && <p className="mt-4 text-sm text-tinta-soft">{paciente.observacao}</p>}

      {paciente.sinais.length > 0 && (
        <div className="mt-6 border-t border-linha pt-5">
          <h3 className="font-sans text-sm font-semibold text-tinta">Sinais identificados por IA</h3>
          <p className="mt-0.5 text-xs text-tinta-soft">Sugestões de leitura do texto. Confirme ou descarte cada uma.</p>
          <ul className="mt-3 space-y-2">
            {paciente.sinais.map((s) => (
              <li
                key={s.id}
                className={cx(
                  'flex flex-col gap-2 rounded-lg border px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between',
                  s.status === 'confirmado' ? 'border-sucesso/30 bg-sucesso-50/60' : 'border-linha',
                  s.status === 'descartado' && 'opacity-60',
                )}
              >
                <div className="text-sm">
                  <span className="font-semibold">{s.rotulo}</span>
                  <span className="text-tinta-soft"> · “{s.trecho}”</span>
                  <p className="mt-0.5 text-xs font-medium text-oceano">
                    {s.status === 'sugerido'
                      ? 'Sinal identificado por IA · confirme'
                      : s.status === 'confirmado'
                        ? 'Confirmado pelo regulador'
                        : 'Descartado pelo regulador'}
                  </p>
                </div>
                {s.status === 'sugerido' ? (
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() => marcarSinal(paciente.id, s.id, 'confirmado')}
                      className="rounded-md border border-petroleo/40 px-2.5 py-1 text-xs font-semibold text-petroleo hover:bg-nevoa-50"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => marcarSinal(paciente.id, s.id, 'descartado')}
                      className="rounded-md px-2.5 py-1 text-xs font-semibold text-tinta-soft hover:bg-nevoa-50"
                    >
                      Descartar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => marcarSinal(paciente.id, s.id, 'sugerido')}
                    className="shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold text-tinta-soft hover:bg-nevoa-50"
                  >
                    Desfazer
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Cartao>
  )
}

function destacar(texto: string, sinais: SinalIA[]): ReactNode {
  if (!sinais.length) return texto
  const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${sinais.map((s) => escapar(s.trecho)).join('|')})`, 'gi')
  return texto.split(re).map((parte, i) => {
    const s = sinais.find((x) => x.trecho.toLowerCase() === parte.toLowerCase())
    if (!s) return <Fragment key={i}>{parte}</Fragment>
    return (
      <mark
        key={i}
        title={s.status === 'confirmado' ? 'Confirmado pelo regulador' : 'Sinal identificado por IA · confirme'}
        className={cx(
          'rounded px-0.5 text-tinta',
          s.status === 'confirmado' ? 'bg-sucesso-50 underline decoration-sucesso/50' : 'bg-prioritario-50 underline decoration-prioritario/50 decoration-dotted underline-offset-4',
        )}
      >
        {parte}
      </mark>
    )
  })
}

/* Linha do tempo ---------------------------------------------------- */

const ICONES: Record<TipoEvento, typeof Activity> = {
  entrada: ClipboardList,
  'pronto-socorro': Activity,
  internacao: BedDouble,
  exame: FlaskConical,
  biopsia: Microscope,
  contato: Phone,
  consulta: Stethoscope,
  falta: UserX,
}

function LinhaDoTempo({ eventos }: { eventos: EventoClinico[] }) {
  return (
    <Cartao className="p-6">
      <h2 className="text-[1.75rem]">Linha do tempo clínica</h2>
      <ol className="mt-5">
        {[...eventos].reverse().map((e, i, todos) => {
          const Icone = ICONES[e.tipo]
          return (
            <li key={`${e.data}-${i}`} className="relative flex gap-4 pb-5 last:pb-0">
              {i < todos.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-linha" aria-hidden="true" />}
              <span
                className={cx(
                  'grid size-8 shrink-0 place-items-center rounded-full',
                  e.piora ? 'bg-urgente-50 text-urgente' : 'bg-nevoa-50 text-petroleo',
                )}
              >
                <Icone size={15} />
              </span>
              <div className="pt-1">
                <p className="tabular text-xs font-semibold text-tinta-soft">
                  {formatarData(e.data)}
                  {e.piora && <span className="ml-2 text-urgente">sinal de piora</span>}
                </p>
                <p className="mt-0.5 text-sm">{e.descricao}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </Cartao>
  )
}

/* Histórico de decisões --------------------------------------------- */

const TIPO_DECISAO: Record<Decisao['tipo'], string> = {
  inclusao: 'Classificação inicial',
  ajuste: 'Ajuste manual',
  'revisao-confirmada': 'Revisão confirmada',
  'revisao-mantida': 'Revisão recusada · prioridade mantida',
}

function Historico({ decisoes }: { decisoes: Decisao[] }) {
  return (
    <Cartao className="p-6">
      <h2 className="text-[1.75rem]">Histórico de decisões</h2>
      <ul className="mt-4 divide-y divide-linha">
        {[...decisoes].reverse().map((d, i) => (
          <li key={i} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-2">
              {d.de && d.de !== d.para ? (
                <span className="tabular text-sm font-semibold">
                  {d.de} → {d.para}
                </span>
              ) : (
                <span className="tabular text-sm font-semibold">{d.para}</span>
              )}
              <span className="text-xs text-tinta-soft">{TIPO_DECISAO[d.tipo]}</span>
            </div>
            <p className="mt-1 text-sm">{d.justificativa}</p>
            <p className="mt-1 text-xs text-tinta-soft">
              {d.profissional} · {formatarDataHora(d.data)}
            </p>
          </li>
        ))}
      </ul>
    </Cartao>
  )
}
