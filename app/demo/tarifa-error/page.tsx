import Link from "next/link";

export default function ErrorFareDemo() {
  return (
    <main className="shell">
      <header className="mast">
        <div className="brand">
          maqueta v2
          <strong>Tarifa error</strong>
        </div>
        <p>
          Esto no es un buscador. Una tarifa error dura 2–12 horas. El producto correcto es una
          alerta, no una caja de fechas.
        </p>
        <div className="stamp">ejemplo estático</div>
      </header>
      <article className="card detour">
        <span className="badge save">glitch · BCN → FCO</span>
        <div className="card-top" style={{ marginTop: 12 }}>
          <div className="times">
            <div>
              <b>1.000 €</b>
              <small>precio “normal”</small>
            </div>
            <div>
              <b>198 €</b>
              <small>publicado ahora</small>
            </div>
          </div>
          <div className="price">
            198 €
            <span>802 € por debajo del precio de cabecera</span>
          </div>
        </div>
        <p className="explain">
          Así se vería una tarifa error: el mismo BCN–Roma de siempre, mal etiquetado por la
          aerolínea. En Desvío v1 esto no se busca. Si construimos v2, será un ping (Telegram o
          email) el minuto en que el precio se cae, no otra pestaña de Skyscanner.
        </p>
      </article>
      <p className="demo-note">
        <Link href="/">← volver al buscador</Link>
      </p>
    </main>
  );
}
