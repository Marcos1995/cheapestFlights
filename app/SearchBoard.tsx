"use client";

import { useEffect, useMemo, useState } from "react";
import { AirportField } from "./AirportField";
import { getAirport, labelAirport } from "@/lib/airports";
import { scanWorld } from "@/lib/kiwi";
import { airlineLogo, googleFlightsUrl, kiwiSearchUrl, skyscannerUrl } from "@/lib/links";
import { filterScan, rankFlights } from "@/lib/rank";
import {
  horizonDate,
  isAnywhere,
  isPastDate,
  todayIso,
  type SearchParams,
  type LiveFlight,
} from "@/lib/types";

const AIRLINES = [
  { code: "", name: "Todas" },
  { code: "FR", name: "Ryanair" },
  { code: "VY", name: "Vueling" },
  { code: "IB", name: "Iberia" },
  { code: "UX", name: "Air Europa" },
  { code: "W4", name: "Wizz Air" },
  { code: "U2", name: "easyJet" },
  { code: "LH", name: "Lufthansa" },
  { code: "AF", name: "Air France" },
  { code: "KL", name: "KLM" },
  { code: "BA", name: "British Airways" },
  { code: "AZ", name: "ITA" },
  { code: "TP", name: "TAP" },
  { code: "TK", name: "Turkish Airlines" },
  { code: "EK", name: "Emirates" },
  { code: "QR", name: "Qatar Airways" },
];

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

function dayLabel(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(y, m - 1, d));
}

function pinParams(params: SearchParams, flight: LiveFlight): SearchParams {
  const day = flight.outbound.date || params.date;
  return {
    ...params,
    origin: isAnywhere(params.origin) ? flight.outbound.from : params.origin,
    dest: isAnywhere(params.dest) ? flight.ticketedDest : params.dest,
    date: day,
    dateTo: day,
  };
}

function FlightCard({
  flight,
  params,
  tag,
  saved,
  hard,
  extra,
}: {
  flight: LiveFlight;
  params: SearchParams;
  tag: string;
  saved?: number | null;
  hard?: boolean;
  extra?: string;
}) {
  const names = flight.airlines.map((a) => a.name).join(" + ");
  const pinned = pinParams(params, flight);
  return (
    <article className={`card ${hard ? "hidden_city" : flight.stopCount ? "detour" : "simple"}`}>
      <div className="card-top">
        <div>
          <span className={`badge ${hard ? "hard" : saved ? "save" : ""}`}>{tag}</span>
          <div className="logos">
            {flight.airlines.map((a) => (
              <img
                key={a.code}
                src={airlineLogo(a.code)}
                alt=""
                width={28}
                height={28}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ))}
            <strong className="carrier-names">{names}</strong>
          </div>
          <div className="times">
            <div>
              <b>{flight.outbound.depart}</b>
              <small>
                {flight.outbound.date ? `${dayLabel(flight.outbound.date)} · ` : ""}
                {flight.outbound.from} → {hard ? pinned.dest : flight.ticketedDest}
              </small>
            </div>
            <div>
              <b>{flight.outbound.arrive}</b>
              <small>
                llega · {minutesLabel(flight.outbound.durationMin)}
                {flight.outbound.stops.length ? ` · escala ${flight.outbound.stops.join(", ")}` : " · directo"}
              </small>
            </div>
          </div>
        </div>
        <div className="price">
          {euro(flight.priceEur)}
          <span>
            {saved && saved > 0 ? `ahorras ${euro(saved)} vs el vuelo “de verdad”` : "precio real · Kiwi.com"}
          </span>
        </div>
      </div>
      <p className="explain">{extra}</p>
      <div className="book-row">
        <a className="book primary" href={flight.bookingUrl} target="_blank" rel="noopener noreferrer">
          Reservar este precio
        </a>
        <a
          className="book google"
          href={googleFlightsUrl({ ...pinned, airlineName: flight.airlines[0]?.name })}
          target="_blank"
          rel="noopener noreferrer"
        >
          Comprobar en Google Flights
        </a>
        <a className="book sky" href={skyscannerUrl(pinned)} target="_blank" rel="noopener noreferrer">
          Comprobar en Skyscanner
        </a>
      </div>
    </article>
  );
}

