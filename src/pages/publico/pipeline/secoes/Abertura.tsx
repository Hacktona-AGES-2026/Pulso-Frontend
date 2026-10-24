// Abertura: o mapa do pipeline. Cada etapa leva à sua seção.
import { Activity, Database, ListOrdered, ReceiptText, Stamp, type LucideIcon } from 'lucide-react'

interface Etapa {
  alvo: string
  titulo: string
  metrica: string
  rotulo: string
  icone: LucideIcon
}

const ETAPAS: Etapa[] = [
  { alvo: 'limpeza', titulo: 'Entrada e limpeza', metrica: '941 → 902', rotulo: 'pedidos ativos, nada apagado', icone: Database },
  { alvo: 'motor', titulo: 'Motor em 8 níveis', metrica: 'G1a → G7', rotulo: 'ordem fixa entre os níveis', icone: ListOrdered },
  { alvo: 'eventos', titulo: 'Eventos, um por um', metrica: '1.489 → 128', rotulo: 'eventos viram pedidos', icone: Activity },
  { alvo: 'medico', titulo: 'Decisão do médico', metrica: 'aprova ou rejeita', rotulo: 'só o carimbo muda a fila', icone: Stamp },
  { alvo: 'saida', titulo: 'Fila com recibos', metrica: '897', rotulo: 'posições explicadas', icone: ReceiptText },
]

// Linha de ECG com uma batida no centro de cada uma das cinco colunas.
const BATIDA = 'l6 -5 l6 5 l10 0 l4 7 l6 -34 l6 40 l5 -13 l14 0 l8 -7 l8 7'
const TRACO = `M0 40 ${[100, 300, 500, 700, 900].map((x) => `L${x - 38} 40 ${BATIDA}`).join(' ')} L1000 40`

function irPara(alvo: string) {
  document.getElementById(alvo)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function Abertura() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 md:pb-24 md:pt-20" aria-labelledby="pipeline-titulo">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-oceano">O pipeline por dentro</p>
      <h1 id="pipeline-titulo" className="mt-4 max-w-4xl text-[2.75rem] sm:text-6xl lg:text-7xl">
        A fila não é uma foto. <span className="whitespace-nowrap text-oceano">É um pulso.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-[17px] text-tinta-soft">
        941 pedidos de cirurgia e 1.505 eventos clínicos entram. Sai uma fila em oito níveis, com um recibo por
        posição. O sistema propõe; o médico decide.
      </p>

      <div className="mt-14">
        <svg className="pl-abertura-traco hidden md:block" viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true">
          <path d={TRACO} pathLength={1} />
        </svg>
        <ol className="grid gap-3 md:mt-2 md:grid-cols-5">
          {ETAPAS.map((e, i) => (
            <li key={e.alvo} className="anim-subir" style={{ animationDelay: `${180 + i * 120}ms` }}>
              <button
                type="button"
                onClick={() => irPara(e.alvo)}
                className="group flex h-full w-full flex-col rounded-xl border border-linha bg-white p-4 text-left transition-colors hover:border-petroleo/40"
              >
                <span className="flex items-center justify-between">
                  <span className="font-titulo text-3xl font-semibold leading-none text-agua" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="grid size-9 place-items-center rounded-lg bg-nevoa-50 text-oceano">
                    <e.icone size={18} />
                  </span>
                </span>
                <span className="mt-4 text-sm font-semibold text-tinta group-hover:text-petroleo">{e.titulo}</span>
                <span className="tabular mt-1 font-titulo text-xl font-bold text-petroleo">{e.metrica}</span>
                <span className="mt-0.5 text-[13px] text-tinta-soft">{e.rotulo}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-6 text-[13px] text-tinta-soft">
        Dados sintéticos do desafio. Todos os números saem da execução do pipeline no dataset completo.
      </p>
    </section>
  )
}
