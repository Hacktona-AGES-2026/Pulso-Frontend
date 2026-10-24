import { useCallback, useEffect, useState } from "react";

export interface EstadoApi<T> {
  dados: T | null;
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

// Busca `fn` ao montar e quando `deps` mudam; expõe carregando/erro e um recarregar manual.
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []): EstadoApi<T> {
  const [dados, setDados] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chamar = useCallback(fn, deps);

  const executar = useCallback(() => {
    let vivo = true;
    setCarregando(true);
    setErro(null);
    chamar()
      .then((d) => vivo && setDados(d))
      .catch((e: unknown) => vivo && setErro(e instanceof Error ? e.message : String(e)))
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [chamar]);

  useEffect(executar, [executar]);

  return { dados, carregando, erro, recarregar: executar };
}
