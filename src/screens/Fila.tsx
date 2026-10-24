import { useState } from "react";
import PageHeader from "../components/PageHeader";
import KpiRow from "../components/KpiRow";
import FilaTable from "../components/FilaTable";
import PacienteDrawer from "../components/PacienteDrawer";
import Icon from "../components/Icon";
import type { ItemFila } from "../data/fila";

export default function Fila() {
  const [sel, setSel] = useState<ItemFila | null>(null);
  return (
    <>
      <PageHeader titulo="Fila priorizada" subtitulo="23 de outubro de 2026 · regras v2.0.0">
        <label className="search">
          <Icon name="search" size={17} strokeWidth={2} />
          <input placeholder="Buscar paciente ou ID…" aria-label="Buscar paciente ou ID" />
        </label>
        <div className="gold">
          <Icon name="check" size={16} strokeWidth={2.4} />
          Regra de ouro respeitada
        </div>
      </PageHeader>
      <KpiRow />
      <FilaTable onSelect={setSel} />
      <PacienteDrawer item={sel} onClose={() => setSel(null)} />
    </>
  );
}
