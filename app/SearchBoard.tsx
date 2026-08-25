"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AirportField } from "./AirportField";
import { getAirport, labelAirport } from "@/lib/airports";
import { nextErrorDates, searchFlights } from "@/lib/engine";
import type { Offer, SearchResponse } from "@/lib/types";

function defaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
  unknown_route: "Ese aeropuerto no está en la red. Prueba un IATA (BCN, JFK, NRT…).",
  same_airport: "Origen y destino no pueden ser el mismo.",
};

function Card({ offer, title }: { offer: Offer; title: string }) {
  const saved = offer.savedEur && offer.savedEur > 0 ? offer.savedEur : null;
  const badgeClass =
    offer.bucket === "hidden_city" ? "hard" : offer.bucket === "simple" ? "" : "save";
  return (
    <article className={`card ${offer.bucket}`}>
      <div className="card-top">
        <div>
          <span className={`badge ${badgeClass}`}>{title}</span>
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
          {saved ? (
            <span>ahorras {euro(saved)} vs el directo estándar</span>
          ) : offer.bucket === "simple" ? (
            <span>precio de referencia (directo)</span>
          ) : (
            <span>no mejora el directo</span>
          )}
        </div>
      </div>
      <p className="explain">{offer.explanation}</p>
      <div className="meta">
        {offer.airlines.join(" + ")}
        {offer.stops.length ? ` · escala ${offer.stops.join(", ")}` : " · sin escalas"}
        {offer.layoverMinutes > 0 ? ` · espera ${minutesLabel(offer.layoverMinutes)}` : ""}
        {offer.kind === "hidden_city" && offer.ticketedDest ? ` · billete hasta ${offer.ticketedDest}` : ""}
        {" · "}billete {euro(offer.baseEur)}
        {offer.extrasEur > 0 ? ` + extras ${euro(offer.extrasEur)}` : ""}
        {" · ilustrativo"}
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
            <span className="badge hard">maleta facturada seguiría hasta el destino del billete</span>
          )}
        </div>
      )}
    </article>
  );
}

export function SearchBoard() {
  const [origin, setOrigin] = useState("BCN");
  const [dest, setDest] = useState("FCO");
  const [date, setDate] = useState(defaultDate);
  const [maxLayoverHours, setMaxLayoverHours] = useState(4);
  const [bags, setBags] = useState(0);
  const [bagKg, setBagKg] = useState<23 | 32>(23);
  const [seat, setSeat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);

  const destName = useMemo(() => {
    const a = getAirport(dest);
    return a ? labelAirport(a) : dest;
  }, [dest]);

  const errorHints = useMemo(() => nextErrorDates(origin, dest, date, 24).slice(0, 4), [origin, dest, date]);

  function run(nextDate = date) {
    setError(null);
    if (!origin || !dest) {
      setError("Elige origen y destino");
      setResult(null);
      return;
    }
    setDate(nextDate);
    setResult(
      searchFlights({
        origin,
        dest,
        date: nextDate,
        maxLayoverHours,
        bags,
        bagKg,
        seat,
      }),
    );
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    run(date);
  }

  useEffect(() => {
    if (!result) return;
    setResult(
      searchFlights({
        origin,
        dest,
        date,
        maxLayoverHours,
        bags,
        bagKg,
        seat,
      }),
    );
    // Recalculate extras/layover on the last searched route without forcing origin edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxLayoverHours, bags, bagKg, seat]);

  return (
    <>
      <form className="search world" onSubmit={onSubmit}>
        <AirportField label="Origen" value={origin} onChange={setOrigin} />
        <AirportField label="Destino" value={dest} onChange={setDest} />
        <label>
          Ida
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Espera máx. en escala
          <select
            value={String(maxLayoverHours)}
            onChange={(e) => setMaxLayoverHours(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 6, 8, 12].map((h) => (
              <option key={h} value={h}>
                {h} h
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Buscar</button>
      </form>

      <div className="extras">
        <label>
          Maletas facturadas
          <select value={String(bags)} onChange={(e) => setBags(Number(e.target.value))}>
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Kg por maleta
          <select value={String(bagKg)} onChange={(e) => setBagKg(Number(e.target.value) === 32 ? 32 : 23)}>
            <option value={23}>23 kg</option>
            <option value={32}>32 kg</option>
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={seat} onChange={(e) => setSeat(e.target.checked)} />
          Elegir asiento (+24 €)
        </label>
      </div>
      <p className="ref">
        Maleta 23 kg = 32 € · 32 kg = 48 €. Sin maleta facturada la ciudad oculta puede aparecer. Con
        maleta, no: el equipaje iría al destino del billete.
      </p>
      {error && <p className="error">{error}</p>}

      {result && result.emptyReason && !result.simple && (
        <p className="empty">{EMPTY[result.emptyReason]}</p>
      )}

      {result?.simple && (
        <div className="results">
          {result.hasErrorNow ? (
            <p className="banner error-now">
              En esta fecha el modelo marca una <strong>tarifa error</strong> en {result.origin}–
              {result.dest}: el directo sale {euro(result.errorFare?.baseEur ?? 0)} en vez de{" "}
              {euro(result.simple.baseEur)}.
            </p>
          ) : (
            <p className="banner">
              No hay tarifa error en {date} para esta ruta.
              {errorHints.length > 0 && (
                <>
                  {" "}
                  Fechas con glitch ilustrativo:{" "}
                  {errorHints.map((d) => (
                    <button key={d} type="button" className="date-chip" onClick={() => run(d)}>
                      {d}
                    </button>
                  ))}
                </>
              )}
            </p>
          )}

          {result.detourBeatsSimple ? (
            <p className="banner save">
              Sí ahorras frente al directo estándar: {euro(result.detour?.savedEur ?? 0)} con una
              escala (espera {minutesLabel(result.detour?.layoverMinutes ?? 0)}).
            </p>
          ) : (
            <p className="banner">
              En {result.origin}→{result.dest} el directo gana dentro de {maxLayoverHours} h de espera.
              Sube el tiempo de escala o prueba otra fecha.
            </p>
          )}

          <Card offer={result.simple} title="Directo estándar" />
          {result.errorFare ? <Card offer={result.errorFare} title="Tarifa error" /> : null}
          {result.detour ? (
            <Card offer={result.detour} title="Más barato con escala" />
          ) : (
            <p className="empty">
              No hay una escala más barata hacia {destName} con {maxLayoverHours} h de espera.
            </p>
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
          ) : bags > 0 ? (
            <p className="meta">Ciudad oculta oculta: llevas maleta facturada.</p>
          ) : null}
        </div>
      )}
    </>
  );
}
