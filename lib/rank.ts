import {
  ALT_OFFSETS,
  ANY_ALT_OFFSETS,
  errorCompare,
  isAnywhere,
  type LiveFlight,
} from "./types";

export type DealHit = {
  flight: LiveFlight;
  savedEur: number;
  savePct: number;
  refPrice: number;
  kind: "error" | "discount";
};

export type ErrorHit = DealHit;

export type HiddenHit = {
  flight: LiveFlight;
  getOff: string;
  ticketed: string;
  savedEur: number;
};

export type DetourHit = {
  flight: LiveFlight;
  savedEur: number;
  vsDirect: number;
};

export type DateHint = {
  date: string;
  days: number;
  price: number;
  savedEur: number;
  kind: "error" | "discount";
};

export function routeKey(flight: LiveFlight): string {
  return `${flight.outbound.from}-${flight.ticketedDest}`;
}

export function typicalByRoute(flights: LiveFlight[]): Map<string, number> {
  const groups = new Map<string, number[]>();
  for (const f of flights) {
    const k = routeKey(f);
    const arr = groups.get(k) ?? [];
    arr.push(f.priceEur);
    groups.set(k, arr);
  }
  const map = new Map<string, number>();
  for (const [k, prices] of groups) {
    if (prices.length < 2) continue;
    prices.sort((a, b) => a - b);
    const idx = Math.min(prices.length - 1, Math.floor(prices.length * 0.75));
    map.set(k, prices[idx]);
  }
  return map;
}

export function filterScan(
  flights: LiveFlight[],
  p: {
    origin: string;
    dest: string;
    date: string;
    dateTo: string;
    airline: string;
    maxLayoverHours: number;
  },
): LiveFlight[] {
  const cap = p.maxLayoverHours * 60;
  const origin = p.origin.trim().toUpperCase();
  const dest = p.dest.trim().toUpperCase();
  return flights.filter((f) => {
    if (origin && !isAnywhere(origin) && f.outbound.from !== origin) return false;
    if (dest && !isAnywhere(dest) && f.ticketedDest !== dest && !f.outbound.stops.includes(dest)) {
      return false;
    }
    if (p.date && f.outbound.date && f.outbound.date < p.date) return false;
    if (p.dateTo && f.outbound.date && f.outbound.date > p.dateTo) return false;
    if (p.airline && !f.airlines.some((a) => a.code === p.airline)) return false;
    if (f.stopCount > 0 && f.layoverMinutes > cap) return false;
    return true;
  });
}

export function cheapestByRoute(flights: LiveFlight[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const f of flights) {
    const key = routeKey(f);
    const prev = map.get(key);
    if (prev == null || f.priceEur < prev) map.set(key, f.priceEur);
  }
  return map;
}

export function cheapestDirectByRoute(flights: LiveFlight[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const f of flights) {
    if (f.stopCount !== 0) continue;
    const key = routeKey(f);
    const prev = map.get(key);
    if (prev == null || f.priceEur < prev) map.set(key, f.priceEur);
  }
  return map;
}

export function legalDetourOf(
  flight: LiveFlight,
  requestedDest: string,
  directs: Map<string, number>,
): DetourHit | null {
  if (flight.stopCount === 0) return null;
  if (!isAnywhere(requestedDest) && flight.ticketedDest !== requestedDest) return null;
  const vsDirect = directs.get(routeKey(flight));
  if (vsDirect == null) return null;
  const savedEur = vsDirect - flight.priceEur;
  if (savedEur < 25) return null;
  return { flight, savedEur, vsDirect };
}

export function hiddenCityOf(
  flight: LiveFlight,
  requestedDest: string,
  bags: number,
  cheapestNow: Map<string, number>,
): HiddenHit | null {
  if (bags > 0 || flight.outbound.stops.length === 0) return null;
  const ticketed = flight.ticketedDest;
  const getOff = isAnywhere(requestedDest)
    ? flight.outbound.stops[0]
    : flight.outbound.stops.includes(requestedDest)
      ? requestedDest
      : null;
  if (!getOff || getOff === ticketed) return null;
  const flyToStop = cheapestNow.get(`${flight.outbound.from}-${getOff}`);
  if (flyToStop == null || flight.priceEur >= flyToStop) return null;
  return { flight, getOff, ticketed, savedEur: flyToStop - flight.priceEur };
}

