import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { FAMILIA_DA_FILA, type Severidade } from "../data/fila";
import { MARCACOES } from "../data/revisao";

const FILTROS: Array<"todas" | Severidade> = ["todas", "alta", "media", "baixa", "informativa"];
const ROTULO: Record<string, string> = {
  todas: "Todas", alta: "Alta", media: "Média", baixa: "Baixa", informativa: "Informativa",
};

export default function RevisaoHumana() {
  const [filtro, setFiltro] = useState<"todas" | Severidade>("todas");
  const itens = MARCACOES.filter((m) => filtro === "todas" || m.severidade === filtro);

  return (
    <>
      <PageHeader titulo="Revisão humana" subtitulo="marcações que pedem decisão do regulador, por severidade" />

      <div className="chiprow stand">
        {FILTROS.map((f) => (
          <button key={f} className={`fchip btn${filtro === f ? " on" : ""}`} onClick={() => setFiltro(f)}>
            {ROTULO[f]}
          </button>
        ))}
      </div>

      <section className="panel">
        <div className="thead lrow-grid">
          <div>Severidade</div>
          <div>Paciente</div>
          <div>Marcação</div>
          <div className="right">Fila</div>
        </div>
        {itens.map((m, i) => (
          <div className="trow lrow-grid" key={m.sid + i}>
            <div className="sevcell">
              <span className={`sevdot ${m.severidade}`} />
              <span className={`sevlabel ${m.severidade}`}>{ROTULO[m.severidade]}</span>
            </div>
            <div>
              <div className="nm">{m.paciente}</div>
              <div className="id">{m.sid}</div>
            </div>
            <div>
              <div className="nm">{m.marcacao.replace(/_/g, " ")}</div>
              <div className="od">{m.descricao}</div>
            </div>
            <div className="right">
              <span className={`pill p-${FAMILIA_DA_FILA[m.fila]}`}>{m.fila}</span>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
