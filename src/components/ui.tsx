import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import type { Prioridade } from '../data/types'
import { PRIORIDADES } from '../lib/prioridade'

export function cx(...c: unknown[]) {
  return c.filter(Boolean).join(' ')
}

/* Marca ------------------------------------------------------------ */

export function Marca({ para = '/', claro = false }: { para?: string; claro?: boolean }) {
  return (
    <Link to={para} className="inline-flex items-center gap-2" aria-label="Pulso — início">
      <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M3 17h7l3.5-8 5 15 3.5-7H29"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={claro ? 'text-agua' : 'text-oceano'}
        />
      </svg>
      <span className={cx('font-serif text-[1.45rem] font-bold leading-none', claro ? 'text-white' : 'text-petroleo')}>
        Pulso
      </span>
    </Link>
  )
}

/* Botões ----------------------------------------------------------- */

type Variante = 'primario' | 'secundario' | 'discreto' | 'perigo'

export function Botao({
  variante = 'primario',
  carregando,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; carregando?: boolean }) {
  return (
    <button
      {...props}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={cx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variante === 'primario' && 'bg-petroleo text-white hover:bg-petroleo-900',
        variante === 'secundario' && 'border border-petroleo/40 bg-white text-petroleo hover:border-petroleo hover:bg-nevoa-50',
        variante === 'discreto' && 'px-3 text-petroleo hover:bg-nevoa-50',
        variante === 'perigo' && 'border border-urgente/40 bg-white text-urgente hover:bg-urgente-50',
        className,
      )}
    >
      {carregando && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}

/* Campos ----------------------------------------------------------- */

export function Campo({
  rotulo,
  dica,
  erro,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { rotulo: string; dica?: ReactNode; erro?: string }) {
  const id = useId()
  const dicaId = `${id}-dica`
  const erroId = `${id}-erro`
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-tinta">
        {rotulo}
      </label>
      <input
        id={id}
        {...props}
        aria-invalid={erro ? true : undefined}
        aria-describedby={cx(dica && dicaId, erro && erroId) || undefined}
        className={cx(
          'block min-h-12 w-full rounded-lg border bg-white px-3.5 text-[15px] text-tinta placeholder:text-tinta-soft/70',
          'outline-none transition-colors focus:border-oceano focus:ring-2 focus:ring-oceano/25',
          erro ? 'border-urgente' : 'border-linha',
        )}
      />
      {erro && (
        <p id={erroId} className="mt-1.5 text-[13px] font-medium text-urgente">
          {erro}
        </p>
      )}
      {dica && (
        <p id={dicaId} className="mt-1.5 text-[13px] text-tinta-soft">
          {dica}
        </p>
      )}
    </div>
  )
}

export function AreaTexto({
  rotulo,
  dica,
  erro,
  valor,
  aoMudar,
  minimo,
}: {
  rotulo: string
  dica?: string
  erro?: string
  valor: string
  aoMudar: (v: string) => void
  minimo?: number
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-tinta">
        {rotulo} <span className="text-urgente" aria-hidden="true">*</span>
      </label>
      <textarea
        id={id}
        rows={3}
        required
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        aria-invalid={erro ? true : undefined}
        aria-describedby={`${id}-info`}
        className={cx(
          'block w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-tinta outline-none',
          'focus:border-oceano focus:ring-2 focus:ring-oceano/25',
          erro ? 'border-urgente' : 'border-linha',
        )}
      />
      <div id={`${id}-info`} className="mt-1.5 flex justify-between gap-3 text-[13px]">
        <span className={erro ? 'font-medium text-urgente' : 'text-tinta-soft'}>{erro ?? dica}</span>
        {minimo && (
          <span className={cx('tabular shrink-0', valor.trim().length >= minimo ? 'text-sucesso' : 'text-tinta-soft')}>
            {valor.trim().length}/{minimo}
          </span>
        )}
      </div>
    </div>
  )
}

/* Prioridade ------------------------------------------------------- */

const TOM: Record<Prioridade, string> = {
  A: 'bg-urgente-50 text-urgente ring-urgente/25',
  B: 'bg-prioritario-50 text-prioritario ring-prioritario/25',
  C: 'bg-eletivo-50 text-eletivo ring-eletivo/20',
  D: 'bg-programavel-50 text-programavel ring-programavel/20',
}

export function SeloPrioridade({ p, compacto }: { p: Prioridade; compacto?: boolean }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md font-semibold ring-1 ring-inset',
        compacto ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-[13px]',
        TOM[p],
      )}
    >
      <span className="font-serif text-[1.05em] font-bold leading-none">{p}</span>
      <span aria-hidden="true" className="opacity-50">·</span>
      {PRIORIDADES[p].rotulo}
    </span>
  )
}