function dealHitOf(
  flight: LiveFlight,
  cheapestRef: Map<string, number>,
  kind: "error" | "discount",
): DealHit | null {
  const refPrice = cheapestRef.get(routeKey(flight));
  const cmp = errorCompare(flight.priceEur, refPrice ?? null);
  if (cmp.kind !== kind || cmp.savedEur == null || refPrice == null) return null;
  return {
    flight,
    savedEur: cmp.savedEur,
    savePct: Math.round((cmp.savedEur / refPrice) * 100),
    refPrice,
    kind,
  };
}

export function errorHitOf(flight: LiveFlight, cheapestRef: Map<string, number>): DealHit | null {
  return dealHitOf(flight, cheapestRef, "error");
}

export function rankFlights(
  now: LiveFlight[],
  ref: LiveFlight[],
  requestedDest: string,
  bags: number,
): { error: DealHit[]; detour: DetourHit[]; discount: DealHit[]; hidden: HiddenHit[]; normal: LiveFlight[] } {
  const cheapestNow = cheapestByRoute(now);
  const cheapestRef = ref.length ? cheapestByRoute(ref) : typicalByRoute(now);
  const directs = cheapestDirectByRoute(now);
  const error: DealHit[] = [];
  const detour: DetourHit[] = [];
  const discount: DealHit[] = [];
  const hidden: HiddenHit[] = [];
  const errorIds = new Set<string>();
  const detourIds = new Set<string>();
  const discountIds = new Set<string>();
  const hiddenIds = new Set<string>();

  for (const flight of now) {
    const err = dealHitOf(flight, cheapestRef, "error");
    if (err) {
      error.push(err);
      errorIds.add(flight.id);
    }
  }
  error.sort((a, b) => b.savePct - a.savePct || b.savedEur - a.savedEur);

  for (const flight of now) {
    if (errorIds.has(flight.id)) continue;
    const det = legalDetourOf(flight, requestedDest, directs);
    if (det) {
      detour.push(det);
      detourIds.add(flight.id);
    }
  }
  detour.sort((a, b) => b.savedEur - a.savedEur);

  for (const flight of now) {
    if (errorIds.has(flight.id) || detourIds.has(flight.id)) continue;
    const hid = hiddenCityOf(flight, requestedDest, bags, cheapestNow);
    if (hid) {
      hidden.push(hid);
      hiddenIds.add(flight.id);
    }
  }
  hidden.sort((a, b) => b.savedEur - a.savedEur);

  for (const flight of now) {
    if (errorIds.has(flight.id) || detourIds.has(flight.id) || hiddenIds.has(flight.id)) continue;
    const sale = dealHitOf(flight, cheapestRef, "discount");
    if (sale) {
      discount.push(sale);
      discountIds.add(flight.id);
    }
  }
  discount.sort((a, b) => b.savePct - a.savePct || b.savedEur - a.savedEur);

  const taken = new Set([...errorIds, ...detourIds, ...hiddenIds, ...discountIds]);
  const normal = now.filter((f) => !taken.has(f.id));
  return { error, detour, discount, hidden, normal };
}

export function altOffsetsFor(origin: string, dest: string, flexible = false): readonly number[] {
  if (flexible || isAnywhere(origin)) return [];
  return isAnywhere(dest) ? ANY_ALT_OFFSETS : ALT_OFFSETS;
}

export function dateHints(
  alts: { date: string; days: number; cheapest: number | null }[],
  refPrice: number | null,
): DateHint[] {
  const out: DateHint[] = [];
  for (const alt of alts) {
    const cmp = errorCompare(alt.cheapest, refPrice);
    if (!cmp.kind || cmp.savedEur == null || alt.cheapest == null) continue;
    out.push({ date: alt.date, days: alt.days, price: alt.cheapest, savedEur: cmp.savedEur, kind: cmp.kind });
  }
  return out.sort((a, b) => a.days - b.days);
}
