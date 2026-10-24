import { useEffect, useState, type FormEvent } from 'react'
import { CircleCheck } from 'lucide-react'
import { ehOncologico, filaPermitida, NOME_FILA, ORDEM_FILAS, PRAZO_FILA, type FilaCodigo } from '../data/fila'
import { rotuloMarcacao } from '../data/revisao'
import type { Marcacao, Paciente } from '../data/types'
import { usePulso } from '../store/PulsoStore'
import { AreaTexto, Botao, Modal, SeloFila, cx, useAviso } from './ui'

const MINIMO = 15

export function ModalAjuste({ paciente, aberto, aoFechar }: { paciente: Paciente; aberto: boolean; aoFechar: () => void }) {
  const { ajustarFila, linha } = usePulso()
  const avisar = useAviso()
  const [nova, setNova] = useState<FilaCodigo>(paciente.fila)
  const [texto, setTexto] = useState('')
  const [tentou, setTentou] = useState(false)
  const [concluido, setConcluido] = useState<{ de: FilaCodigo; posicaoAntes: number } | null>(null)

  useEffect(() => {
    if (aberto) {
      setNova(paciente.fila)
      setTexto('')
      setTentou(false)
      setConcluido(null)
    }
    // reinicia somente ao abrir
  }, [aberto])

  const erroNivel = nova === paciente.fila ? 'Escolha um nível diferente do atual.' : undefined
  const erroTexto = texto.trim().length < MINIMO ? `Mínimo de ${MINIMO} caracteres.` : undefined

  function confirmar(e: FormEvent) {
    e.preventDefault()
    setTentou(true)
    if (erroNivel || erroTexto) return
    const posicaoAntes = linha(paciente.id)?.posicao ?? 0
    ajustarFila(paciente.id, nova, texto.trim())
    setConcluido({ de: paciente.fila, posicaoAntes })
    avisar('Nível ajustado', `${paciente.nome} · ${nova}`)
  }

  if (concluido) {
    const posicao = linha(paciente.id)?.posicao
    return (
      <Modal aberto={aberto} aoFechar={aoFechar} titulo="Nível ajustado">
        <div className="flex items-center gap-2 text-sucesso">
          <CircleCheck size={20} />
          <p className="text-sm font-semibold">Registrado no histórico.</p>
        </div>
        <div className="mt-5 flex items-center gap-2">
          <SeloFila f={concluido.de} /> <span aria-hidden="true">→</span> <SeloFila f={paciente.fila} />
        </div>
        {posicao && (
          <p className="tabular mt-4 text-[15px]">
            Posição: <strong>{concluido.posicaoAntes}</strong> → <strong className="text-petroleo">{posicao}</strong>
          </p>
        )}
        <Botao className="mt-7 w-full" onClick={aoFechar}>
          Fechar
        </Botao>
      </Modal>
    )
  }

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo="Ajustar nível" subtitulo={`${paciente.nome} · ${paciente.procedimento}`}>
      <form onSubmit={confirmar} noValidate>
        <fieldset>
          <legend className="sr-only">Novo nível</legend>
          <div className="grid gap-1.5">
            {ORDEM_FILAS.map((f) => {
              const ok = filaPermitida(f, paciente.cid)
              return (
                <label
                  key={f}
                  className={cx(
                    'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors',
                    nova === f ? 'border-petroleo bg-nevoa-50' : 'border-linha hover:border-petroleo/40',
                    !ok && 'cursor-not-allowed opacity-45',
                  )}
                >
                  <input
                    type="radio"
                    name="nivel"
                    value={f}
                    checked={nova === f}
                    disabled={!ok}
                    onChange={() => setNova(f)}
                    className="size-4 accent-petroleo"
                  />
                  <SeloFila f={f} compacto />
                  <span className="text-[13px]">{NOME_FILA[f]}</span>
                  <span className="tabular ml-auto text-xs text-tinta-soft">
                    {f === paciente.fila ? 'atual' : `${PRAZO_FILA[f]} d`}
                  </span>
                </label>
              )
            })}
          </div>
          {ehOncologico(paciente.cid) && (
            <p className="mt-2 text-[13px] text-tinta-soft">{paciente.cid}: não pode ir abaixo de G3.</p>
          )}
          {tentou && erroNivel && <p className="mt-2 text-[13px] font-medium text-urgente">{erroNivel}</p>}
        </fieldset>

        <div className="mt-5">
          <AreaTexto rotulo="Justificativa" erro={tentou ? erroTexto : undefined} valor={texto} aoMudar={setTexto} minimo={MINIMO} />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Botao type="button" variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit">Confirmar</Botao>
        </div>
      </form>
    </Modal>
  )
}

export function rotulosDecisao(m: Marcacao) {
  return m.proposta
    ? { confirmar: 'Confirmar alteração', manter: 'Manter nível atual' }
    : { confirmar: 'Marcar como resolvida', manter: 'Dispensar' }
}

export function ModalDecisao({
  marcacao,
  paciente,
  decisao,
  aoFechar,
  aoDecidir,
}: {
  marcacao: Marcacao | null
  paciente?: Paciente
  decisao: 'confirmar' | 'manter'
  aoFechar: () => void
  aoDecidir?: (m: Marcacao, decisao: 'confirmar' | 'manter') => void
}) {
  const { decidirMarcacao } = usePulso()
  const [texto, setTexto] = useState('')
  const [tentou, setTentou] = useState(false)

  useEffect(() => {
    setTexto('')
    setTentou(false)
  }, [marcacao, decisao])

  const erro = texto.trim().length < MINIMO ? `Mínimo de ${MINIMO} caracteres.` : undefined

  function enviar(e: FormEvent) {
    e.preventDefault()
    setTentou(true)
    if (erro || !marcacao) return
    decidirMarcacao(marcacao.id, decisao, texto.trim())
    aoDecidir?.(marcacao, decisao)
    aoFechar()
  }

  return (
    <Modal
      aberto={!!marcacao}
      aoFechar={aoFechar}
      titulo={marcacao ? rotulosDecisao(marcacao)[decisao] : ''}
      subtitulo={paciente && `${paciente.nome} · ${paciente.procedimento}`}
    >
      {marcacao && (
        <form onSubmit={enviar} noValidate>
          {marcacao.proposta && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <SeloFila f={marcacao.proposta.de} nome />
              {decisao === 'confirmar' && (
                <>
                  <span aria-hidden="true">→</span> <SeloFila f={marcacao.proposta.para} nome />
                </>
              )}
            </div>
          )}
          <p className="rounded-lg bg-nevoa-50 px-4 py-3 text-sm">
            <span className="font-semibold text-petroleo">{rotuloMarcacao(marcacao.marcacao)}: </span>
            {marcacao.descricao}
          </p>
          <div className="mt-5">
            <AreaTexto rotulo="Justificativa" erro={tentou ? erro : undefined} valor={texto} aoMudar={setTexto} minimo={MINIMO} />
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
