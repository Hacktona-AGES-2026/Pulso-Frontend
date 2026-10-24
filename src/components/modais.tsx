import { useEffect, useState, type FormEvent } from 'react'
import { CircleCheck } from 'lucide-react'
import type { Paciente, Prioridade, Revisao } from '../data/types'
import { ORDEM, PRIORIDADES, ehOncologico, permitida, rotuloPrioridade } from '../lib/prioridade'
import { usePulso } from '../store/PulsoStore'
import { AreaTexto, Botao, Modal, SeloPrioridade, cx, useAviso } from './ui'

const MINIMO = 15

export function ModalAjuste({ paciente, aberto, aoFechar }: { paciente: Paciente; aberto: boolean; aoFechar: () => void }) {
  const { ajustarPrioridade, linha } = usePulso()
  const avisar = useAviso()
  const [nova, setNova] = useState<Prioridade>(paciente.prioridade)
  const [texto, setTexto] = useState('')
  const [tentou, setTentou] = useState(false)
  const [concluido, setConcluido] = useState<{ de: Prioridade; posicaoAntes: number } | null>(null)

  useEffect(() => {
    if (aberto) {
      setNova(paciente.prioridade)
      setTexto('')
      setTentou(false)
      setConcluido(null)
    }
    // reinicia somente ao abrir
  }, [aberto])

  const erroPrioridade = nova === paciente.prioridade ? 'Escolha uma prioridade diferente da atual.' : undefined
  const erroTexto = texto.trim().length < MINIMO ? `Escreva ao menos ${MINIMO} caracteres.` : undefined

  function confirmar(e: FormEvent) {
    e.preventDefault()
    setTentou(true)
    if (erroPrioridade || erroTexto) return
    const posicaoAntes = linha(paciente.id)?.posicao ?? 0
    ajustarPrioridade(paciente.id, nova, texto.trim())
    setConcluido({ de: paciente.prioridade, posicaoAntes })
    avisar('Prioridade ajustada', `${paciente.nome} · ${rotuloPrioridade(nova)}`)
  }

  if (concluido) {
    const posicao = linha(paciente.id)?.posicao
    return (
      <Modal aberto={aberto} aoFechar={aoFechar} titulo="Prioridade ajustada">
        <div className="flex items-center gap-2 text-sucesso">
          <CircleCheck size={20} />
          <p className="text-sm font-semibold">Decisão registrada no histórico do paciente.</p>
        </div>
        <div className="mt-5 flex items-center gap-2">
          <SeloPrioridade p={concluido.de} /> <span aria-hidden="true">→</span> <SeloPrioridade p={paciente.prioridade} />
        </div>
        {posicao && (
          <p className="tabular mt-4 text-[15px]">
            Posição na fila: <strong>{concluido.posicaoAntes}</strong> → <strong className="text-petroleo">{posicao}</strong>
          </p>
        )}
        <Botao className="mt-7 w-full" onClick={aoFechar}>
          Voltar ao paciente
        </Botao>
      </Modal>
    )
  }

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Ajustar prioridade"
      subtitulo={
        <>
          {paciente.nome} · {paciente.procedimento}
        </>
      }
    >
      <form onSubmit={confirmar} noValidate>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Nova prioridade <span className="text-urgente" aria-hidden="true">*</span>
          </legend>
          <div className="space-y-2">
            {ORDEM.map((p) => {
              const ok = permitida(p, paciente.cid)
              return (
                <label
                  key={p}
                  className={cx(
                    'flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 transition-colors',
                    nova === p ? 'border-petroleo bg-nevoa-50' : 'border-linha hover:border-petroleo/40',
                    !ok && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <input
                    type="radio"
                    name="prioridade"
                    value={p}
                    checked={nova === p}
                    disabled={!ok}
                    onChange={() => setNova(p)}
                    className="size-4 accent-petroleo"
                  />
                  <SeloPrioridade p={p} compacto />
                  <span className="text-[13px] text-tinta-soft">prazo de {PRIORIDADES[p].prazo} dias</span>
                  {p === paciente.prioridade && (
                    <span className="ml-auto text-xs font-semibold text-petroleo">atual</span>
                  )}
                </label>
              )
            })}
          </div>
          {ehOncologico(paciente.cid) && (
            <p className="mt-2 text-[13px] text-tinta-soft">
              Neoplasia maligna ({paciente.cid}): a prioridade não pode ficar abaixo de B.
            </p>
          )}
          {tentou && erroPrioridade && <p className="mt-2 text-[13px] font-medium text-urgente">{erroPrioridade}</p>}
        </fieldset>

        <div className="mt-5">
          <AreaTexto
            rotulo="Justificativa"
            dica="Fica registrada no histórico de decisões."
            erro={tentou ? erroTexto : undefined}
            valor={texto}
            aoMudar={setTexto}
            minimo={MINIMO}
          />
        </div>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Botao type="button" variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit">Confirmar ajuste</Botao>
        </div>
      </form>
    </Modal>
  )
}

export function ModalDecisao({
  revisao,
  paciente,
  decisao,
  aoFechar,
  aoDecidir,
}: {
  revisao: Revisao | null
  paciente?: Paciente
  decisao: 'confirmar' | 'manter'
  aoFechar: () => void
  aoDecidir?: (revisao: Revisao, decisao: 'confirmar' | 'manter') => void
}) {
  const { decidirRevisao } = usePulso()
  const [texto, setTexto] = useState('')
  const [tentou, setTentou] = useState(false)

  useEffect(() => {
    setTexto('')
    setTentou(false)
  }, [revisao, decisao])

  const erro = texto.trim().length < MINIMO ? `Escreva ao menos ${MINIMO} caracteres.` : undefined
  const confirmar = decisao === 'confirmar'

  function enviar(e: FormEvent) {
    e.preventDefault()
    setTentou(true)
    if (erro || !revisao) return
    decidirRevisao(revisao.id, decisao, texto.trim())
    aoDecidir?.(revisao, decisao)
    aoFechar()
  }

  return (
    <Modal
      aberto={!!revisao}
      aoFechar={aoFechar}
      titulo={confirmar ? 'Confirmar alteração' : 'Manter prioridade atual'}
      subtitulo={paciente && `${paciente.nome} · ${paciente.procedimento}`}
    >
      {revisao && (
        <form onSubmit={enviar} noValidate>
          <div className="flex flex-wrap items-center gap-2">
            {confirmar ? (
              <>
                <SeloPrioridade p={revisao.de} /> <span aria-hidden="true">→</span> <SeloPrioridade p={revisao.para} />
              </>
            ) : (
              <>
                <SeloPrioridade p={revisao.de} />
                <span className="text-[13px] text-tinta-soft">proposta de {revisao.para} recusada</span>
              </>
            )}
          </div>
          <p className="mt-4 rounded-lg bg-nevoa-50 px-4 py-3 text-sm">
            <span className="font-semibold text-petroleo">Motivo da proposta: </span>
            {revisao.motivo}
          </p>
          <div className="mt-5">
            <AreaTexto
              rotulo="Justificativa da decisão"
              dica={confirmar ? 'Ex.: evento clínico confirmado no prontuário.' : 'Ex.: evento sem relação com a indicação cirúrgica.'}
              erro={tentou ? erro : undefined}
              valor={texto}
              aoMudar={setTexto}
              minimo={MINIMO}
            />
          </div>
          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Botao type="button" variante="secundario" onClick={aoFechar}>
              Cancelar
            </Botao>
            <Botao type="submit">Registrar decisão</Botao>
          </div>
        </form>
      )}
    </Modal>
  )
}
