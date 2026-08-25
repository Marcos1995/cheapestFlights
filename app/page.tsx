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
          No es Skyscanner. Busca un desvío: escala más barata que el directo (y sí la vuelas), ciudad
          oculta, o tarifa error. Si no hay nada de eso, te lo decimos y te mandamos a Google Flights.
        </p>
        <div className="stamp">precios reales</div>
      </header>
      <SearchBoard />
      <p className="demo-note">
        Precios en vivo vía Kiwi.com. Si no hay desvío, se cede a Google Flights y Skyscanner. Maqueta
        estática: <Link href="/demo/tarifa-error">/demo/tarifa-error</Link>.
      </p>
    </main>
  );
}
