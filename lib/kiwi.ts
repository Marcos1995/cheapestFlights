import { isAnywhere, kiwiPlaceId, type Airline, type Cabin, type Leg, type LiveFlight } from "./types";
import { kiwiBookingUrl } from "./links";

const ONEWAY = `query SearchOneWayItinerariesQuery($search: SearchOnewayInput, $filter: ItinerariesFilterInput, $options: ItinerariesOptionsInput) {
  onewayItineraries(search: $search, filter: $filter, options: $options) {
    __typename
    ... on AppError { error: message }
    ... on Itineraries {
      itineraries {
        __typename
        ... on ItineraryOneWay {
          id
          price { amount }
          priceEur { amount }
          sector { duration sectorSegments { segment {
            source { station { code name } localTime }
            destination { station { code name } localTime }
            duration
            carrier { code name }
          } } }
          bookingOptions { edges { node { bookingUrl } } }
        }
      }
    }
  }
}`;

const ROUND = `query SearchReturnItinerariesQuery($search: SearchReturnInput, $filter: ItinerariesFilterInput, $options: ItinerariesOptionsInput) {
  returnItineraries(search: $search, filter: $filter, options: $options) {
    __typename
    ... on AppError { error: message }
    ... on Itineraries {
      itineraries {
        __typename
        ... on ItineraryReturn {
          id
          price { amount }
          outbound { duration sectorSegments { segment {
            source { station { code name } localTime }
            destination { station { code name } localTime }
            duration
            carrier { code name }
          } } }
          inbound { duration sectorSegments { segment {
            source { station { code name } localTime }
            destination { station { code name } localTime }
            duration
            carrier { code name }
          } } }
          bookingOptions { edges { node { bookingUrl } } }
        }
      }
    }
  }
}`;

type Seg = {
  segment?: {
    source?: { station?: { code?: string; name?: string }; localTime?: string };
    destination?: { station?: { code?: string; name?: string }; localTime?: string };
    duration?: number;
    carrier?: { code?: string; name?: string };
  };
};

type Sector = { duration?: number; sectorSegments?: Seg[] };

function isoDay(iso?: string): string {
  if (!iso || !iso.includes("T")) return "";
  return iso.split("T")[0];
}

function clock(iso?: string): string {
  if (!iso || !iso.includes("T")) return "--:--";
  return iso.split("T")[1].slice(0, 5);
}

function parseLeg(sector: Sector | undefined): Leg | null {
  const segs = (sector?.sectorSegments ?? []).map((s) => s.segment).filter(Boolean);
  if (!segs.length) return null;
  const first = segs[0]!;
  const last = segs[segs.length - 1]!;
  const airlines: Airline[] = [];
  const seen = new Set<string>();
  for (const s of segs) {
    const code = s?.carrier?.code ?? "";
    if (!code || seen.has(code)) continue;
    seen.add(code);
    airlines.push({ code, name: s?.carrier?.name ?? code });
  }
  const stops: string[] = [];
  let layoverMinutes = 0;
  for (let i = 0; i < segs.length - 1; i++) {
    const via = segs[i]?.destination?.station?.code;
    if (via) stops.push(via);
    const arr = segs[i]?.destination?.localTime;
    const dep = segs[i + 1]?.source?.localTime;
    if (arr && dep) {
      const ms = new Date(dep).getTime() - new Date(arr).getTime();
      if (Number.isFinite(ms) && ms > 0) layoverMinutes += Math.round(ms / 60000);
    }
  }
  const durationMin = Math.round((sector?.duration ?? segs.reduce((n, s) => n + (s?.duration ?? 0), 0)) / 60);
  return {
    from: first.source?.station?.code ?? "",
    to: last.destination?.station?.code ?? "",
    fromName: first.source?.station?.name ?? first.source?.station?.code ?? "",
    toName: last.destination?.station?.name ?? last.destination?.station?.code ?? "",
    depart: clock(first.source?.localTime),
    arrive: clock(last.destination?.localTime),
    durationMin,
    stops,
    layoverMinutes,
    airlines,
    date: isoDay(first.source?.localTime),
  };
}

function bookingPath(node: { bookingOptions?: { edges?: { node?: { bookingUrl?: string } }[] } }): string {
  return node.bookingOptions?.edges?.[0]?.node?.bookingUrl ?? "";
}

