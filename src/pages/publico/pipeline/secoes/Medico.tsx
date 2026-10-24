// 04 · O médico decide. A fila oficial só muda quando um carimbo cai no pedido.
import { useEffect, useRef, useState } from 'react'
import { SeloFila, cx } from '../../../../components/ui'
import { ORDEM_FILAS } from '../../../../data/fila'
import { COR_NIVEL } from '../dados'
import { CartaoPedido, Carimbo, type Decisao } from '../partes'
import { mix, saida, suave, trecho, useCena, useMenosMovimento } from '../rolagem'

const MOTIVO = 'Confirmar o laudo em consulta antes de mudar de nível.'
const G6 = 6
const G1A = 0

const REGRAS = [
  'Rejeitar exige um motivo escrito.',
  'Um pedido aberto por paciente. Evidência nova atualiza o mesmo pedido.',
  'Aprovar renumera a fila e confere a regra de ouro na mesma transação. Se falhar, nada muda.',
  'CID C* nunca é rebaixado: a regra está no código e num CHECK do banco.',
]

/** Número que rola até o alvo, como um odômetro. */
function useRolante(alvo: number) {
  const calmo = useMenosMovimento()
  const [v, setV] = useState(alvo)
  const de = useRef(alvo)
  useEffect(() => {
    if (calmo) {
      setV(alvo)
      de.current = alvo
      return
    }
    let raf = 0
    const ini = de.current
    const t0 = performance.now()
    const passo = (t: number) => {
      const k = Math.min(1, (t - t0) / 800)
      const atual = Math.round(ini + (alvo - ini) * (1 - Math.pow(1 - k, 3)))
      de.current = atual
      setV(atual)
      if (k < 1) raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [alvo, calmo])
  return v
}

export function Medico() {
  const ref = useRef<HTMLElement>(null)
  const { p } = useCena(ref)
  const [modo, setModo] = useState<Decisao>('aprovar')

  const entra = saida(trecho(p, 0.03, 0.2)) // o pedido chega na mesa
  const digita = trecho(p, 0.22, 0.4) // na rejeição, o motivo é escrito antes
  const desce = suave(trecho(p, 0.4, 0.48)) // o carimbo desce
  const pousou = p >= 0.48
  const anda = suave(trecho(p, 0.54, 0.72)) // ela troca de nível
  const fim = p >= 0.76
  const aprova = modo === 'aprovar'
  const nivel = aprova ? mix(G6, G1A, anda) : G6
  const posicao = useRolante(aprova && anda > 0.5 ? 16 : 621)

  return (
    <section ref={ref} id="medico" className="pl-cena" data-traco="duas" aria-labelledby="pl-medico">
      <div className="pl-palco">
        <div className="pl-vis pl-mesa">
          <div
            className="relative z-10 w-full max-w-[30rem]"
            style={{ transform: `translateY(${mix(60, 0, entra)}px)`, opacity: mix(0.3, 1, entra) }}
          >
            <CartaoPedido
              marca={pousou ? modo : null}
              motivo={!aprova && digita > 0 ? MOTIVO.slice(0, Math.round(digita * MOTIVO.length)) : undefined}
              digitando={!pousou}
              className={pousou ? 'pl-pousou' : undefined}
            />
            <div className="absolute -bottom-6 right-2 z-10 flex gap-2.5">
              {(['aprovar', 'rejeitar'] as Decisao[]).map((t) => {
                const vai = t === modo
                return (
                  <Carimbo
                    key={t}
                    tipo={t}
                    ativo={vai}
                    onClick={() => setModo(t)}
                    estilo={{
                      transform: vai
                        ? `translate(${mix(0, -16, desce)}px, ${mix(0, -34, desce)}px) rotate(${mix(-4, -9, desce)}deg) scale(${mix(1, 1.15, desce)})`
                        : 'rotate(3deg)',
                      opacity: vai ? (pousou ? 0 : 1) : pousou ? 0.4 : 0.65,
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* a fila oficial, nível a nível: ela só troca quando o carimbo de aprovação cai */}
          <div className="mt-10 w-full max-w-[30rem] rounded-xl border border-linha bg-white px-4 pb-3 pt-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[13px] font-semibold text-tinta">Fila oficial</p>
              <p className="tabular font-titulo text-2xl font-bold text-petroleo">
                posição {posicao}
              </p>
            </div>
            <div className="relative mt-2" aria-hidden="true">
              {ORDEM_FILAS.map((f) => (
                <div key={f} className="flex h-6 items-center gap-2">
                  <span className="w-10 shrink-0">
                    <SeloFila f={f} compacto />
                  </span>
                  <span className="h-1 flex-1 rounded-full" style={{ background: COR_NIVEL[f].fundo }} />
                </div>
              ))}
              {/* proposta: onde o motor quer que ela vá */}
              {!pousou || !aprova ? (
                <span
                  className={cx('pl-fantasma', pousou && 'opacity-0')}
                  style={{ top: G1A * 24 + 12, left: '62%' }}
                />
              ) : null}
              <span className="pl-ela" style={{ top: nivel * 24 + 12, left: '62%' }}>
                <i>621</i>
              </span>
            </div>
            <p className="mt-2 min-h-5 text-[12.5px] text-tinta-soft">
              {!pousou
                ? 'Proposta do motor: G6 → G1a. Até o carimbo, nada muda.'
                : aprova
                  ? anda > 0.5
                    ? '605 pacientes, da 16ª à 620ª, descem uma posição.'
                    : 'Aprovado. Renumerando a fila…'
                  : 'Rejeitado. Fila oficial sem mudança; ela segue na 621.'}
            </p>
          </div>

          <div className={cx('mt-4 flex flex-wrap items-center gap-3 transition-all duration-500', fim ? 'opacity-100' : 'translate-y-2 opacity-0')}>
            <span className="rounded-full border border-sucesso/40 bg-sucesso-50 px-3 py-1 text-[12px] font-semibold text-sucesso">
              {aprova ? 'regra de ouro ✓' : 'motivo registrado ✓'}
            </span>
            <code className="pl-mono text-[11.5px] text-tinta-soft">
              {aprova ? 'histórico · pedido #121 · aprovado · G6 → G1a · 621 → 16' : 'histórico · pedido #121 · rejeitado · motivo escrito'}
            </code>
          </div>
        </div>
      </div>

      <div className="pl-roteiro">
        <div className="pl-passo" data-passo>
          <div className="pl-cartao">
            <p className="pl-num">04 · Decisão</p>
            <h2 id="pl-medico" className="text-[2.25rem] sm:text-[2.75rem]">O sistema propõe. O médico decide.</h2>
            <p className="mt-3 text-[16px] text-tinta-soft">
              Cada pedido traz de onde, para onde, a posição estimada e as evidências com data e origem. No #121, o CID
              diz mioma (D25.9); a biópsia diz carcinoma. O motor ouviu a biópsia e pede G6 → G1a.
            </p>
            <p className="mt-3 text-[13px] text-tinta-soft">Toque num carimbo para ver a outra decisão.</p>
          </div>
        </div>
        <div className="pl-passo" data-passo>
          <div className="pl-cartao">
            <p className="pl-rotulo">Quatro travas</p>
            <ol className="space-y-3">
              {REGRAS.map((r, i) => (
                <li key={r} className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3 text-[15px]">
                  <span className="grid size-7 place-items-center rounded-full border-2 border-petroleo font-titulo text-sm font-bold text-petroleo">
                    {i + 1}
                  </span>
                  {r}
                </li>
              ))}
            </ol>
            <p className="tabular mt-5 border-t border-linha pt-4 text-[14px] text-tinta-soft">
              <b className="font-titulo text-xl text-petroleo">128 pedidos esperando.</b> 33 de G7 para G4, 19 de G2 para
              G1a, 5 para sair da fila.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
