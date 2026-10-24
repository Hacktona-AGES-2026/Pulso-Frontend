import Icon, { type IconName } from "./Icon";
import { type IconeKpi, type Kpi } from "../data/fila";

const ICONE: Record<IconeKpi, IconName> = {
  users: "users",
  target: "target",
  alarm: "alarm",
  flag: "flag",
  phone: "phone",
};

export default function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="kpis">
      {kpis.map((k) => (
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
