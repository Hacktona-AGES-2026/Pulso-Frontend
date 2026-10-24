import type { ReactNode } from "react";

interface Props {
  titulo: string;
  subtitulo?: string;
  children?: ReactNode;
}

export default function PageHeader({ titulo, subtitulo, children }: Props) {
  return (
    <div className="top">
      <div>
        {subtitulo && <div className="hello">{subtitulo}</div>}
        <h1>{titulo}</h1>
      </div>
      {children && <div className="act">{children}</div>}
    </div>
  );
}
