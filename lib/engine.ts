import { AIRPORTS, getAirport, HUBS, type Airport } from "./airports";
import type { EmptyReason, Offer, Risk, SearchRequest, SearchResponse } from "./types";

const HARD: Risk[] = ["hidden_city", "checked_bag_hidden_city", "extra_time_over_6h"];
const CARRIERS = ["Iberia", "Vueling", "Ryanair", "easyJet", "Lufthansa", "Air France", "KLM", "ITA", "TAP", "British Airways", "Emirates", "Qatar Airways", "Turkish Airlines", "Delta", "United"];

export function isPastDate(date: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return true;
  const [y, m, d] = date.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start < today;
}

export function kmBetween(a: Airport, b: Airport): number {
  const r = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function extrasEur(bags: number, bagKg: 23 | 32, seat: boolean): number {
  const bag = bags <= 0 ? 0 : bags * (bagKg === 32 ? 48 : 32);
  return bag + (seat ? 24 : 0);
}

function flightMin(km: number): number {
  return Math.round(38 + (km / 12.4) * 60);
}

function clock(seed: number): string {
  const h = 6 + (seed % 14);
  const m = (seed * 7) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function addMin(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const t = (h * 60 + m + minutes + 24 * 60) % (24 * 60);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

function carrier(seed: number): string {
  return CARRIERS[seed % CARRIERS.length];
}

function baseFare(km: number, seed: number): number {
  return Math.max(29, Math.round(32 + km * 0.078 + (seed % 37)));
}

function extrasOf(req: SearchRequest): number {
  return extrasEur(req.bags, req.bagKg, req.seat);
}

function finish(
  partial: Omit<Offer, "extrasEur" | "priceEur" | "savedEur" | "source">,
  extras: number,
  simpleBase: number | null,
): Offer {
  const extrasEur = extras;
  const priceEur = partial.baseEur + extrasEur;
  const savedEur =
    simpleBase == null ? null : Math.max(0, simpleBase + extras - priceEur);
  return { ...partial, extrasEur, priceEur, savedEur, source: "mock" };
}

function pickHubs(origin: Airport, dest: Airport, seed: number): Airport[] {
  const direct = kmBetween(origin, dest);
  return HUBS.filter((h) => h.iata !== origin.iata && h.iata !== dest.iata)
    .map((h) => {
      const via = kmBetween(origin, h) + kmBetween(h, dest);
      return { h, via, waste: via / Math.max(1, direct) };
    })
    .filter((x) => x.waste < 1.7 && x.via - direct > 80)
    .sort((a, b) => a.waste - b.waste || (hash(a.h.iata + seed) % 9) - 4)
    .slice(0, 6)
    .map((x) => x.h);
}

function beyondAirport(origin: Airport, dest: Airport): Airport | undefined {
  const od = kmBetween(origin, dest);
  return AIRPORTS.filter((a) => a.iata !== origin.iata && a.iata !== dest.iata)
    .map((a) => ({ a, oa: kmBetween(origin, a), da: kmBetween(dest, a) }))
    .filter((x) => x.oa > od + 80 && x.da < 900)
    .sort((a, b) => a.da - b.da)
    .at(0)?.a;
}

export function hasHardRisk(offer: Offer): boolean {
  return offer.riskFlags.some((flag) => HARD.includes(flag));
}

export function hasErrorOnDate(origin: string, dest: string, date: string): boolean {
  const o = getAirport(origin);
  const d = getAirport(dest);
  if (!o || !d || o.iata === d.iata) return false;
  const km = kmBetween(o, d);
  const seed = hash(`${o.iata}${d.iata}${date}`);
  return seed % 8 === 0 && km > 350;
}

export function nextErrorDates(origin: string, dest: string, start: string, days = 21): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return [];
  const [y, m, d] = start.split("-").map(Number);
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    const dt = new Date(y, m - 1, d + i);
    const iso = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    if (hasErrorOnDate(origin, dest, iso)) out.push(iso);
  }
  return out;
}

export function searchFlights(req: SearchRequest, now = new Date()): SearchResponse {
  const originCode = req.origin.toUpperCase();
  const destCode = req.dest.toUpperCase();
  const origin = getAirport(originCode);
  const dest = getAirport(destCode);
  const extras = extrasOf(req);
  const maxLayoverHours = Number.isFinite(req.maxLayoverHours) ? req.maxLayoverHours : 4;

  const base: SearchResponse = {
    simple: null,
    detour: null,
    errorFare: null,
    hiddenCity: null,
    emptyReason: null,
    origin: originCode,
    dest: destCode,
    date: req.date,
    maxLayoverHours,
    extras: { bags: req.bags, bagKg: req.bagKg, seat: req.seat, extrasEur: extras },
    km: 0,
    hasErrorNow: false,
    detourBeatsSimple: false,
    referencePrice: req.referencePrice,
  };

  if (isPastDate(req.date, now)) return { ...base, emptyReason: "past_date" };
  if (!origin || !dest) return { ...base, emptyReason: "unknown_route" };
  if (origin.iata === dest.iata) return { ...base, emptyReason: "same_airport" };

  const km = Math.round(kmBetween(origin, dest));
  const seed = hash(`${origin.iata}${dest.iata}${req.date}`);
  const depart = clock(seed);
  const fly = flightMin(km);
  const simpleBase = baseFare(km, seed);
  const simple = finish(
    {
      bucket: "simple",
      baseEur: simpleBase,
      extraMinutes: 0,
      layoverMinutes: 0,
      airlines: [carrier(seed)],
      stops: [],
      flyAllSegments: true,
      riskFlags: [],
      explanation: `El vuelo estándar ${origin.city} → ${dest.city}: el que sale primero en Google Flights. ${km} km, sin escala.`,
      depart,
      arrive: addMin(depart, fly),
      durationMin: fly,
      kind: "nonstop",
    },
    extras,
    simpleBase,
  );
  simple.savedEur = 0;

  const hubs = pickHubs(origin, dest, seed);
  const cap = maxLayoverHours * 60;
  let detour: Offer | null = null;
  for (const hub of hubs) {
    const layover = 55 + (hash(hub.iata + req.date) % 160);
    if (layover > cap) continue;
    const d1 = flightMin(kmBetween(origin, hub));
    const d2 = flightMin(kmBetween(hub, dest));
    const duration = d1 + layover + d2;
    const extraMinutes = Math.max(0, duration - fly);
    const viaKm = kmBetween(origin, hub) + kmBetween(hub, dest);
    const waste = viaKm / km;
    const detourBase = Math.round(simpleBase * (0.62 + (waste - 1) * 0.35));
    if (detourBase >= simpleBase) continue;
    const selfTransfer = hash(hub.iata) % 5 === 0;
    const risks: Risk[] = [];
    if (selfTransfer) risks.push("self_transfer");
    if (extraMinutes > 6 * 60 && maxLayoverHours > 6) risks.push("extra_time_over_6h");
    detour = finish(
      {
        bucket: "detour",
        baseEur: detourBase,
        extraMinutes,
        layoverMinutes: layover,
        airlines: [carrier(seed + 3), carrier(seed + 9)],
        stops: [hub.iata],
        flyAllSegments: true,
        riskFlags: risks,
        explanation: `Escala en ${hub.city} (${hub.iata}). Esperas ${Math.floor(layover / 60)} h ${layover % 60} min. Vuelas las dos piernas. Sale ${simpleBase - detourBase} € más barato que el directo.`,
        depart: clock(seed + 11),
        arrive: addMin(clock(seed + 11), duration),
        durationMin: duration,
        kind: selfTransfer ? "self_transfer" : "one_ticket",
      },
      extras,
      simpleBase,
    );
    break;
  }

  const errorNow = seed % 8 === 0 && km > 350;
  let errorFare: Offer | null = null;
  if (errorNow) {
    const errBase = Math.max(24, Math.round(simpleBase * 0.38));
    errorFare = finish(
      {
        bucket: "error_fare",
        baseEur: errBase,
        extraMinutes: 0,
        layoverMinutes: 0,
        airlines: [carrier(seed + 2)],
        stops: [],
        flyAllSegments: true,
        riskFlags: [],
        explanation: `Tarifa error en esta fecha: el mismo ${origin.iata}–${dest.iata} directo, mal publicado. Suele durar horas. Reserva ya si fuera real. Aquí es un modelo ilustrativo, no un GDS.`,
        depart,
        arrive: addMin(depart, fly),
        durationMin: fly,
        kind: "error_fare",
      },
      extras,
      simpleBase,
    );
  }

  let hiddenCity: Offer | null = null;
  if (req.bags === 0) {
    const beyond = beyondAirport(origin, dest);
    if (beyond) {
      const viaMin = 70 + (hash(beyond.iata) % 90);
      const d1 = flightMin(kmBetween(origin, dest));
      const d2 = flightMin(kmBetween(dest, beyond));
      const duration = d1 + viaMin + d2;
      const extraMinutes = Math.max(0, duration - fly);
      if (extraMinutes <= maxLayoverHours * 60 + d2) {
        const hiddenBase = Math.round(simpleBase * 0.64);
        if (hiddenBase < simpleBase) {
          hiddenCity = finish(
            {
              bucket: "hidden_city",
              baseEur: hiddenBase,
              extraMinutes,
              layoverMinutes: viaMin,
              airlines: [carrier(seed + 5)],
              stops: [dest.iata],
              flyAllSegments: false,
              riskFlags: ["hidden_city", "checked_bag_hidden_city"],
              explanation: `Billete ${origin.iata}→${beyond.iata} (${beyond.city}) con escala en ${dest.city}. Te bajas en ${dest.iata} y no vuelas a ${beyond.city}. La aerolínea lo prohíbe en el contrato.`,
              depart: clock(seed + 17),
              arrive: addMin(clock(seed + 17), d1),
              durationMin: duration,
              kind: "hidden_city",
              ticketedDest: beyond.iata,
              getOff: dest.iata,
            },
            extras,
            simpleBase,
          );
        }
      }
    }
  }

  return {
    ...base,
    km,
    simple,
    detour,
    errorFare,
    hiddenCity,
    hasErrorNow: Boolean(errorFare),
    detourBeatsSimple: Boolean(detour && detour.baseEur < simpleBase),
  };
}
