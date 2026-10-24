import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { QUARENTENA, FORA_DA_FILA, EXECUCOES, RESUMO_DADOS } from "../data/dados";

type Sub = "quarentena" | "fora" | "execucoes";
const SUBS: Array<{ id: Sub; rotulo: string }> = [
  { id: "quarentena", rotulo: "Quarentena" },
  { id: "fora", rotulo: "Fora da fila" },
  { id: "execucoes", rotulo: "Execuções & versões" },
];

export default function Dados() {
  const [sub, setSub] = useState<Sub>("quarentena");
  const r = RESUMO_DADOS;

  return (
    <>
      <PageHeader titulo="Dados" subtitulo="o que foi corrigido, descartado e registrado na carga" />

      <div className="minis">
        <Mini n={r.lidas} l="lidas" />
        <Mini n={r.unicas} l="únicas" />
        <Mini n={r.ativas} l="ativas" />
        <Mini n={r.duplicatas} l="duplicatas" />
        <Mini n={r.saidas} l="saídas" />
        <Mini n={r.quarentena} l="quarentena" />
        <Mini n={r.duplicados} l="duplicados" />
      </div>

      <div className="chiprow stand">
        {SUBS.map((s) => (
          <button key={s.id} className={`fchip btn${sub === s.id ? " on" : ""}`} onClick={() => setSub(s.id)}>
            {s.rotulo}
          </button>
        ))}
      </div>

      <section className="panel">
        {sub === "quarentena" && (
          <>
            <div className="thead dados-grid">
              <div>Evento</div>
              <div>Motivo</div>
              <div>Detalhe</div>
            </div>
            {QUARENTENA.map((q) => (
              <div className="trow dados-grid" key={q.eventoId}>
                <div className="mono">{q.eventoId}</div>
                <div><span className="motivo">{q.motivo}</span></div>
                <div className="od">{q.detalhe}</div>
              </div>
            ))}
          </>
        )}

        {sub === "fora" && (
          <>
            <div className="thead dados-grid">
              <div>Solicitação</div>
              <div>Situação</div>
              <div>Evidência</div>
            </div>
            {FORA_DA_FILA.map((f) => (
              <div className="trow dados-grid" key={f.sid}>
                <div><div className="nm">{f.paciente}</div><div className="id mono">{f.sid}</div></div>
                <div><span className={`status ${f.status}`}>{f.status === "duplicata" ? "Duplicata" : "Saiu"}</span></div>
                <div className="od">{f.detalhe}</div>
              </div>
            ))}
          </>
        )}

        {sub === "execucoes" && (
          <>
            <div className="thead dados-grid4">
              <div>Versão</div>
              <div>Data</div>
              <div>Regras</div>
              <div>Ativas</div>
            </div>
            {EXECUCOES.map((e) => (
              <div className="trow dados-grid4" key={e.versao}>
                <div className="nm">#{e.versao}</div>
                <div className="mono">{e.data}</div>
                <div className="mono">{e.regras}</div>
                <div><span className="nm">{e.nAtivas}</span> <span className="status duplicata">{e.status}</span></div>
              </div>
            ))}
          </>
        )}
      </section>
    </>
  );
}

function Mini({ n, l }: { n: number; l: string }) {
  return (
    <div className="mini">
      <b>{n}</b>
      <small>{l}</small>
    </div>
  );
}
