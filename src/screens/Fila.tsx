import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import FilaTable from "../components/FilaTable";
import PacienteDrawer from "../components/PacienteDrawer";
import Icon from "../components/Icon";
import Estado from "../components/Estado";
import { useApi } from "../data/useApi";
import { api, type ItemFilaApi } from "../data/api";
import { kpisDe, regraDeOuroOk } from "../data/derivar";

export default function Fila() {
  const [sel, setSel] = useState<ItemFilaApi | null>(null);
  const [busca, setBusca] = useState("");

  const fila = useApi(() => api.fila("oficial"), []);
  const resumo = useApi(() => api.resumo(), []);

  const kpis = useMemo(() => kpisDe(resumo.dados, fila.dados), [resumo.dados, fila.dados]);
  const itens = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const todos = fila.dados ?? [];
    if (!q) return todos;
    return todos.filter(
      (i) => i.paciente_nome.toLowerCase().includes(q) || i.solicitacao_id.toLowerCase().includes(q) ||
             i.paciente_id.toLowerCase().includes(q),
    );
  }, [fila.dados, busca]);

  return (
    <>
      <PageHeader titulo="Fila priorizada" subtitulo="23 de outubro de 2026 · regras v2.0.0">
        <label className="search">
          <Icon name="search" size={17} strokeWidth={2} />
          <input
            placeholder="Buscar paciente ou ID…"
            aria-label="Buscar paciente ou ID"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
        {regraDeOuroOk(resumo.dados) && (
          <div className="gold">
            <Icon name="check" size={16} strokeWidth={2.4} />
            Regra de ouro respeitada
          </div>
        )}
      </PageHeader>

      <KpiRow kpis={kpis} />

      <Estado estado={fila}>
        <FilaTable itens={itens} onSelect={setSel} />
      </Estado>

      <PacienteDrawer item={sel} onClose={() => setSel(null)} />
    </>
  );
}
