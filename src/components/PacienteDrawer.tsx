import { useEffect, useState } from "react";
import Icon from "./Icon";
import { FAMILIA_DA_FILA, NOME_FILA, type ItemFila } from "../data/fila";
import { getDetalhe } from "../data/paciente";

type Aba = "resumo" | "sinais" | "tempo" | "flags";

const ABAS: Array<{ id: Aba; rotulo: string }> = [
  { id: "resumo", rotulo: "Resumo" },
  { id: "sinais", rotulo: "Sinais" },
  { id: "tempo", rotulo: "Linha do tempo" },
  { id: "flags", rotulo: "Sinalizações" },
];

interface Props {
  item: ItemFila | null;
  onClose: () => void;
}

export default function PacienteDrawer({ item, onClose }: Props) {
  const [aba, setAba] = useState<Aba>("resumo");

  useEffect(() => {
    setAba("resumo");
  }, [item]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item) return null;
  const fam = FAMILIA_DA_FILA[item.fila];
  const d = getDetalhe(item);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Detalhe do paciente">
        <div className="dhead">
          <div className="dtop">
            <span className="sid">{item.paciente.id}</span>
            <button className="xclose" onClick={onClose} aria-label="Fechar">
              <Icon name="close" size={18} strokeWidth={2.2} />
            </button>
          </div>
          <h3>
            <span className={`pill p-${fam}`}>{item.fila}</span> {item.procedimento}
          </h3>
          <div className="dsub">
            <span>{item.paciente.nome}</span>
            <span>CID —</span>
            <span>{d.idade} anos</span>
            <span>{d.especialidade}</span>
            <span>{d.posicaoFila}º da fila</span>
          </div>
        </div>

        <div className="tabs" role="tablist">
          {ABAS.map((a) => (
            <button
              key={a.id}
              role="tab"
              aria-selected={aba === a.id}
              className="tab"
              onClick={() => setAba(a.id)}
            >
              {a.rotulo}
            </button>
          ))}
        </div>

        <div className="dbody">
          {aba === "resumo" && (
            <>
              <div className="just">
                <b>{item.fila} {NOME_FILA[item.fila]}</b> ({d.posicaoFila}º) · entrada há {d.diasEmFila}d ·
                cirurgia prevista {item.dataCirurgia} · {item.hospital}.
              </div>
              <div className="sectlabel">Motivos da fila</div>
              {d.evidencias.map((e, i) => (
                <Evid key={i} e={e} />
              ))}
              <div className="sectlabel">Prioridade manual</div>
              <div className="mk">
                <span className="nm">{d.prioridadeManual}</span>
                <span className="tag">{d.divergente ? "ℹ divergente dos dados" : "só informativa"}</span>
              </div>
            </>
          )}

          {aba === "sinais" && d.evidencias.map((e, i) => <Evid key={i} e={e} />)}

          {aba === "tempo" && (
            <ul className="tl">
              {d.eventos.map((ev, i) => (
                <li key={i} className={ev.expirado ? "exp" : ""}>
                  <span className="dt">{ev.data}</span>
                  <span className="ev">
                    <b>{ev.titulo}</b> <span>{ev.resultado}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {aba === "flags" && (
            <>
              <div className="sectlabel">Marcações</div>
              {d.marcacoes.length === 0 && <div className="vazio">sem marcações</div>}
              {d.marcacoes.map((m, i) => (
                <div className="mk" key={i}>
                  <span className={`sevdot ${m.severidade}`} />
                  <span className="nm">{m.marcacao.replace(/_/g, " ")}</span>
                  <span className="tag">{m.severidade}</span>
                </div>
              ))}
              <div className="sectlabel">Pendências operacionais</div>
              {d.pendencias.length === 0 && <div className="vazio">sem pendências</div>}
              {d.pendencias.map((p, i) => (
                <div className="mk" key={i}>
                  <span className="sevdot baixa" />
                  <span className="nm">{p.replace(/_/g, " ")}</span>
                  <span className="tag">operacional</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="dfoot">
          <button disabled title="disponível no passo 7">Propor mudança</button>
          <button disabled title="disponível no passo 7">Enviar ao regulador</button>
        </div>
      </aside>
    </>
  );
}

function Evid({ e }: { e: { sinal: string; data?: string; origem: string; trecho: string } }) {
  return (
    <div className="evi">
      <div className="t">{e.sinal}</div>
      <div className="d">{e.data ?? "texto · sem data"} · {e.origem}</div>
      <div className="q">{e.trecho}</div>
    </div>
  );
}
