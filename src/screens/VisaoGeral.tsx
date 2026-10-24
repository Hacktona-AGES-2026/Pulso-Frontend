import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import Icon from "../components/Icon";
import {
  ORDEM_FILAS,
  NOME_FILA,
  TAMANHO_FILA,
  FAMILIA_DA_FILA,
} from "../data/fila";
import { MARCACOES } from "../data/revisao";

const MAX = Math.max(...ORDEM_FILAS.map((f) => TAMANHO_FILA[f]));

export default function VisaoGeral() {
  const alta = MARCACOES.filter((m) => m.severidade === "alta");
  return (
    <>
      <PageHeader titulo="Visão geral" subtitulo="23 de outubro de 2026 · regras v2.0.0">
        <div className="gold">
          <Icon name="check" size={16} strokeWidth={2.4} />
          Regra de ouro respeitada
        </div>
      </PageHeader>

      <KpiRow />

      <div className="grid2">
        <section className="panel pad">
          <div className="ptitle">Distribuição por fila</div>
          <div className="bars">
            {ORDEM_FILAS.map((f) => (
              <div className="barrow" key={f}>
                <span className={`pill p-${FAMILIA_DA_FILA[f]}`}>{f}</span>
                <span className="bname">{NOME_FILA[f]}</span>
                <span className="btrack">
                  <span
                    className="bfill"
                    style={{ width: `${(TAMANHO_FILA[f] / MAX) * 100}%`, background: `var(--${FAMILIA_DA_FILA[f]})` }}
                  />
                </span>
                <span className="bnum">{TAMANHO_FILA[f]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel pad">
          <div className="ptitle">
            Precisa de olho humano <span className="count-inline">{alta.length}</span>
          </div>
          {alta.map((m) => (
            <div className="olho" key={m.sid}>
              <span className="sevdot alta" />
              <div className="otxt">
                <div className="on">{m.paciente}</div>
                <div className="od">{m.descricao}</div>
              </div>
              <span className={`pill p-${FAMILIA_DA_FILA[m.fila]}`}>{m.fila}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