export function SearchBoard() {
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [date, setDate] = useState(() => todayIso());
  const [dateTo, setDateTo] = useState(() => horizonDate());
  const [maxLayoverHours, setMaxLayoverHours] = useState(12);
  const [bags, setBags] = useState(0);
  const [airline, setAirline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<LiveFlight[]>([]);

  const params: SearchParams = {
    origin,
    dest,
    date,
    dateTo: dateTo < date ? date : dateTo,
    returnDate: null,
    adults: 1,
    cabin: "ECONOMY",
    bags,
    maxLayoverHours,
    airline,
  };

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    void scanWorld()
      .then((list) => {
        if (!live) return;
        setRaw(list);
      })
      .catch((e) => {
        if (!live) return;
        setRaw([]);
        setError(e instanceof Error ? e.message : "No se pudo leer Kiwi ahora mismo.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      filterScan(raw, {
        origin,
        dest,
        date: isPastDate(date) ? todayIso() : date,
        dateTo: dateTo < date ? date : dateTo,
        airline,
        maxLayoverHours,
      }),
    [raw, origin, dest, date, dateTo, airline, maxLayoverHours],
  );
  const ranked = useMemo(
    () => rankFlights(filtered, [], dest || "ANY", bags),
    [filtered, dest, bags],
  );

  const originName = origin && !isAnywhere(origin) ? (getAirport(origin) ? labelAirport(getAirport(origin)!) : origin) : "cualquier origen";
  const destName = dest && !isAnywhere(dest) ? (getAirport(dest) ? labelAirport(getAirport(dest)!) : dest) : "cualquier destino";

  return (
    <>
      <form
        className="search world"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <AirportField label="Origen" value={origin} onChange={setOrigin} allowAnywhere anywhereKind="origin" />
        <AirportField label="Destino" value={dest} onChange={setDest} allowAnywhere anywhereKind="dest" />
        <label>
          Desde
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </label>
        <label>
          Espera máx. escala
          <select value={String(maxLayoverHours)} onChange={(e) => setMaxLayoverHours(Number(e.target.value))}>
            {[2, 4, 6, 8, 12, 18, 24].map((h) => (
              <option key={h} value={h}>
                {h} h
              </option>
            ))}
          </select>
        </label>
        <label>
          Aerolínea
          <select value={airline} onChange={(e) => setAirline(e.target.value)}>
            {AIRLINES.map((a) => (
              <option key={a.code || "all"} value={a.code}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
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
      </form>
      <p className="ref">
        Al abrir se hace una sola pasada: hoy → ~11 meses, varios orígenes, cualquier destino. Aquí solo
        filtras. Solo salen tarifa error o ciudad oculta (te bajas en la escala). Si no hay, no hay listado
        tipo Skyscanner.
      </p>
      {error && (
        <p className="error">
          {error}{" "}
          <a href={googleFlightsUrl(params)} target="_blank" rel="noopener noreferrer">
            Google Flights
          </a>
          .
        </p>
      )}

      {loading && <p className="banner">Una sola búsqueda en marcha: orígenes del mundo, hoy hacia adelante…</p>}

      {!loading && (
        <div className="results">
          {ranked.error.length === 0 && ranked.hidden.length === 0 ? (
            <section className="block">
              <p className="banner">
                En {originName} → {destName} no hay tarifa error ni ciudad oculta en esta pasada. No
                enseñamos el vuelo “normal”: para eso está Google Flights o Skyscanner.
              </p>
              <div className="book-row">
                <a className="book google" href={googleFlightsUrl(params)} target="_blank" rel="noopener noreferrer">
                  Google Flights
                </a>
                <a className="book sky" href={skyscannerUrl(params)} target="_blank" rel="noopener noreferrer">
                  Skyscanner
                </a>
                <a className="book kiwi" href={kiwiSearchUrl(params)} target="_blank" rel="noopener noreferrer">
                  Kiwi
                </a>
              </div>
            </section>
          ) : (
            <>
              {ranked.error.length > 0 && (
                <section className="block">
                  <h2>Tarifa error</h2>
                  <p className="ref">
                    Mitad de precio o menos y al menos 80 € menos que el precio típico de esa misma ruta en
                    esta pasada.
                  </p>
                  {ranked.error.map((hit) => (
                    <FlightCard
                      key={hit.flight.id}
                      flight={hit.flight}
                      params={params}
                      tag={`tarifa error · ahorras ${euro(hit.savedEur)} (−${hit.savePct}%)`}
                      saved={hit.savedEur}
                      extra={`Ahora ${euro(hit.flight.priceEur)} frente a ${euro(hit.refPrice)} el precio típico de ${hit.flight.outbound.from}–${hit.flight.ticketedDest}.`}
                    />
                  ))}
                </section>
              )}
              {ranked.hidden.length > 0 && (
                <section className="block hidden-wrap">
                  <h2>Ciudad oculta</h2>
                  <p className="ref">
                    El billete sigue hasta más lejos. Te bajas en la escala y no vuelas el último tramo. Sale
                    más barato que el vuelo que sí termina donde te quieres quedar. La aerolínea lo prohíbe.
                    Sin maleta facturada.
                  </p>
                  {ranked.hidden.map((hit) => (
                    <FlightCard
                      key={hit.flight.id}
                      flight={hit.flight}
                      params={{ ...params, dest: hit.getOff }}
                      tag={`ciudad oculta · ahorras ${euro(hit.savedEur)}`}
                      saved={hit.savedEur}
                      hard
                      extra={`Pagas ${euro(hit.flight.priceEur)} hasta ${hit.ticketed}, te bajas en ${hit.getOff} y no sigues. El vuelo “de verdad” solo hasta ${hit.getOff} cuesta ${euro(hit.flight.priceEur + hit.savedEur)}. Ahorras ${euro(hit.savedEur)}.`}
                    />
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
