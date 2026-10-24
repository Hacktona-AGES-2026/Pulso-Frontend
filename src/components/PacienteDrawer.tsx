import { useEffect, useState } from "react";
import Icon from "./Icon";
import Estado from "./Estado";
import DecisaoBotoes from "./DecisaoBotoes";
import { NOME_FILA, type FilaCodigo } from "../data/fila";
import { useApi } from "../data/useApi";
import { api, type EventoApi, type ItemFilaApi } from "../data/api";
import { dataBr, descreverMarcacao, familiaDe } from "../data/derivar";

type Aba = "resumo" | "sinais" | "tempo" | "flags";

const ABAS: Array<{ id: Aba; rotulo: string }> = [
  { id: "resumo", rotulo: "Resumo" },
  { id: "sinais", rotulo: "Sinais" },
  { id: "tempo", rotulo: "Linha do tempo" },
  { id: "flags", rotulo: "Sinalizações" },
];

interface Props {
  item: ItemFilaApi | null;
  onClose: () => void;
}

export default function PacienteDrawer({ item, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <Conteudo item={item} onClose={onClose} />
    </>
  );
}

function Conteudo({ item, onClose }: { item: ItemFilaApi; onClose: () => void }) {
  const [aba, setAba] = useState<Aba>("resumo");
  const detalhe = useApi(() => api.solicitacao(item.solicitacao_id), [item.solicitacao_id]);
  const medicos = useApi(() => api.medicos(), []);
  const medicoId = medicos.dados?.[0]?.id ?? null;
  const fam = familiaDe(item.fila);
  const nomeFila = NOME_FILA[item.fila as FilaCodigo] ?? item.fila;

  useEffect(() => setAba("resumo"), [item.solicitacao_id]);

  const d = detalhe.dados;
  const motor = (d?.estado_motor ?? {}) as { motivos?: string[]; sinais?: string[] };
  const motivos = motor.motivos ?? [];
  const sinais = motor.sinais ?? [];
  const marcacoes = d?.fila_oficial?.marcacoes ?? item.marcacoes ?? [];

  return (
    <aside className="drawer" role="dialog" aria-modal="true" aria-label="Detalhe do paciente">
      <div className="dhead">
        <div className="dtop">
          <span className="sid">{item.solicitacao_id}</span>
          <button className="xclose" onClick={onClose} aria-label="Fechar">
            <Icon name="close" size={18} strokeWidth={2.2} />
          </button>
        </div>
        <h3>
          <span className={`pill p-${fam}`}>{item.fila}</span> {item.procedimento}
        </h3>
        <div className="dsub">
          <span>{item.paciente_nome}</span>
          <span>CID {item.cid_principal}</span>
          {d?.idade != null && <span>{d.idade} anos</span>}
          {d?.especialidade && <span>{d.especialidade}</span>}
          <span>{item.posicao}º da fila</span>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {ABAS.map((a) => (
          <button key={a.id} role="tab" aria-selected={aba === a.id} className="tab" onClick={() => setAba(a.id)}>
            {a.rotulo}
          </button>
        ))}
      </div>

      <div className="dbody">
        <Estado estado={detalhe}>
          {aba === "resumo" && (
            <>
              <div className="just">
                <b>{item.fila} {nomeFila}</b> ({item.posicao}º) · entrada {dataBr(d?.data_entrada_fila ?? item.data_entrada_fila)} ·
                prazo-limite {dataBr(item.data_limite_efetiva)} · {item.hospital}.
              </div>
              <div className="sectlabel">Justificativa clínica</div>
              <div className="evi">
                <div className="q">{d?.justificativa_clinica || "—"}</div>
              </div>
              {motivos.length > 0 && (
                <>
                  <div className="sectlabel">Motivos da fila</div>
                  {motivos.map((m, i) => (
                    <div className="mk" key={i}>
                      <span className="nm">{m}</span>
                    </div>
                  ))}
                </>
              )}
              <div className="sectlabel">Prioridade manual</div>
              <div className="mk">
                <span className="nm">{d?.prioridade_regulacao ?? "—"}</span>
                <span className="tag">só informativa</span>
              </div>
            </>
          )}

          {aba === "sinais" && (
            <>
              <div className="sectlabel">Sinais detectados pelo motor</div>
              {sinais.length === 0 && <div className="vazio">sem sinais registrados</div>}
              {sinais.map((s, i) => (
                <div className="mk" key={i}>
                  <span className="sevdot informativa" />
                  <span className="nm">{s.replace(/_/g, " ")}</span>
                </div>
              ))}
              {d?.observacoes && (
                <>
                  <div className="sectlabel">Observações</div>
                  <div className="evi"><div className="q">{d.observacoes}</div></div>
                </>
              )}
            </>
          )}

          {aba === "tempo" && (
            <ul className="tl">
              {(d?.eventos ?? []).length === 0 && <div className="vazio">sem eventos</div>}
              {(d?.eventos ?? []).map((ev: EventoApi) => (
                <li key={ev.id} className={ev.processado_em ? "" : "exp"}>
                  <span className="dt">{dataBr(ev.data_evento)}</span>
                  <span className="ev">
                    <b>{ev.tipo_evento.replace(/_/g, " ")}</b>{" "}
                    <span>{ev.resultado}{ev.valor_numerico != null ? ` · ${ev.valor_numerico}` : ""} · {ev.origem}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {aba === "flags" && (
            <>
              <div className="sectlabel">Marcações</div>
              {marcacoes.length === 0 && <div className="vazio">sem marcações</div>}
              {marcacoes.map((m, i) => (
                <div className="mk" key={i}>
                  <span className={`sevdot ${m.severidade}`} />
                  <span className="nm">{m.marcacao.replace(/_/g, " ")}</span>
                  <span className="tag">{m.severidade}</span>
                </div>
              ))}
              <div className="sectlabel">Resumo da marcação</div>
              {marcacoes.length === 0 && <div className="vazio">—</div>}
              {marcacoes.map((m, i) => (
                <div className="evi" key={i}>
                  <div className="t">{m.marcacao.replace(/_/g, " ")}</div>
                  <div className="q">{descreverMarcacao(m.marcacao, m.descricao)}</div>
                </div>
              ))}
            </>
          )}
        </Estado>
      </div>

      {item.mudanca_pendente != null ? (
        <div className="dfoot" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
          <div className="sectlabel" style={{ marginTop: 0 }}>
            Mudança proposta pelo motor
            {item.mudanca_tipo && item.fila_proposta
              ? `: ${item.mudanca_tipo} para ${item.fila_proposta}`
              : ""}
          </div>
          <DecisaoBotoes mudancaId={item.mudanca_pendente} medicoId={medicoId} onDecidido={onClose} />
        </div>
      ) : (
        <div className="dfoot">
          <button disabled title="sem mudança pendente para este paciente">Sem mudança pendente</button>
        </div>
      )}
    </aside>
  );
}
