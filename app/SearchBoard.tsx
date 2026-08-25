"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { AirportField } from "./AirportField";
import { getAirport, labelAirport } from "@/lib/airports";
import { fetchKiwiFlights, filterFlights } from "@/lib/kiwi";
import { airlineLogo, googleFlightsUrl, kiwiSearchUrl, skyscannerUrl } from "@/lib/links";
import { altOffsetsFor, dateHints, rankFlights } from "@/lib/rank";
import {
  addDays,
  defaultDate,
  defaultMonth,
  isAnywhere,
  isFlexible,
  isPastDate,
  monthBounds,
  referenceWindow,
  shiftReturn,
  upcomingMonths,
  type Cabin,
  type EmptyReason,
  type LiveFlight,
  type SearchParams,
} from "@/lib/types";

type DateMode = "day" | "range" | "month";

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

const EMPTY: Record<EmptyReason, string> = {
  past_date: "Esa fecha ya pasó. Elige un día de hoy en adelante.",
  unknown_route: "Ese aeropuerto no está en la red. Prueba un IATA (BCN, JFK, NRT…).",
  same_airport: "Origen y destino no pueden ser el mismo.",
  bad_return: "La vuelta tiene que ser el mismo día de la ida o después.",
  bad_range: "Hasta tiene que ser el mismo día de Desde o después.",
};

