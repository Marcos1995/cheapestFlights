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
          Google Flights te enseña el vuelo obvio. Aquí sale el obvio, el desvío legal más barato,
          y —si lo abres— la ciudad oculta. Solo ida desde Barcelona. Precios de catálogo mock.
        </p>
        <div className="stamp">no es skyscanner</div>
      </header>
      <SearchBoard />
      <p className="demo-note">
        Las tarifas error (un vuelo de 1.000 € a 200 €) no viven en el buscador: duran horas y
        piden alerta, no comparador. Hay una maqueta en{" "}
        <Link href="/demo/tarifa-error">/demo/tarifa-error</Link>.
      </p>
    </main>
  );
}
