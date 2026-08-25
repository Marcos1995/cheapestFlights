"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { Offer, SearchResponse } from "@/lib/types";
import catalog from "@/lib/catalog.json";

const DESTINATIONS = catalog.destinations as string[];
const AIRPORTS = catalog.airports as Record<string, { city: string; name: string }>;

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}

function euro(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function minutesLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

const EMPTY: Record<NonNullable<SearchResponse["emptyReason"]>, string> = {
  past_date: "Esa fecha ya pasó. Elige un día de hoy en adelante.",
  unknown_route: "Aún no cubrimos esa ruta. Prueba BCN → FCO.",
  no_simple: "No hay un vuelo simple en el catálogo para esa pareja.",
  no_detour: "Hay vuelo simple, pero ningún desvío más barato dentro de tu tiempo extra.",
  no_hidden_city: "No hay plantilla de ciudad oculta para esa ruta.",
};

function Card({ offer, title }: { offer: Offer; title: string }) {
  const saved = offer.savedEur && offer.savedEur > 0 ? offer.savedEur : null;
  return (
    <article className={`card ${offer.bucket}`}>
      <div className="card-top">
        <div>
          <span className={`badge ${offer.bucket === "hidden_city" ? "hard" : offer.bucket === "detour" ? "save" : ""}`}>
            {title}
          </span>
          <div className="times">
            <div>
              <b>{offer.depart}</b>
              <small>sale</small>
            </div>
            <div>
              <b>{offer.arrive}</b>
              <small>llega · {minutesLabel(offer.durationMin)}</small>
            </div>
          </div>
        </div>
        <div className="price">
          {euro(offer.priceEur)}
          {saved ? <span>ahorras {euro(saved)} frente al simple</span> : <span>precio de referencia</span>}
        </div>
      </div>
      <p className="explain">{offer.explanation}</p>
      <div className="meta">
        {offer.airlines.join(" + ")}
        {offer.stops.length ? ` · escalas ${offer.stops.join(", ")}` : " · sin escalas"}
        {offer.kind === "nearby" && offer.ticketedDest ? ` · aterrizas en ${offer.ticketedDest}` : ""}
        {offer.kind === "hidden_city" && offer.ticketedDest ? ` · billete hasta ${offer.ticketedDest}` : ""}
        {" · fuente mock"}
      </div>
      {offer.riskFlags.length > 0 && (
        <div className="flags">
          {offer.riskFlags.includes("self_transfer") && (
            <span className="badge">dos billetes · sin protección de enlace</span>
          )}
          {offer.riskFlags.includes("hidden_city") && (
            <span className="badge hard">contrato de la aerolínea en contra</span>
          )}
          {offer.riskFlags.includes("checked_bag_hidden_city") && (
            <span className="badge hard">maleta facturada sigue hasta el destino del billete</span>
          )}
        </div>
      )}
    </article>
  );
}

export function SearchBoard() {
  const [dest, setDest] = useState("FCO");
  const [date, setDate] = useState(defaultDate);
  const [maxExtraHours, setMaxExtraHours] = useState(6);
  const [referencePrice, setReferencePrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);

  const destLabel = useMemo(() => {
    const a = AIRPORTS[dest];
    return a ? `${a.city} (${dest})` : dest;
  }, [dest]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: "BCN",
          dest,
          date,
          maxExtraHours,
          referencePrice: referencePrice ? Number(referencePrice) : undefined,
        }),
      });
      const data = (await res.json()) as SearchResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudo buscar");
        setResult(null);
        return;
      }
      setResult(data);
    } catch {
      setError("Red caída. Reintenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="search" onSubmit={onSubmit}>
        <label>
          Origen
          <input value="Barcelona (BCN)" readOnly />
        </label>
        <label>
          Destino
          <select value={dest} onChange={(e) => setDest(e.target.value)}>
            {DESTINATIONS.map((code) => (
              <option key={code} value={code}>
                {AIRPORTS[code]?.city ?? code} ({code})
              </option>
            ))}
          </select>
        </label>
        <label>
          Ida
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Tiempo extra máx.
          <select
            value={String(maxExtraHours)}
            onChange={(e) => setMaxExtraHours(Number(e.target.value))}
          >
            {[2, 4, 6, 8, 12].map((h) => (
              <option key={h} value={h}>
                {h} horas
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </form>
      <p className="ref">
        Opcional, el precio que viste tú:{" "}
        <input
          type="number"
          min={1}
          placeholder="€"
          value={referencePrice}
          onChange={(e) => setReferencePrice(e.target.value)}
          style={{ width: 80, font: "inherit", background: "transparent", border: "none", borderBottom: "1px solid #1c1712" }}
        />{" "}
        no se scrapea Google. Solo sirve para compararte.
      </p>
      {error && <p className="error">{error}</p>}

      {result && result.emptyReason && !result.simple && (
        <p className="empty">{EMPTY[result.emptyReason]}</p>
      )}

      {result?.simple && (
        <div className="results">
          <Card offer={result.simple} title="Vuelo simple" />
          {result.detour ? (
            <Card offer={result.detour} title="Desvío legal" />
          ) : (
            <p className="empty">No hay un desvío legal más barato hacia {destLabel} con ese tiempo extra.</p>
          )}
          {result.hiddenCity ? (
            <div className="hidden-wrap">
              <details>
                <summary>Ciudad oculta — más barato, contrato en contra. Ábrelo si aceptas el riesgo.</summary>
                <div style={{ marginTop: 12 }}>
                  <Card offer={result.hiddenCity} title="Ciudad oculta" />
                </div>
              </details>
            </div>
          ) : null}
          {result.referencePrice ? (
            <p className="meta">
              Tu precio de referencia: {euro(result.referencePrice)}. El simple del catálogo es{" "}
              {euro(result.simple.priceEur)}.
            </p>
          ) : null}
        </div>
      )}
    </>
  );
}
