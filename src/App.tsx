import Sidebar from "./components/Sidebar";
import { useRota } from "./router";
import VisaoGeral from "./screens/VisaoGeral";
import Fila from "./screens/Fila";
import Agenda from "./screens/Agenda";
import RevisaoHumana from "./screens/RevisaoHumana";
import Pendencias from "./screens/Pendencias";
import Dados from "./screens/Dados";

export default function App() {
  const { rota, navegar } = useRota("visao");

  return (
    <div className="app">
      <Sidebar rota={rota} navegar={navegar} />
      <main className="main">
        {rota === "visao" && <VisaoGeral />}
        {rota === "fila" && <Fila />}
        {rota === "agenda" && <Agenda />}
        {rota === "revisao" && <RevisaoHumana />}
        {rota === "pendencias" && <Pendencias />}
        {rota === "dados" && <Dados />}
      </main>
    </div>
  );
}
