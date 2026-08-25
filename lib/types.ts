export type Bucket = "simple" | "detour" | "error_fare" | "hidden_city";

export type Risk =
  | "self_transfer"
  | "hidden_city"
  | "checked_bag_hidden_city"
  | "extra_time_over_6h";

export type EmptyReason = "unknown_route" | "same_airport" | "past_date";

export type Offer = {
  bucket: Bucket;
  baseEur: number;
  extrasEur: number;
  priceEur: number;
  savedEur: number | null;
  extraMinutes: number;
  layoverMinutes: number;
  airlines: string[];
  stops: string[];
  flyAllSegments: boolean;
  riskFlags: Risk[];
  source: "mock";
  explanation: string;
  depart: string;
  arrive: string;
  durationMin: number;
  kind: "nonstop" | "one_ticket" | "self_transfer" | "nearby" | "hidden_city" | "error_fare";
  ticketedDest?: string;
  getOff?: string;
};

export type SearchRequest = {
  origin: string;
  dest: string;
  date: string;
  maxLayoverHours: number;
  bags: number;
  bagKg: 23 | 32;
  seat: boolean;
  referencePrice?: number;
};

export type SearchResponse = {
  simple: Offer | null;
  detour: Offer | null;
  errorFare: Offer | null;
  hiddenCity: Offer | null;
  emptyReason: EmptyReason | null;
  origin: string;
  dest: string;
  date: string;
  maxLayoverHours: number;
  extras: { bags: number; bagKg: 23 | 32; seat: boolean; extrasEur: number };
  km: number;
  hasErrorNow: boolean;
  detourBeatsSimple: boolean;
  referencePrice?: number;
};
