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
          Busca origen y destino concretos, o cualquiera de los dos (o los dos). Un día, un mes
          Lo primero: una tarifa error de verdad (mitad de precio o menos) o, si no, un gran descuento.
        </p>
        <div className="stamp">precios reales</div>
      </header>
      <SearchBoard />
      <p className="demo-note">
        Precios en vivo vía Kiwi.com. Google Flights y Skyscanner se abren con la misma búsqueda. Maqueta
        estática: <Link href="/demo/tarifa-error">/demo/tarifa-error</Link>.
      </p>
    </main>
  );
}
