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
          De cualquier aeropuerto a cualquier otro. Directo estándar, escala más barata, tarifa
          error si el modelo la marca en esa fecha, y ciudad oculta opcional. Maletas, kilos y
          asiento suman al total.
        </p>
        <div className="stamp">no es skyscanner</div>
      </header>
      <SearchBoard />
      <p className="demo-note">
        Precios ilustrativos en el cliente (aún no hay GDS). La maqueta clásica de glitch está en{" "}
        <Link href="/demo/tarifa-error">/demo/tarifa-error</Link>.
      </p>
    </main>
  );
}
