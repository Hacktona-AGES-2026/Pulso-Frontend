import Icon, { type IconName } from "./Icon";
import type { Rota } from "../router";
import { useApi } from "../data/useApi";
import { api } from "../data/api";

interface ItemNav {
  rota: Rota;
  rotulo: string;
  icone: IconName;
}

const ITENS: ItemNav[] = [
  { rota: "visao", rotulo: "Visão geral", icone: "grid" },
  { rota: "fila", rotulo: "Fila", icone: "list" },
  { rota: "agenda", rotulo: "Agenda", icone: "calendar" },
  { rota: "mudancas", rotulo: "Caixa do médico", icone: "inbox" },
  { rota: "revisao", rotulo: "Revisão humana", icone: "flag" },
  { rota: "pendencias", rotulo: "Pendências", icone: "check-square" },
  { rota: "dados", rotulo: "Dados", icone: "database" },
];

interface Props {
  rota: Rota;
  navegar: (r: Rota) => void;
}

export default function Sidebar({ rota, navegar }: Props) {
  // Badge da Caixa do médico = mudanças aguardando decisão.
  const mudancas = useApi(() => api.mudancas("pendente"), []);
  const badges: Partial<Record<Rota, number>> = {
    mudancas: mudancas.dados?.length,
  };
  return (
    <aside className="side">
      <div className="brand">
        <span className="mk">
          <Icon name="Pulso" size={20} strokeWidth={2.2} />
        </span>
        Pulso
      </div>

      {ITENS.map((it) => (
        <button
          key={it.rota}
          className={`nav${rota === it.rota ? " on" : ""}`}
          type="button"
          onClick={() => navegar(it.rota)}
        >
          <span className="l">
            <Icon name={it.icone} size={20} strokeWidth={2.1} />
            {it.rotulo}
          </span>
          {badges[it.rota] != null && <span className="badge">{badges[it.rota]}</span>}
        </button>
      ))}

      <div className="foot">
        <span className="av">HD</span>
        <div>
          <div className="nm">Dra. Helena Duarte</div>
          <div className="rl">Regulação</div>
        </div>
      </div>
    </aside>
  );
}
