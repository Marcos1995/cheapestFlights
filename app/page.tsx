import Link from "next/link";
import { SearchBoard } from "./SearchBoard";

export default function HomePage() {
  return (
    <main className="shell">
      <header className="mast">
        <div>
          <div className="brand">
            comparador raro
            <strong>Desvío</strong>
          </div>
        </div>
        <p>
          Al abrir ya se busca. Luego solo filtras. Únicamente tarifas error o ciudad oculta (te bajas en
          la escala), con cuánto ahorras. Si no hay, no hay listado tipo Google Flights.
        </p>
        <div className="stamp">precios reales</div>
      </header>
      <SearchBoard />
      <p className="demo-note">
        Precios en vivo vía Kiwi.com. Una pasada al entrar; luego filtros. Maqueta
        estática: <Link href="/demo/tarifa-error">/demo/tarifa-error</Link>.
      </p>
    </main>
  );
}
