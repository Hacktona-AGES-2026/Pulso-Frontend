import Icon from "./Icon";
import { FILA, FAMILIA_DA_FILA, iniciais, type FilaCodigo, type ItemFila } from "../data/fila";

const FILTROS: Array<"Todas" | FilaCodigo> = ["Todas", "G1a", "G1b", "G2", "G4", "G6"];

interface Props {
  onSelect?: (item: ItemFila) => void;
}

export default function FilaTable({ onSelect }: Props) {
  return (
    <section className="panel">
      <div className="phead">
        <div>
          <div className="t">Ordem de atendimento</div>
          <div className="sub">data da cirurgia conforme a ordem da fila</div>
        </div>
        <div className="chiprow">
          {FILTROS.map((f, i) => (
            <span key={f} className={`fchip${i === 0 ? " on" : ""}`}>
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="thead">
        <div className="c-ord">#</div>
        <div className="c-pac">Paciente</div>
        <div className="c-dat">Data da cirurgia</div>
        <div className="c-proc">Procedimento</div>
        <div className="c-hosp">Hospital</div>
        <div className="c-fila">Fila</div>
      </div>

      {FILA.map((item) => {
        const fam = FAMILIA_DA_FILA[item.fila];
        return (
          <div
            className={`trow ${fam}`}
            key={item.paciente.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect?.(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(item);
              }
            }}
          >
            <div className="c-ord ord">{item.ordem}</div>
            <div className="c-pac pac">
              <span className="av">{iniciais(item.paciente.nome)}</span>
              <div>
                <div className="nm">{item.paciente.nome}</div>
                <div className="id">{item.paciente.id}</div>
              </div>
            </div>
            <div className="c-dat dat">
              <div className="d">{item.dataCirurgia}</div>
              <div className="w">{item.diaSemana}</div>
            </div>
            <div className="c-proc proc">{item.procedimento}</div>
            <div className="c-hosp hosp">
              <Icon name="pin" size={15} strokeWidth={2} />
              {item.hospital}
            </div>
            <div className="c-fila">
              <span className={`pill p-${fam}`}>{item.fila}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
