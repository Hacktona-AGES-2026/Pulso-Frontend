import PageHeader from "../components/PageHeader";
import Icon from "../components/Icon";
import Estado from "../components/Estado";
import { iniciais } from "../data/fila";
import { useApi } from "../data/useApi";
import { api } from "../data/api";
import { dataBr, familiaDe } from "../data/derivar";

export default function Agenda() {
  const fila = useApi(() => api.fila("oficial"), []);
  const itens = fila.dados ?? [];
  const hospitais = [...new Set(itens.map((i) => i.hospital))];

  return (
    <>
      <PageHeader titulo="Agenda cirúrgica" subtitulo="casos por hospital, na ordem da fila · data = prazo-limite (não é a data marcada)" />

      <Estado estado={fila}>
        <div className="agenda">
          {hospitais.map((h) => {
            const casos = itens
              .filter((i) => i.hospital === h)
              .sort((a, b) => a.posicao - b.posicao)
              .slice(0, 8);
            return (
              <section className="hospcol" key={h}>
                <div className="hosphead">
                  <span className="hospic"><Icon name="pin" size={16} strokeWidth={2} /></span>
                  <div>
                    <div className="hospname">{h}</div>
                    <div className="hospn">{itens.filter((i) => i.hospital === h).length} na fila</div>
                  </div>
                </div>
                {casos.map((c) => {
                  const fam = familiaDe(c.fila);
                  return (
                    <div className={`agcard ${fam}`} key={c.solicitacao_id}>
                      <div className="agdate">
                        <Icon name="clock" size={14} strokeWidth={2} />
                        <span title="prazo-limite">até {dataBr(c.data_limite_efetiva)}</span>
                        <span className={`pill p-${fam}`}>{c.fila}</span>
                      </div>
                      <div className="agproc">{c.procedimento}</div>
                      <div className="agpac">
                        <span className="av">{iniciais(c.paciente_nome)}</span>
                        {c.paciente_nome}
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      </Estado>
    </>
  );
}
