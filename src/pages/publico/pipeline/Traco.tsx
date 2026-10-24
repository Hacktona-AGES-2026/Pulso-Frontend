// O traço: uma linha de ECG que desce pela página e se desenha com a rolagem.
// Cada seção diz como ele se comporta em data-traco: plano, faixas (os 8 níveis), duas (batidas) ou calmo.
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { ORDEM_FILAS } from '../../../data/fila'
import { corNivel } from './dados'
import { useMenosMovimento } from './rolagem'

type Tipo = 'plano' | 'faixas' | 'duas' | 'calmo'
interface Trecho {
  tipo: Tipo
  y0: number
  y1: number
}

const X = 22 // eixo do traço dentro do svg (44px de largura)

// Um complexo PQRST deitado: [dy, dx] relativos ao início da batida.
const BATIDA: [number, number][] = [
  [0, 0], [5, -3], [10, 0], [20, 0], [23, 4], [27, -17], [31, 11], [34, 0], [46, 0], [52, -6], [58, 0],
]
const batida = (y: number, amp: number) =>
  BATIDA.map(([dy, dx]) => `L${(X + dx * amp).toFixed(1)} ${(y + dy).toFixed(1)}`).join('')

function construir(trechos: Trecho[], altura: number) {
  let d = `M${X} 0`
  const faixas: string[] = []
  for (const t of trechos) {
    d += `L${X} ${t.y0}`
    if (t.tipo === 'duas') {
      for (const f of [0.38, 0.62]) {
        const y = t.y0 + (t.y1 - t.y0) * f
        d += `L${X} ${y}` + batida(y, 1.25)
      }
    } else if (t.tipo === 'calmo') {
      for (let y = t.y0 + 80; y < t.y1 - 140; y += 120) d += `L${X} ${y}` + batida(y, 0.55)
    } else if (t.tipo === 'faixas') {
      // o traço se abre nos 8 níveis e volta a ser um só no fim da seção
      const a = t.y0 + 40
      const b = t.y1 - 40
      ORDEM_FILAS.forEach((_, i) => {
        const dx = (i - 3.5) * 3.4
        faixas.push(
          `M${X} ${a}C${X} ${a + 30} ${X + dx} ${a + 30} ${X + dx} ${a + 60}` +
            `L${X + dx} ${b - 60}C${X + dx} ${b - 30} ${X} ${b - 30} ${X} ${b}`,
        )
      })
      d += `L${X} ${a}M${X} ${b}`
    }
    d += `L${X} ${t.y1}`
  }
  return { d: d + `L${X} ${altura}`, faixas }
}

export function Traco({ papel }: { papel: RefObject<HTMLDivElement | null> }) {
  const [geo, setGeo] = useState<{ altura: number; trechos: Trecho[] }>({ altura: 0, trechos: [] })
  const recorte = useRef<SVGRectElement>(null)
  const ponta = useRef<SVGCircleElement>(null)
  const calmo = useMenosMovimento()

  useEffect(() => {
    const el = papel.current
    if (!el) return
    const medir = () => {
      const topo = el.getBoundingClientRect().top + window.scrollY
      const trechos = Array.from(el.querySelectorAll<HTMLElement>('[data-traco]')).map((s) => {
        const r = s.getBoundingClientRect()
        return { tipo: s.dataset.traco as Tipo, y0: r.top + window.scrollY - topo, y1: r.bottom + window.scrollY - topo }
      })
      setGeo({ altura: el.scrollHeight, trechos })
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    return () => ro.disconnect()
  }, [papel])

  useEffect(() => {
    const el = papel.current
    if (!el) return
    let raf = 0
    const desenhar = () => {
      raf = 0
      const fim = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
      const y = calmo || fim ? geo.altura : Math.max(0, window.innerHeight * 0.62 - el.getBoundingClientRect().top)
      recorte.current?.setAttribute('height', String(y))
      ponta.current?.setAttribute('cy', String(Math.min(y, geo.altura)))
    }
    const agendar = () => {
      if (!raf) raf = requestAnimationFrame(desenhar)
    }
    desenhar()
    window.addEventListener('scroll', agendar, { passive: true })
    window.addEventListener('resize', agendar)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', agendar)
      window.removeEventListener('resize', agendar)
    }
  }, [papel, geo, calmo])

  const { d, faixas } = useMemo(() => construir(geo.trechos, geo.altura), [geo])
  if (!geo.altura) return null

  return (
    <svg className="pl-traco" width="44" height={geo.altura} aria-hidden="true">
      <defs>
        <clipPath id="pl-traco-recorte">
          <rect ref={recorte} x="0" y="0" width="44" height="0" />
        </clipPath>
      </defs>
      <path className="pl-traco-guia" d={d} />
      {faixas.map((f, i) => (
        <path key={i} className="pl-traco-guia" d={f} />
      ))}
      <g clipPath="url(#pl-traco-recorte)">
        <path className="pl-traco-linha" d={d} />
        {faixas.map((f, i) => (
          <path key={i} className="pl-traco-faixa" d={f} stroke={corNivel(i)} />
        ))}
      </g>
      <circle ref={ponta} className="pl-traco-ponta" cx={X} cy="0" r="3.5" />
    </svg>
  )
}
