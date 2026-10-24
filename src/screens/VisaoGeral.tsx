import { useMemo } from "react";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import Icon from "../components/Icon";
import Estado from "../components/Estado";
import { useApi } from "../data/useApi";
import { api } from "../data/api";
import { descreverMarcacao, familiaDe, kpisDe, regraDeOuroOk } from "../data/derivar";

export default function VisaoGeral() {
  const resumo = useApi(() => api.resumo(), []);
  const fila = useApi(() => api.fila("oficial"), []);
  const alta = useApi(() => api.marcacoes("alta"), []);

  const kpis = useMemo(() => kpisDe(resumo.dados, fila.dados), [resumo.dados, fila.dados]);
  const filas = resumo.dados?.filas ?? [];
  const max = Math.max(1, ...filas.map((f) => f.oficial));
  const altaUnica = useMemo(() => {
    const vistos = new Set<string>();
    return (alta.dados ?? []).filter((m) => (vistos.has(m.solicitacao_id) ? false : vistos.add(m.solicitacao_id)));
  }, [alta.dados]);

  return (
    <>
      <PageHeader titulo="Visão geral" subtitulo="23 de outubro de 2026 · regras v2.0.0">
        {regraDeOuroOk(resumo.dados) && (
          <div className="gold">
            <Icon name="check" size={16} strokeWidth={2.4} />
            Regra de ouro respeitada
          </div>
        )}
      </PageHeader>

      <KpiRow kpis={kpis} />

      <div className="grid2">
        <section className="panel pad">
          <div className="ptitle">Distribuição por fila</div>
          <Estado estado={resumo}>
            <div className="bars">
              {filas.map((f) => (
                <div className="barrow" key={f.codigo}>
                  <span className={`pill p-${familiaDe(f.codigo)}`}>{f.codigo}</span>
                  <span className="bname">{f.nome}</span>
                  <span className="btrack">
                    <span
                      className="bfill"
                      style={{ width: `${(f.oficial / max) * 100}%`, background: `var(--${familiaDe(f.codigo)})` }}
                    />
                  </span>
                  <span className="bnum">{f.oficial}</span>
                </div>
              ))}
            </div>
          </Estado>
        </section>

        <section className="panel pad">
          <div className="ptitle">
            Precisa de olho humano <span className="count-inline">{altaUnica.length}</span>
          </div>
          <Estado estado={alta}>
            {altaUnica.length === 0 && <div className="vazio">sem marcações de alta severidade</div>}
            {altaUnica.map((m) => (
              <div className="olho" key={m.solicitacao_id}>
                <span className="sevdot alta" />
                <div className="otxt">
                  <div className="on">{m.paciente_nome}</div>
                  <div className="od">{descreverMarcacao(m.marcacao, m.descricao)}</div>
                </div>
                <span className={`pill p-${familiaDe(m.fila)}`}>{m.fila}</span>
              </div>
            ))}
          </Estado>
        </section>
      </div>
    </>
  );
}