/* Barra de prazo --------------------------------------------------- */

export function BarraPrazo({
  percentual,
  largura = 'w-28',
  compacta,
}: {
  percentual: number
  largura?: string
  compacta?: boolean
}) {
  const pct = Math.round(percentual * 100)
  const tom = pct >= 100 ? 'bg-urgente' : pct >= 75 ? 'bg-prioritario' : 'bg-oceano'
  return (
    <div className={largura}>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(pct, 100)}
        aria-valuetext={`${pct}% do prazo de referência utilizado${pct > 100 ? ', acima do prazo' : ''}`}
        className="h-1.5 overflow-hidden rounded-full bg-nevoa"
      >
        <div className={cx('h-full rounded-full', tom)} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <p className={cx('tabular mt-1 text-xs', pct >= 100 ? 'font-semibold text-urgente' : 'text-tinta-soft')}>
        {pct}%{pct >= 100 && !compacta && ' · acima do prazo'}
      </p>
    </div>
  )
}

/* Cartão ----------------------------------------------------------- */

export function Cartao({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cx('rounded-xl border border-linha bg-white', className)}>{children}</section>
}

/* Modal ------------------------------------------------------------ */

export function Modal({
  aberto,
  aoFechar,
  titulo,
  subtitulo,
  children,
}: {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  subtitulo?: ReactNode
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const tituloId = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (aberto && !d.open) d.showModal()
    if (!aberto && d.open) d.close()
  }, [aberto])

  return (
    <dialog
      ref={ref}
      aria-labelledby={tituloId}
      onClose={aoFechar}
      onClick={(e) => e.target === ref.current && aoFechar()}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-linha bg-white p-0 text-tinta shadow-[0_24px_60px_-20px_rgba(4,58,70,0.35)] backdrop:bg-petroleo-900/40"
    >
      {aberto && (
        <div className="p-6 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id={tituloId} className="text-[1.75rem]">
                {titulo}
              </h2>
              {subtitulo && <div className="mt-1 text-sm text-tinta-soft">{subtitulo}</div>}
            </div>
            <button
              type="button"
              onClick={aoFechar}
              className="-mr-2 -mt-1 rounded-md p-2 text-tinta-soft hover:bg-nevoa-50 hover:text-tinta"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}

/* Aviso de sucesso ------------------------------------------------- */

const AvisoCtx = createContext<(msg: string, detalhe?: string) => void>(() => {})

export function AvisoProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<{ msg: string; detalhe?: string; chave: number } | null>(null)
  const avisar = useCallback((msg: string, detalhe?: string) => setAviso({ msg, detalhe, chave: Date.now() }), [])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 4500)
    return () => clearTimeout(t)
  }, [aviso])

  return (
    <AvisoCtx.Provider value={avisar}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        {aviso && (
          <div
            key={aviso.chave}
            className="anim-subir pointer-events-auto flex max-w-md items-start gap-3 rounded-lg bg-petroleo-900 px-4 py-3 text-white shadow-lg"
          >
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-agua text-petroleo-900">
              <Check size={13} strokeWidth={3} />
            </span>
            <div>
              <p className="text-sm font-semibold">{aviso.msg}</p>
              {aviso.detalhe && <p className="text-[13px] text-white/75">{aviso.detalhe}</p>}
            </div>
          </div>
        )}
      </div>
    </AvisoCtx.Provider>
  )
}

export const useAviso = () => useContext(AvisoCtx)
