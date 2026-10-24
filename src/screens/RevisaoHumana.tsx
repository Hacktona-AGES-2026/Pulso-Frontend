import { useState } from "react";
import PageHeader from "../components/PageHeader";
import Estado from "../components/Estado";
import { type Severidade } from "../data/fila";
import { useApi } from "../data/useApi";
import { api } from "../data/api";
import { descreverMarcacao, familiaDe } from "../data/derivar";

const FILTROS: Array<"todas" | Severidade> = ["todas", "alta", "media", "baixa", "informativa"];
const ROTULO: Record<string, string> = {
  todas: "Todas", alta: "Alta", media: "Média", baixa: "Baixa", informativa: "Informativa",
};

export default function RevisaoHumana() {
  const [filtro, setFiltro] = useState<"todas" | Severidade>("todas");
  const marcacoes = useApi(() => api.marcacoes(), []);
  const itens = (marcacoes.dados ?? []).filter((m) => filtro === "todas" || m.severidade === filtro);

  return (
    <>
      <PageHeader titulo="Revisão humana" subtitulo="marcações de qualidade de dados, por severidade · decisões de fila ficam na Caixa do médico" />

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
        <Estado estado={marcacoes}>
          {itens.length === 0 && <div className="vazio" style={{ padding: "16px" }}>nenhuma marcação nesta severidade</div>}
          {itens.map((m, i) => (
            <div className="trow lrow-grid" key={m.solicitacao_id + m.marcacao + i}>
              <div className="sevcell">
                <span className={`sevdot ${m.severidade}`} />
                <span className={`sevlabel ${m.severidade}`}>{ROTULO[m.severidade]}</span>
              </div>
              <div>
                <div className="nm">{m.paciente_nome}</div>
                <div className="id">{m.solicitacao_id}</div>
              </div>
              <div>
                <div className="nm">{m.marcacao.replace(/_/g, " ")}</div>
                <div className="od">{descreverMarcacao(m.marcacao, m.descricao)}</div>
              </div>
              <div className="right">
                <span className={`pill p-${familiaDe(m.fila)}`}>{m.fila}</span>
              </div>
            </div>
          ))}
        </Estado>
      </section>
    </>
  );
}