function priceOf(node: { priceEur?: { amount?: string }; price?: { amount?: string } }): number {
  const raw = node.priceEur?.amount ?? node.price?.amount ?? "";
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

export function parseItineraries(raw: unknown, roundTrip: boolean): LiveFlight[] {
  const data = raw as {
    data?: {
      onewayItineraries?: { __typename?: string; error?: string; itineraries?: unknown[] };
      returnItineraries?: { __typename?: string; error?: string; itineraries?: unknown[] };
    };
  };
  const block = roundTrip ? data.data?.returnItineraries : data.data?.onewayItineraries;
  if (!block) return [];
  if (block.__typename === "AppError") throw new Error(block.error || "Kiwi error");
  const out: LiveFlight[] = [];
  for (const item of block.itineraries ?? []) {
    const node = item as {
      __typename?: string;
      id?: string;
      price?: { amount?: string };
      priceEur?: { amount?: string };
      sector?: Sector;
      outbound?: Sector;
      inbound?: Sector;
      bookingOptions?: { edges?: { node?: { bookingUrl?: string } }[] };
    };
    const outbound = parseLeg(roundTrip ? node.outbound : node.sector);
    if (!outbound || !node.id) continue;
    const inbound = roundTrip ? parseLeg(node.inbound) : null;
    const airlines = [
      ...outbound.airlines,
      ...(inbound?.airlines ?? []).filter((a) => !outbound.airlines.some((o) => o.code === a.code)),
    ];
    const stopCount = outbound.stops.length + (inbound?.stops.length ?? 0);
    out.push({
      id: node.id,
      priceEur: priceOf(node),
      bookingUrl: kiwiBookingUrl(bookingPath(node)),
      stopCount,
      durationMin: outbound.durationMin + (inbound?.durationMin ?? 0),
      layoverMinutes: outbound.layoverMinutes + (inbound?.layoverMinutes ?? 0),
      airlines,
      outbound,
      inbound,
      selfTransfer: airlines.length > 1,
      ticketedDest: outbound.to,
      ticketedName: outbound.toName,
    });
  }
  return out.sort((a, b) => a.priceEur - b.priceEur);
}

function passengers(adults: number, bags: number) {
  const hold = Array.from({ length: adults }, (_, i) => (i < bags ? 1 : 0));
  const hand = Array.from({ length: adults }, () => 0);
  return {
    adults,
    children: 0,
    infants: 0,
    adultsHoldBags: hold,
    adultsHandBags: hand,
    childrenHoldBags: [] as number[],
    childrenHandBags: [] as number[],
  };
}

function filterInput(limit: number, maxStops: number) {
  return {
    allowChangeInboundDestination: true,
    allowChangeInboundSource: true,
    allowDifferentStationConnection: true,
    enableSelfTransfer: true,
    enableThrowAwayTicketing: true,
    enableTrueHiddenCity: true,
    transportTypes: ["FLIGHT"],
    contentProviders: ["KIWI", "FRESH"],
    flightsApiLimit: limit,
    limit,
    maxStopsCount: maxStops,
  };
}

function options() {
  return {
    sortBy: "PRICE",
    mergePriceDiffRule: "INCREASED",
    currency: "EUR",
    locale: "es",
    partner: "skypicker",
    affilID: "skypicker",
    storeSearch: false,
    searchStrategy: "REDUCED",
  };
}

const ANY_ORIGIN_HUBS = ["BCN", "MAD", "LHR", "CDG", "AMS", "FRA", "JFK", "DXB"];

export async function fetchKiwiFlights(p: {
  origin: string;
  dest: string;
  date: string;
  dateTo?: string | null;
  returnDate?: string | null;
  adults: number;
  cabin: Cabin;
  bags: number;
  limit?: number;
}): Promise<LiveFlight[]> {
  if (isAnywhere(p.origin)) {
    const dest = kiwiPlaceId(p.dest);
    const hubs = ANY_ORIGIN_HUBS.filter((h) => h !== dest);
    const lists = await Promise.all(
      hubs.map((origin) =>
        fetchKiwiOnce({ ...p, origin, limit: p.limit ?? 8 }).catch(() => [] as LiveFlight[]),
      ),
    );
    const seen = new Set<string>();
    const merged: LiveFlight[] = [];
    for (const list of lists) {
      for (const f of list) {
        if (seen.has(f.id)) continue;
        seen.add(f.id);
        merged.push(f);
      }
    }
    return merged.sort((a, b) => a.priceEur - b.priceEur);
  }
  return fetchKiwiOnce(p);
}

async function fetchKiwiOnce(p: {
  origin: string;
  dest: string;
  date: string;
  dateTo?: string | null;
  returnDate?: string | null;
  adults: number;
  cabin: Cabin;
  bags: number;
  limit?: number;
}): Promise<LiveFlight[]> {
  const roundTrip = Boolean(p.returnDate);
  const destId = kiwiPlaceId(p.dest);
  const endDay = p.dateTo && p.dateTo > p.date ? p.dateTo : p.date;
  const itinerary: Record<string, unknown> = {
    source: { ids: [p.origin] },
    destination: { ids: [destId] },
    outboundDepartureDate: { start: `${p.date}T00:00:00`, end: `${endDay}T23:59:59` },
  };
  if (p.returnDate) {
    itinerary.inboundDepartureDate = {
      start: `${p.returnDate}T00:00:00`,
      end: `${p.returnDate}T23:59:59`,
    };
  }
  const variables = {
    search: {
      itinerary,
      passengers: passengers(p.adults, p.bags),
      cabinClass: { cabinClass: p.cabin, applyMixedClasses: false },
    },
    filter: filterInput(p.limit ?? (isAnywhere(p.dest) ? 28 : 20), 3),
    options: options(),
  };
  const feature = roundTrip ? "SearchReturnItinerariesQuery" : "SearchOneWayItinerariesQuery";
  const res = await fetch(`https://api.skypicker.com/umbrella/v2/graphql?featureName=${feature}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: roundTrip ? ROUND : ONEWAY, variables }),
  });
  if (!res.ok) throw new Error(`Kiwi HTTP ${res.status}`);
  const json = await res.json();
  return parseItineraries(json, roundTrip);
}

export function filterFlights(
  flights: LiveFlight[],
  maxLayoverHours: number,
  airline: string,
): LiveFlight[] {
  const cap = maxLayoverHours * 60;
  return flights.filter((f) => {
    if (airline && !f.airlines.some((a) => a.code === airline)) return false;
    if (f.stopCount === 0) return true;
    return f.layoverMinutes <= cap;
  });
}
