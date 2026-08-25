import {
  ALT_OFFSETS,
  ANY_ALT_OFFSETS,
  errorCompare,
  isAnywhere,
  type LiveFlight,
} from "./types";

export type ErrorHit = {
  flight: LiveFlight;
  savedEur: number;
  savePct: number;
  refPrice: number;
};

export type HiddenHit = {
  flight: LiveFlight;
  getOff: string;
  ticketed: string;
  savedEur: number;
};

export type DateHint = {
  date: string;
  days: number;
  price: number;
  savedEur: number;
};

export function routeKey(flight: LiveFlight): string {
  return `${flight.outbound.from}-${flight.ticketedDest}`;
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

export function errorHitOf(flight: LiveFlight, cheapestRef: Map<string, number>): ErrorHit | null {
  const refPrice = cheapestRef.get(routeKey(flight));
  const cmp = errorCompare(flight.priceEur, refPrice ?? null);
  if (!cmp.looksLikeError || cmp.savedEur == null || refPrice == null) return null;
  return {
    flight,
    savedEur: cmp.savedEur,
    savePct: Math.round((cmp.savedEur / refPrice) * 100),
    refPrice,
  };
}

export function rankFlights(
  now: LiveFlight[],
  ref: LiveFlight[],
  requestedDest: string,
  bags: number,
): { error: ErrorHit[]; hidden: HiddenHit[]; normal: LiveFlight[] } {
  const cheapestNow = cheapestByRoute(now);
  const cheapestRef = cheapestByRoute(ref);
  const error: ErrorHit[] = [];
  const hidden: HiddenHit[] = [];
  const errorIds = new Set<string>();
  const hiddenIds = new Set<string>();

  for (const flight of now) {
    const err = errorHitOf(flight, cheapestRef);
    if (err) {
      error.push(err);
      errorIds.add(flight.id);
    }
  }
  error.sort((a, b) => b.savePct - a.savePct || b.savedEur - a.savedEur);

  for (const flight of now) {
    if (errorIds.has(flight.id)) continue;
    const hid = hiddenCityOf(flight, requestedDest, bags, cheapestNow);
    if (hid) {
      hidden.push(hid);
      hiddenIds.add(flight.id);
    }
  }
  hidden.sort((a, b) => b.savedEur - a.savedEur);

  const normal = now.filter((f) => !errorIds.has(f.id) && !hiddenIds.has(f.id));
  return { error, hidden, normal };
}

export function altOffsetsFor(origin: string, dest: string): readonly number[] {
  if (isAnywhere(origin)) return [];
  return isAnywhere(dest) ? ANY_ALT_OFFSETS : ALT_OFFSETS;
}

export function dateHints(
  alts: { date: string; days: number; cheapest: number | null }[],
  refPrice: number | null,
): DateHint[] {
  const out: DateHint[] = [];
  for (const alt of alts) {
    const cmp = errorCompare(alt.cheapest, refPrice);
    if (!cmp.looksLikeError || cmp.savedEur == null || alt.cheapest == null) continue;
    out.push({ date: alt.date, days: alt.days, price: alt.cheapest, savedEur: cmp.savedEur });
  }
  return out.sort((a, b) => a.days - b.days);
}
