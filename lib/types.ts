export type Cabin = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type EmptyReason = "unknown_route" | "same_airport" | "past_date" | "bad_return";

export type Airline = { code: string; name: string };

export type Leg = {
  depart: string;
  arrive: string;
  durationMin: number;
  stops: string[];
  layoverMinutes: number;
  airlines: Airline[];
};

export type LiveFlight = {
  id: string;
  priceEur: number;
  bookingUrl: string;
  stopCount: number;
  durationMin: number;
  layoverMinutes: number;
  airlines: Airline[];
  outbound: Leg;
  inbound: Leg | null;
  selfTransfer: boolean;
};

export type SearchParams = {
  origin: string;
  dest: string;
  date: string;
  returnDate: string | null;
  adults: number;
  cabin: Cabin;
  bags: number;
  maxLayoverHours: number;
  airline: string;
};

export type ErrorCompare = {
  refDate: string;
  refLabel: string;
  nowPrice: number | null;
  refPrice: number | null;
  savedEur: number | null;
  looksLikeError: boolean;
  nowFlight: LiveFlight | null;
  refFlight: LiveFlight | null;
};

export function isPastDate(date: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return true;
  const [y, m, d] = date.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return start < today;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function skyDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y.slice(2)}${m}${d}`;
}

export function defaultDate(offset = 21): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function referenceDate(outbound: string, now = new Date()): { date: string; label: string } {
  const weekBefore = addDays(outbound, -7);
  if (!isPastDate(weekBefore, now)) {
    return { date: weekBefore, label: "hace 7 días (misma ruta)" };
  }
  return { date: addDays(outbound, 7), label: "una semana después (misma ruta)" };
}

export function errorCompare(nowPrice: number | null, refPrice: number | null): {
  savedEur: number | null;
  looksLikeError: boolean;
} {
  if (nowPrice == null || refPrice == null || refPrice <= 0) {
    return { savedEur: null, looksLikeError: false };
  }
  const savedEur = Math.max(0, Math.round(refPrice - nowPrice));
  const looksLikeError = nowPrice <= refPrice * 0.75 && savedEur >= 25;
  return { savedEur, looksLikeError };
}
