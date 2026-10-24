import { useState } from "react";
import Icon from "./Icon";
import { iniciais, ORDEM_FILAS, type FilaCodigo } from "../data/fila";
import type { ItemFilaApi } from "../data/api";
import { dataBr, diaSemana, familiaDe } from "../data/derivar";

const FILTROS: Array<"Todas" | FilaCodigo> = ["Todas", ...ORDEM_FILAS];

interface Props {
  itens: ItemFilaApi[];
  onSelect?: (item: ItemFilaApi) => void;
}

export default function FilaTable({ itens, onSelect }: Props) {
  const [filtro, setFiltro] = useState<"Todas" | FilaCodigo>("Todas");
  const visiveis = itens.filter((i) => filtro === "Todas" || i.fila === filtro);

  return (
    <section className="panel">
      <div className="phead">
        <div>
          <div className="t">Ordem de atendimento</div>
          <div className="sub">prazo-limite conforme a ordem da fila</div>
        </div>
        <div className="chiprow">
          {FILTROS.map((f) => (
            <span
              key={f}
              className={`fchip${filtro === f ? " on" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setFiltro(f)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFiltro(f)}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="thead">
        <div className="c-ord">#</div>
        <div className="c-pac">Paciente</div>
        <div className="c-dat">Prazo-limite</div>
        <div className="c-proc">Procedimento</div>
        <div className="c-hosp">Hospital</div>
        <div className="c-fila">Fila</div>
      </div>

      {visiveis.map((item) => {
        const fam = familiaDe(item.fila);
        return (
          <div
            className={`trow ${fam}`}
            key={item.solicitacao_id}
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
            <div className="c-ord ord">{item.posicao}</div>
            <div className="c-pac pac">
              <span className="av">{iniciais(item.paciente_nome)}</span>
              <div>
                <div className="nm">{item.paciente_nome}</div>
                <div className="id">{item.paciente_id}</div>
              </div>
            </div>
            <div className="c-dat dat">
              <div className="d">{dataBr(item.data_limite_efetiva)}</div>
              <div className="w">{diaSemana(item.data_limite_efetiva)}</div>
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
