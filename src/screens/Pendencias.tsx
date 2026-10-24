import PageHeader from "../components/PageHeader";
import Icon from "../components/Icon";
import { FAMILIA_DA_FILA } from "../data/fila";
import { PENDENCIAS } from "../data/pendencias";

export default function Pendencias() {
  return (
    <>
      <PageHeader titulo="Pendências operacionais" subtitulo="contato, faltas, exames e saídas a confirmar" />

      <section className="panel">
        <div className="thead pend-grid">
          <div>Pendência</div>
          <div>Paciente</div>
          <div>Detalhe</div>
          <div className="right">Fila</div>
        </div>
        {PENDENCIAS.map((p, i) => (
          <div className="trow pend-grid" key={p.sid + p.tipo + i}>
            <div className="pendtipo">
              <span className="pendicon">
                <Icon name="phone" size={16} strokeWidth={2} />
              </span>
              {p.rotulo}
            </div>
            <div>
              <div className="nm">{p.paciente}</div>
              <div className="id">{p.sid}</div>
            </div>
            <div className="od">{p.detalhe}</div>
            <div className="right">
              <span className={`pill p-${FAMILIA_DA_FILA[p.fila]}`}>{p.fila}</span>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
