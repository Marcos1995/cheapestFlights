import catalog from "./catalog.json";
import type {
  CatalogFare,
  EmptyReason,
  Offer,
  Risk,
  SearchRequest,
  SearchResponse,
} from "./types";

const DESTINATIONS = new Set(catalog.destinations);
const HARD: Risk[] = [
  "hidden_city",
  "checked_bag_hidden_city",
  "extra_time_over_6h",
];

export function isPastDate(date: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return true;
  const [y, m, d] = date.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start < today;
}

function toOffer(
  fare: CatalogFare,
  bucket: Offer["bucket"],
  simpleDuration: number | null,
  simplePrice: number | null,
  maxExtraHours: number,
): Offer {
  const extraMinutes =
    simpleDuration == null ? 0 : Math.max(0, fare.durationMin - simpleDuration);
  const savedEur =
    simplePrice == null ? null : Math.max(0, simplePrice - fare.priceEur);
  const riskFlags: Risk[] = [];
  if (fare.kind === "self_transfer") riskFlags.push("self_transfer");
  if (bucket === "hidden_city") {
    riskFlags.push("hidden_city");
    riskFlags.push("checked_bag_hidden_city");
  }
  if (extraMinutes > 6 * 60 && maxExtraHours > 6) {
    riskFlags.push("extra_time_over_6h");
  }
  return {
    bucket,
    priceEur: fare.priceEur,
    savedEur,
    extraMinutes,
    airlines: fare.airlines,
    stops: fare.stops,
    flyAllSegments: fare.flyAllSegments,
    riskFlags,
    source: "mock",
    explanation: fare.explanation,
    depart: fare.depart,
    arrive: fare.arrive,
    durationMin: fare.durationMin,
    kind: fare.kind,
    ticketedDest: fare.ticketedDest,
    getOff: fare.getOff,
  };
}

export function hasHardRisk(offer: Offer): boolean {
  return offer.riskFlags.some((flag) => HARD.includes(flag));
}

export function searchFlights(req: SearchRequest, now = new Date()): SearchResponse {
  const origin = req.origin.toUpperCase();
  const dest = req.dest.toUpperCase();
  const maxExtraHours = Number.isFinite(req.maxExtraHours)
    ? req.maxExtraHours
    : 6;

  const base: SearchResponse = {
    simple: null,
    detour: null,
    hiddenCity: null,
    emptyReason: null,
    origin,
    dest,
    date: req.date,
    maxExtraHours,
    referencePrice: req.referencePrice,
  };

  if (isPastDate(req.date, now)) {
    return { ...base, emptyReason: "past_date" };
  }
  if (origin !== "BCN" || !DESTINATIONS.has(dest)) {
    return { ...base, emptyReason: "unknown_route" };
  }

  const simpleFare = (catalog.simple as CatalogFare[]).find(
    (f) => f.origin === origin && f.dest === dest,
  );
  let emptyReason: EmptyReason | null = simpleFare ? null : "no_simple";

  const simple = simpleFare
    ? toOffer(simpleFare, "simple", simpleFare.durationMin, simpleFare.priceEur, maxExtraHours)
    : null;
  if (simple) simple.savedEur = 0;
  if (simple) simple.extraMinutes = 0;

  const simpleDuration = simpleFare?.durationMin ?? null;
  const simplePrice = simpleFare?.priceEur ?? null;
  const capMin = maxExtraHours * 60;

  const detours = (catalog.detours as CatalogFare[])
    .filter((f) => f.origin === origin && f.dest === dest)
    .map((f) => toOffer(f, "detour", simpleDuration, simplePrice, maxExtraHours))
    .filter((o) => o.extraMinutes <= capMin)
    .filter((o) => simplePrice == null || o.priceEur < simplePrice)
    .sort((a, b) => a.priceEur - b.priceEur);

  const hidden = (catalog.hiddenCity as CatalogFare[])
    .filter((f) => f.origin === origin && (f.intent ?? f.dest) === dest)
    .map((f) => toOffer(f, "hidden_city", simpleDuration, simplePrice, maxExtraHours))
    .filter((o) => o.extraMinutes <= capMin)
    .sort((a, b) => a.priceEur - b.priceEur);

  if (!detours[0] && !emptyReason) emptyReason = "no_detour";
  if (!hidden[0] && emptyReason === "no_detour") {
    /* keep no_detour as the primary empty if both missing on anchors? no — hide buckets independently */
  }

  return {
    ...base,
    simple,
    detour: detours[0] ?? null,
    hiddenCity: hidden[0] ?? null,
    emptyReason: simple ? null : emptyReason,
  };
}

export { catalog, DESTINATIONS };
