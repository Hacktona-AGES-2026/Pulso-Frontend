import Icon, { type IconName } from "./Icon";
import { KPIS, type IconeKpi } from "../data/fila";

const ICONE: Record<IconeKpi, IconName> = {
  users: "users",
  target: "target",
  alarm: "alarm",
  flag: "flag",
  phone: "phone",
};

export default function KpiRow() {
  return (
    <div className="kpis">
      {KPIS.map((k) => (
        <div className="kpi" key={k.rotulo}>
          <span className="ic" style={{ background: k.fundo, color: k.cor }}>
            <Icon name={ICONE[k.icone]} size={20} strokeWidth={2} />
          </span>
          <b>{k.valor}</b>
          <small>{k.rotulo}</small>
        </div>
      ))}
    </div>
  );
}
