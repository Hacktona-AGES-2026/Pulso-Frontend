import { useEffect, useState } from "react";

export type Rota = "visao" | "fila" | "agenda" | "mudancas" | "revisao" | "pendencias" | "dados";

const ROTAS: Rota[] = ["visao", "fila", "agenda", "mudancas", "revisao", "pendencias", "dados"];

function atual(def: Rota): Rota {
  const h = window.location.hash.replace(/^#\/?/, "") as Rota;
  return ROTAS.includes(h) ? h : def;
}

export function useRota(def: Rota = "visao") {
  const [rota, setRota] = useState<Rota>(() => atual(def));
  useEffect(() => {
    const on = () => setRota(atual(def));
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, [def]);
  const navegar = (r: Rota) => {
    window.location.hash = `#/${r}`;
  };
  return { rota, navegar };
}
