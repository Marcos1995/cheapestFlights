export type Bucket = "simple" | "detour" | "hidden_city";

export type Risk =
  | "self_transfer"
  | "hidden_city"
  | "checked_bag_hidden_city"
  | "extra_time_over_6h";

export type EmptyReason =
  | "unknown_route"
  | "no_detour"
  | "no_hidden_city"
  | "no_simple"
  | "past_date";

export type Offer = {
  bucket: Bucket;
  priceEur: number;
  savedEur: number | null;
  extraMinutes: number;
  airlines: string[];
  stops: string[];
  flyAllSegments: boolean;
  riskFlags: Risk[];
  source: "mock";
  explanation: string;
  depart: string;
  arrive: string;
  durationMin: number;
  kind: "nonstop" | "one_ticket" | "self_transfer" | "nearby" | "hidden_city";
  ticketedDest?: string;
  getOff?: string;
};

export type SearchRequest = {
  origin: string;
  dest: string;
  date: string;
  maxExtraHours: number;
  referencePrice?: number;
};

export type SearchResponse = {
  simple: Offer | null;
  detour: Offer | null;
  hiddenCity: Offer | null;
  emptyReason: EmptyReason | null;
  origin: string;
  dest: string;
  date: string;
  maxExtraHours: number;
  referencePrice?: number;
};

export type CatalogFare = {
  origin: string;
  dest: string;
  priceEur: number;
  durationMin: number;
  airlines: string[];
  stops: string[];
  depart: string;
  arrive: string;
  explanation: string;
  kind: Offer["kind"];
  flyAllSegments: boolean;
  ticketedDest?: string;
  getOff?: string;
  intent?: string;
};
