import type { EstadoApi } from "../data/useApi";

interface Props {
  estado: EstadoApi<unknown>;
  children: React.ReactNode;
}

// Envolve um bloco que depende da API: mostra carregando/erro e só então o conteúdo.
export default function Estado({ estado, children }: Props) {
  if (estado.erro) {
    return (
      <div className="apistate erro">
        <span>Não foi possível carregar: {estado.erro}</span>
        <button className="fchip btn" onClick={estado.recarregar}>
          Tentar de novo
        </button>
      </div>
    );
  }
  if (estado.carregando && estado.dados == null) {
    return <div className="apistate">Carregando…</div>;
  }
  return <>{children}</>;
}
