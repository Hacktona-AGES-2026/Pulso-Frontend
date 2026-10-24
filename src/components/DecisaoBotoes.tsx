import { useState } from "react";
import { api } from "../data/api";

interface Props {
  mudancaId: number;
  medicoId: number | null;
  onDecidido?: () => void;
}

// Aprovar/Rejeitar uma mudança via POST /mudancas/{id}/decisao.
// Rejeitar exige motivo (o backend devolve 409 sem ele).
export default function DecisaoBotoes({ mudancaId, medicoId, onDecidido }: Props) {
  const [rejeitando, setRejeitando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function decidir(decisao: "aprovar" | "rejeitar") {
    if (medicoId == null) {
      setErro("selecione um médico");
      return;
    }
    if (decisao === "rejeitar" && !motivo.trim()) {
      setErro("informe o motivo da rejeição");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await api.decidir(mudancaId, decisao, medicoId, decisao === "rejeitar" ? motivo.trim() : undefined);
      onDecidido?.();
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
      setEnviando(false);
    }
  }

  if (rejeitando) {
    return (
      <div className="decide">
        <input
          autoFocus
          placeholder="Motivo da rejeição…"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && decidir("rejeitar")}
        />
        <button className="rejeitar" disabled={enviando} onClick={() => decidir("rejeitar")}>
          {enviando ? "…" : "Confirmar"}
        </button>
        <button disabled={enviando} onClick={() => { setRejeitando(false); setMotivo(""); setErro(null); }}>
          Cancelar
        </button>
        {erro && <span className="apistate erro" style={{ padding: 0 }}>{erro}</span>}
      </div>
    );
  }

  return (
    <div className="decide">
      <button className="aprovar" disabled={enviando} onClick={() => decidir("aprovar")}>
        {enviando ? "Enviando…" : "Aprovar"}
      </button>
      <button className="rejeitar" disabled={enviando} onClick={() => setRejeitando(true)}>
        Rejeitar
      </button>
      {erro && <span className="apistate erro" style={{ padding: 0 }}>{erro}</span>}
    </div>
  );
}
