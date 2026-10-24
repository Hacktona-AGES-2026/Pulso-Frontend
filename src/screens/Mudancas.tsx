import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import Estado from "../components/Estado";
import DecisaoBotoes from "../components/DecisaoBotoes";
import { useApi } from "../data/useApi";
import { api } from "../data/api";
import { dataBr, familiaDe } from "../data/derivar";

type Filtro = "todas" | "subir" | "sair";
const FILTROS: Array<{ id: Filtro; rotulo: string }> = [
  { id: "todas", rotulo: "Todas" },
  { id: "subir", rotulo: "Subir" },
  { id: "sair", rotulo: "Saídas" },
];

export default function Mudancas() {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [medicoId, setMedicoId] = useState<number | null>(null);

  const medicos = useApi(() => api.medicos(), []);
  const mudancas = useApi(() => api.mudancas("pendente"), []);

  useEffect(() => {
    if (medicoId == null && medicos.dados && medicos.dados.length > 0) {
      setMedicoId(medicos.dados[0].id);
    }
  }, [medicos.dados, medicoId]);

  const itens = (mudancas.dados ?? []).filter((m) => filtro === "todas" || m.tipo === filtro);

  return (
    <>
      <PageHeader titulo="Caixa do médico" subtitulo="o motor propõe, o médico decide — mudanças aguardando decisão">
        <label className="search" style={{ gap: 8 }}>
          Decidindo como
          <select
            aria-label="Médico"
            value={medicoId ?? ""}
            onChange={(e) => setMedicoId(Number(e.target.value))}
            style={{ border: "none", background: "transparent", fontFamily: "inherit", fontWeight: 700 }}
          >
            {(medicos.dados ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} · {m.especialidade}
              </option>
            ))}
          </select>
        </label>
      </PageHeader>

      <div className="chiprow stand">
        {FILTROS.map((f) => (
          <button key={f.id} className={`fchip btn${filtro === f.id ? " on" : ""}`} onClick={() => setFiltro(f.id)}>
            {f.rotulo}
          </button>
        ))}
      </div>

      <Estado estado={mudancas}>
        {itens.length === 0 && (
          <section className="panel">
            <div className="vazio" style={{ padding: 16 }}>nenhuma mudança pendente</div>
          </section>
        )}
        <div className="mudlist">
          {itens.map((m) => (
            <section className="panel pad mudcard" key={m.id}>
              <div className="mudtop">
                <span className={`mudtipo ${m.tipo}`}>{m.tipo === "subir" ? "↑ Subir" : "↓ Saída"}</span>
                {m.oncologico && <span className="tag onco">oncológico</span>}
                <div className="mudfilas">
                  {m.fila_atual && <span className={`pill p-${familiaDe(m.fila_atual)}`}>{m.fila_atual}</span>}
                  {m.fila_proposta && (
                    <>
                      <span className="seta">→</span>
                      <span className={`pill p-${familiaDe(m.fila_proposta)}`}>{m.fila_proposta}</span>
                    </>
                  )}
                </div>
                {m.posicao_atual != null && m.posicao_proposta != null && (
                  <span className="mudpos">
                    {m.posicao_atual}º → {m.posicao_proposta}º
                  </span>
                )}
              </div>

              <div className="mudpac">
                <span className="nm">{m.solicitacao_id}</span>
                <span className="id">criada {dataBr(m.criada_em?.slice(0, 10))}</span>
              </div>

              <div className="mudmotivo">{m.motivo}</div>

              {(m.evidencias ?? []).length > 0 && (
                <>
                  <div className="sectlabel">Evidências</div>
                  {(m.evidencias ?? []).map((e, i) => (
                    <div className="evi" key={i}>
                      <div className="t">{(e.tipo ?? "evento").replace(/_/g, " ")}</div>
                      <div className="d">{e.data ? dataBr(e.data) : "sem data"} · {e.origem}</div>
                      <div className="q">{e.trecho}</div>
                    </div>
                  ))}
                </>
              )}

              <div className="mudacao">
                <DecisaoBotoes mudancaId={m.id} medicoId={medicoId} onDecidido={() => mudancas.recarregar()} />
              </div>
            </section>
          ))}
        </div>
      </Estado>
    </>
  );
}
