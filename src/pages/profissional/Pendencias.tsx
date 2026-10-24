import { Link } from 'react-router-dom'
import { CalendarX, FlaskConical, Files, LogOut, PhoneOff, type LucideIcon } from 'lucide-react'
import { SeloFila } from '../../components/ui'
import { PENDENCIAS } from '../../data/pendencias'
import { usePulso } from '../../store/PulsoStore'

const ICONE: Record<string, LucideIcon> = {
  sem_contato: PhoneOff,
  nao_atendeu_2x: PhoneOff,
  faltas_2x: CalendarX,
  hba1c_alta: FlaskConical,
  duplicata_fundida: Files,
  irma_com_evento: Files,
  confirmar_saida: LogOut,
}

export function Pendencias() {
  const { linha } = usePulso()

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="text-[2.5rem]">Pendências operacionais</h1>

      <ul className="mt-6 divide-y divide-linha overflow-hidden rounded-xl border border-linha bg-white">
        <li className="hidden grid-cols-[13rem_minmax(0,14rem)_minmax(0,1fr)_4rem] gap-4 bg-nevoa-50/70 px-5 py-3 text-[13px] text-tinta-soft md:grid" aria-hidden="true">
          <span>Pendência</span>
          <span>Paciente</span>
          <span>Detalhe</span>
          <span className="text-right">Nível</span>
        </li>
        {PENDENCIAS.map((p) => {
          const l = linha(p.sid)
          const Icone = ICONE[p.tipo] ?? PhoneOff
          return (
            <li key={p.sid + p.tipo}>
              <Link
                to={`/profissional/pacientes/${p.sid}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-areia md:grid-cols-[13rem_minmax(0,14rem)_minmax(0,1fr)_4rem] md:items-center"
              >
                <span className="flex items-center gap-2.5 text-sm font-semibold">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-g6-50 text-g6">
                    <Icone size={15} />
                  </span>
                  {p.rotulo}
                </span>
                <span className="col-start-1 md:col-start-auto">
                  <span className="block text-sm font-semibold">{l?.paciente.nome}</span>
                  <span className="tabular block text-xs text-tinta-soft">{p.sid}</span>
                </span>
                <span className="col-start-1 text-[13px] text-tinta-soft md:col-start-auto">{p.detalhe}</span>
                <span className="col-start-2 row-start-1 text-right md:col-start-auto md:row-start-auto">
                  {l && <SeloFila f={l.paciente.fila} compacto />}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
