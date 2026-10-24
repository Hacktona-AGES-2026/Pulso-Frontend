import PageHeader from "../components/PageHeader";
import Icon from "../components/Icon";
import { FILA, FAMILIA_DA_FILA, iniciais } from "../data/fila";

function chave(d: string): number {
  const [dia, mes, ano] = d.split("/").map(Number);
  return ano * 10000 + mes * 100 + dia;
}

export default function Agenda() {
  const hospitais = [...new Set(FILA.map((i) => i.hospital))];

  return (
    <>
      <PageHeader titulo="Agenda cirúrgica" subtitulo="casos por hospital, na ordem da fila" />

      <div className="agenda">
        {hospitais.map((h) => {
          const casos = FILA.filter((i) => i.hospital === h).sort((a, b) => chave(a.dataCirurgia) - chave(b.dataCirurgia));
          return (
            <section className="hospcol" key={h}>
              <div className="hosphead">
                <span className="hospic"><Icon name="pin" size={16} strokeWidth={2} /></span>
                <div>
                  <div className="hospname">{h}</div>
                  <div className="hospn">{casos.length} cirurgia{casos.length > 1 ? "s" : ""}</div>
                </div>
              </div>
              {casos.map((c) => {
                const fam = FAMILIA_DA_FILA[c.fila];
                return (
                  <div className={`agcard ${fam}`} key={c.paciente.id}>
                    <div className="agdate">
                      <Icon name="calendar" size={14} strokeWidth={2} />
                      {c.dataCirurgia}
                      <span className={`pill p-${fam}`}>{c.fila}</span>
                    </div>
                    <div className="agproc">{c.procedimento}</div>
                    <div className="agpac">
                      <span className="av">{iniciais(c.paciente.nome)}</span>
                      {c.paciente.nome}
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </>
  );
}