function resolvedWhen(
  mode: DateMode,
  date: string,
  dateTo: string,
  month: string,
): { date: string; dateTo: string } {
  if (mode === "day") return { date, dateTo: date };
  if (mode === "month") {
    const bounds = monthBounds(month);
    if (!bounds) return { date, dateTo: date };
    return { date: bounds.start, dateTo: bounds.end };
  }
  return { date, dateTo: dateTo < date ? date : dateTo };
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

function validate(p: SearchParams, now = new Date()): EmptyReason | null {
  if (!p.dateTo || p.dateTo < p.date) return "bad_range";
  if (isPastDate(p.date, now)) return "past_date";
  if (!isAnywhere(p.origin) && !getAirport(p.origin)) return "unknown_route";
  if (!isAnywhere(p.dest) && !getAirport(p.dest)) return "unknown_route";
  if (!isAnywhere(p.origin) && !isAnywhere(p.dest) && p.origin === p.dest) return "same_airport";
  if (p.returnDate && (isPastDate(p.returnDate, now) || p.returnDate < p.dateTo)) return "bad_return";
  return null;
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

function SourceLinks({ p, airlineName }: { p: SearchParams; airlineName?: string }) {
  const g = googleFlightsUrl({ ...p, airlineName });
  const s = skyscannerUrl(p);
  const k = kiwiSearchUrl(p);
  return (
    <div className="book-row">
      <a className="book google" href={g} target="_blank" rel="noopener noreferrer">
        Ver en Google Flights
      </a>
      <a className="book sky" href={s} target="_blank" rel="noopener noreferrer">
        Ver en Skyscanner
      </a>
      <a className="book kiwi" href={k} target="_blank" rel="noopener noreferrer">
        Buscar en Kiwi
      </a>
    </div>
  );
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
          <span className={`badge ${hard ? "hard" : saved ? "save" : flight.stopCount ? "save" : ""}`}>{tag}</span>
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
                sale {pinned.origin} → {pinned.dest}
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
          {flight.inbound && (
            <div className="times inbound">
              <div>
                <b>{flight.inbound.depart}</b>
                <small>{flight.inbound.date ? `${dayLabel(flight.inbound.date)} · ` : ""}vuelta</small>
              </div>
              <div>
                <b>{flight.inbound.arrive}</b>
                <small>llega · {minutesLabel(flight.inbound.durationMin)}</small>
              </div>
            </div>
          )}
        </div>
        <div className="price">
          {euro(flight.priceEur)}
          <span>
            {saved && saved > 0 ? `ahorras ${euro(saved)} vs el precio normal` : "precio real · Kiwi.com"}
          </span>
        </div>
      </div>
      <p className="explain">
        {extra ??
          (flight.stopCount
            ? `Con escala (${minutesLabel(flight.layoverMinutes)} de espera). Precio vivo de Kiwi.`
            : "Directo. Precio vivo de Kiwi.")}
        {flight.selfTransfer && !hard ? " Puede ser auto-transferencia (más de una aerolínea)." : ""}
      </p>
      <div className="book-row">
        <a className="book primary" href={flight.bookingUrl} target="_blank" rel="noopener noreferrer">
          Reservar este precio
        </a>
        <a
          className="book google"
          href={googleFlightsUrl({
            ...pinned,
            airlineName: flight.airlines[0]?.name,
          })}
          target="_blank"
          rel="noopener noreferrer"
        >
          Comprobar en Google Flights
        </a>
        <a
          className="book sky"
          href={skyscannerUrl(pinned)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Comprobar en Skyscanner
        </a>
      </div>
    </article>
  );
}

export function SearchBoard() {
  const [origin, setOrigin] = useState("BCN");
  const [dest, setDest] = useState("FCO");
  const [roundTrip, setRoundTrip] = useState(false);
  const [dateMode, setDateMode] = useState<DateMode>("day");
  const [date, setDate] = useState(defaultDate);
  const [dateTo, setDateTo] = useState(defaultDate);
  const [month, setMonth] = useState(defaultMonth);
  const [returnDate, setReturnDate] = useState(() => defaultDate(28));
  const [adults, setAdults] = useState(1);
  const [cabin, setCabin] = useState<Cabin>("ECONOMY");
  const [maxLayoverHours, setMaxLayoverHours] = useState(4);
  const [bags, setBags] = useState(0);
  const [airline, setAirline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState<EmptyReason | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"flights" | "error">("flights");
  const [params, setParams] = useState<SearchParams | null>(null);
  const [raw, setRaw] = useState<LiveFlight[]>([]);
  const [rawRef, setRawRef] = useState<LiveFlight[]>([]);
  const [hints, setHints] = useState<{ date: string; days: number; price: number; savedEur: number }[]>([]);
  const [refMeta, setRefMeta] = useState<{ date: string; dateTo: string; label: string } | null>(null);
  const req = useRef(0);
  const months = useMemo(() => upcomingMonths(), []);

  const destName = useMemo(() => {
    if (isAnywhere(dest)) return "cualquier destino";
    const a = getAirport(dest);
    return a ? labelAirport(a) : dest;
  }, [dest]);

  const originName = useMemo(() => {
    if (isAnywhere(origin)) return "cualquier origen";
    const a = getAirport(origin);
    return a ? labelAirport(a) : origin;
  }, [origin]);

  const when = resolvedWhen(dateMode, date, dateTo, month);
  const current: SearchParams = {
    origin,
    dest,
    date: when.date,
    dateTo: when.dateTo,
    returnDate: roundTrip ? returnDate : null,
    adults,
    cabin,
    bags,
    maxLayoverHours,
    airline,
  };

  const flights = useMemo(
    () => filterFlights(raw, maxLayoverHours, airline),
    [raw, maxLayoverHours, airline],
  );
  const refFlights = useMemo(
    () => filterFlights(rawRef, maxLayoverHours, airline),
    [rawRef, maxLayoverHours, airline],
  );
  const ranked = useMemo(
    () => rankFlights(flights, refFlights, params?.dest ?? dest, bags),
    [flights, refFlights, params?.dest, dest, bags],
  );
  const cheapest = flights[0] ?? null;
  const cheapestDirect = flights.find((f) => f.stopCount === 0) ?? null;
  const cheapestStop = flights.find((f) => f.stopCount > 0) ?? null;
  const stopSaves =
    cheapestDirect && cheapestStop && cheapestStop.priceEur < cheapestDirect.priceEur
      ? cheapestDirect.priceEur - cheapestStop.priceEur
      : 0;

  async function run(next = current) {
    setError(null);
    const reason = validate(next);
    setEmpty(reason);
    setParams(next);
    if (reason) {
      setRaw([]);
      setRawRef([]);
      setHints([]);
      return;
    }
    const id = ++req.current;
    setLoading(true);
    const flexible = isFlexible(next.date, next.dateTo);
    const ref = referenceWindow(next.date, next.dateTo);
    setRefMeta(ref);
    try {
      const [nowList, weekList, altLists] = await Promise.all([
        fetchKiwiFlights(next),
        fetchKiwiFlights({
          ...next,
          date: ref.date,
          dateTo: ref.dateTo,
          returnDate: next.returnDate ? shiftReturn(next.date, next.returnDate, ref.date) : null,
        }).catch(() => [] as LiveFlight[]),
        Promise.all(
          altOffsetsFor(next.origin, next.dest, flexible).map(async (days) => {
            const date = addDays(next.date, days);
            if (isPastDate(date)) return { date, days, cheapest: null as number | null };
            try {
              const list = await fetchKiwiFlights({
                ...next,
                date,
                dateTo: date,
                returnDate: next.returnDate ? shiftReturn(next.date, next.returnDate, date) : null,
                limit: 6,
              });
              return { date, days, cheapest: list[0]?.priceEur ?? null };
            } catch {
              return { date, days, cheapest: null as number | null };
            }
          }),
        ),
      ]);
      if (id !== req.current) return;
      setRaw(nowList);
      setRawRef(weekList);
      const refPrice = weekList[0]?.priceEur ?? null;
      setHints(dateHints(altLists, refPrice));
      setTab("flights");
    } catch (e) {
      if (id !== req.current) return;
      setRaw([]);
      setRawRef([]);
      setHints([]);
      setError(e instanceof Error ? e.message : "No se pudo leer Kiwi ahora mismo.");
    } finally {
      if (id === req.current) setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void run();
  }

  return (
    <>
      <form className="search world" onSubmit={onSubmit}>
        <AirportField label="Origen" value={origin} onChange={setOrigin} allowAnywhere anywhereKind="origin" />
        <AirportField label="Destino" value={dest} onChange={setDest} allowAnywhere anywhereKind="dest" />
        <label>
          Tipo
          <select
            value={roundTrip ? "rt" : "ow"}
            onChange={(e) => {
              const rt = e.target.value === "rt";
              setRoundTrip(rt);
              if (rt && returnDate < when.dateTo) setReturnDate(addDays(when.dateTo, 7));
            }}
          >
            <option value="ow">Solo ida</option>
            <option value="rt">Ida y vuelta</option>
          </select>
        </label>
        <label>
          Cuándo
          <select
            value={dateMode}
            onChange={(e) => {
              const mode = e.target.value as DateMode;
              setDateMode(mode);
              if (mode === "day") setDateTo(date);
              if (mode === "range") {
                const end = !dateTo || dateTo === date ? addDays(date, 6) : dateTo;
                setDateTo(end);
                if (roundTrip && returnDate < end) setReturnDate(addDays(end, 7));
              }
              if (mode === "month") {
                const fromDate = date.slice(0, 7);
                const nextMonth = months.some((m) => m.value === fromDate) ? fromDate : defaultMonth();
                setMonth(nextMonth);
                const bounds = monthBounds(nextMonth);
                if (bounds) {
                  setDate(bounds.start);
                  setDateTo(bounds.end);
                  if (roundTrip && returnDate < bounds.end) setReturnDate(addDays(bounds.end, 7));
                }
              }
            }}
          >
            <option value="day">Un día</option>
            <option value="range">Fechas flexibles</option>
            <option value="month">Un mes</option>
          </select>
        </label>
        {dateMode === "month" ? (
          <label>
            Mes
            <select
              value={month}
              onChange={(e) => {
                const value = e.target.value;
                setMonth(value);
                const bounds = monthBounds(value);
                if (bounds) {
                  setDate(bounds.start);
                  setDateTo(bounds.end);
                  if (roundTrip && returnDate < bounds.end) setReturnDate(addDays(bounds.end, 7));
                }
              }}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
        ) : dateMode === "range" ? (
          <>
            <label>
              Desde
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label>
              Hasta
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  const end = e.target.value;
                  setDateTo(end);
                  if (roundTrip && returnDate < end) setReturnDate(addDays(end, 7));
                }}
                required
              />
            </label>
          </>
        ) : (
          <label>
            Ida
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
        )}
        {roundTrip && (
          <label>
            Vuelta
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required />
          </label>
        )}
        <label>
          Pasajeros
          <select value={String(adults)} onChange={(e) => setAdults(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} adulto{n === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
        <label>
          Clase
          <select value={cabin} onChange={(e) => setCabin(e.target.value as Cabin)}>
            <option value="ECONOMY">Turista</option>
            <option value="PREMIUM_ECONOMY">Turista premium</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">Primera</option>
          </select>
        </label>
        <label>
          Espera máx. escala
          <select value={String(maxLayoverHours)} onChange={(e) => setMaxLayoverHours(Number(e.target.value))}>
            {[1, 2, 3, 4, 6, 8, 12].map((h) => (
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
        <button type="submit" disabled={loading}>
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </form>
      <p className="ref">
        Precios reales de Kiwi.com. Cada tarjeta abre la reserva o el mismo trayecto en Google Flights y
        Skyscanner. Los kilos exactos se eligen en el checkout.
      </p>
      {error && (
        <p className="error">
          {error} Puedes abrir igual los buscadores oficiales abajo.
        </p>
      )}
      {empty && <p className="empty">{EMPTY[empty]}</p>}

      {params && !empty && (
        <div className="results">
          <SourceLinks p={params} />
          <div className="tabs">
            <button type="button" className={tab === "flights" ? "on" : ""} onClick={() => setTab("flights")}>
              Vuelos
            </button>
            <button type="button" className={tab === "error" ? "on" : ""} onClick={() => setTab("error")}>
              Tarifa error
              {ranked.error.length ? ` · ${ranked.error.length}` : ""}
            </button>
          </div>

          {loading && <p className="banner">Buscando primero las tarifas raras, luego el resto…</p>}

          {!loading && ranked.error.length === 0 && (
            <p className="banner">
              No hay tarifas error {params && isFlexible(params.date, params.dateTo) ? "en esta ventana" : "para esta fecha"}
              {refFlights[0] && cheapest ? ` (ahora ${euro(cheapest.priceEur)} · normal ${euro(refFlights[0].priceEur)})` : ""}.
              {hints.length > 0 ? " Sí las hay en otras fechas:" : ""}
              {hints.map((h) => (
                <button
                  key={h.date}
                  type="button"
                  className="date-chip"
                  onClick={() => {
                    setDateMode("day");
                    setDate(h.date);
                    setDateTo(h.date);
                    if (params?.returnDate) setReturnDate(shiftReturn(params.date, params.returnDate, h.date));
                    void run({
                      ...current,
                      date: h.date,
                      dateTo: h.date,
                      returnDate: current.returnDate
                        ? shiftReturn(current.date, current.returnDate, h.date)
                        : null,
                    });
                  }}
                >
                  dentro de {h.days} días · {h.date} · {euro(h.price)}
                </button>
              ))}
            </p>
          )}

          {tab === "flights" && !loading && (
            <>
              {ranked.error.length > 0 && (
                <section className="block">
                  <h2>1. Tarifas error</h2>
                  <p className="ref">Los descuentos más bestias vs el precio normal de la semana de referencia. Van primero.</p>
                  {ranked.error.map((hit) => (
                    <FlightCard
                      key={hit.flight.id}
                      flight={hit.flight}
                      params={params}
                      tag={`tarifa error · −${hit.savePct}%`}
                      saved={hit.savedEur}
                      extra={`Mismo destino ${hit.flight.ticketedDest}: ahora ${euro(hit.flight.priceEur)} frente a ${euro(hit.refPrice)} de un vuelo normal.`}
                    />
                  ))}
                </section>
              )}

              {ranked.hidden.length > 0 && (
                <section className="block hidden-wrap">
                  <h2>2. Más barato bajándote en la escala</h2>
                  <p className="ref">
                    Billete hasta más lejos; te bajas en la escala y no vuelas el último tramo. La aerolínea lo
                    prohíbe. Sin maleta facturada.
                  </p>
                  {ranked.hidden.map((hit) => (
                    <FlightCard
                      key={hit.flight.id}
                      flight={hit.flight}
                      params={params}
                      tag="ciudad oculta"
                      saved={hit.savedEur}
                      hard
                      extra={`Te bajas en ${hit.getOff} y no vuelas hasta ${hit.ticketed}. Sale ${euro(hit.savedEur)} más barato que un billete solo hasta ${hit.getOff}.`}
                    />
                  ))}
                </section>
              )}

              <section className="block">
                <h2>{ranked.error.length || ranked.hidden.length ? "3. El resto de vuelos" : "Vuelos"}</h2>
                {stopSaves > 0 ? (
                  <p className="banner save">
                    Hay escala más barata que el directo: {euro(stopSaves)} hacia {destName}.
                  </p>
                ) : cheapestDirect ? (
                  <p className="banner">
                    En {originName} → {destName} el directo gana dentro de {maxLayoverHours} h de espera.
                  </p>
                ) : null}
                {ranked.normal.length === 0 && ranked.error.length === 0 && ranked.hidden.length === 0 ? (
                  <p className="empty">Kiwi no devolvió vuelos para esos filtros. Prueba otra fecha o abre Google Flights.</p>
                ) : (
                  ranked.normal.slice(0, 8).map((f) => (
                    <FlightCard
                      key={f.id}
                      flight={f}
                      params={params}
                      tag={f.stopCount ? "con escala" : "directo"}
                    />
                  ))
                )}
              </section>
            </>
          )}

          {tab === "error" && !loading && (
            <>
              {ranked.error.length > 0 ? (
                <p className="banner error-now">
                  Hay {ranked.error.length} tarifa{ranked.error.length === 1 ? "" : "s"} error hoy. Van primero en
                  Vuelos, ordenadas por el descuento más bestia.
                </p>
              ) : (
                <p className="banner">
                  No hay tarifas error {params && isFlexible(params.date, params.dateTo) ? "en esta ventana" : "para esta fecha"}.
                  {hints.length > 0 ? " Revisa estas otras:" : " Tampoco aparecen en +2 a +15 días con el mismo criterio."}
                </p>
              )}
              {hints.map((h) => (
                <button
                  key={h.date}
                  type="button"
                  className="date-chip"
                  onClick={() => {
                    setDateMode("day");
                    setDate(h.date);
                    setDateTo(h.date);
                    void run({
                      ...current,
                      date: h.date,
                      dateTo: h.date,
                      returnDate: current.returnDate
                        ? shiftReturn(current.date, current.returnDate, h.date)
                        : null,
                    });
                  }}
                >
                  dentro de {h.days} días · {h.date} · {euro(h.price)} · ahorras {euro(h.savedEur)}
                </button>
              ))}
              {ranked.error.map((hit) => (
                <FlightCard
                  key={hit.flight.id}
                  flight={hit.flight}
                  params={params}
                  tag={`tarifa error · −${hit.savePct}%`}
                  saved={hit.savedEur}
                  extra={`Vs ${euro(hit.refPrice)} ${refMeta?.label ?? "de referencia"}.`}
                />
              ))}
              {refFlights[0] && refMeta && (
                <FlightCard
                  flight={refFlights[0]}
                  params={{
                    ...params,
                    date: refMeta.date,
                    dateTo: refMeta.dateTo,
                    returnDate: params.returnDate
                      ? shiftReturn(params.date, params.returnDate, refMeta.date)
                      : null,
                  }}
                  tag={`vuelo de referencia · ${refMeta.label}`}
                />
              )}
              <p className="ref">
                Comparación con precios reales de Kiwi. Destino “cualquier sitio”: cada ciudad se compara con lo
                que costaba esa misma ciudad la semana de referencia.
              </p>
              <SourceLinks p={params} />
            </>
          )}
        </div>
      )}
    </>
  );
}
