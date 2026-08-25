export type Cabin = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type EmptyReason = "unknown_route" | "same_airport" | "past_date" | "bad_return" | "bad_range";

export const ANY_DEST = "ANY";

export type Airline = { code: string; name: string };

export type Leg = {
  from: string;
  to: string;
  fromName: string;
  toName: string;
  depart: string;
  arrive: string;
  durationMin: number;
  stops: string[];
  layoverMinutes: number;
  airlines: Airline[];
  date: string;
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
  ticketedDest: string;
  ticketedName: string;
};

export type SearchParams = {
  origin: string;
  dest: string;
  date: string;
  dateTo: string;
  returnDate: string | null;
  adults: number;
  cabin: Cabin;
  bags: number;
  maxLayoverHours: number;
  airline: string;
};

export function isAnywhere(code: string): boolean {
  return code === ANY_DEST || code.toLowerCase() === "anywhere";
}

export function kiwiPlaceId(code: string): string {
  return isAnywhere(code) ? "anywhere" : code;
}

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

export function shiftReturn(oldOut: string, oldRet: string, newOut: string): string {
  const [y1, m1, d1] = oldOut.split("-").map(Number);
  const [y2, m2, d2] = oldRet.split("-").map(Number);
  const days = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
  return addDays(newOut, days);
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

export function referenceWindow(
  start: string,
  end: string,
  now = new Date(),
): { date: string; dateTo: string; label: string } {
  const flex = isFlexible(start, end);
  const back = shiftWindow(start, end, -7);
  if (!isPastDate(back.date, now)) {
    return { ...back, label: flex ? "hace 7 días (misma ventana)" : "hace 7 días (misma ruta)" };
  }
  const fwd = shiftWindow(start, end, 7);
  return { ...fwd, label: flex ? "una semana después (misma ventana)" : "una semana después (misma ruta)" };
}

export function referenceDate(outbound: string, now = new Date()): { date: string; label: string } {
  const ref = referenceWindow(outbound, outbound, now);
  return { date: ref.date, label: ref.label };
}

export function errorCompare(nowPrice: number | null, refPrice: number | null): {
  savedEur: number | null;
  looksLikeError: boolean;
  looksLikeDiscount: boolean;
  kind: "error" | "discount" | null;
} {
  if (nowPrice == null || refPrice == null || refPrice <= 0) {
    return { savedEur: null, looksLikeError: false, looksLikeDiscount: false, kind: null };
  }
  const savedEur = Math.max(0, Math.round(refPrice - nowPrice));
  const looksLikeError = nowPrice <= refPrice * 0.5 && savedEur >= 80;
  const looksLikeDiscount = nowPrice <= refPrice * 0.75 && savedEur >= 25;
  const kind: "error" | "discount" | null = looksLikeError ? "error" : looksLikeDiscount ? "discount" : null;
  return { savedEur, looksLikeError, looksLikeDiscount, kind };
}

export function todayIso(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function isFlexible(date: string, dateTo: string | null | undefined): boolean {
  return Boolean(dateTo && dateTo !== date);
}

export function monthBounds(yyyyMm: string, now = new Date()): { start: string; end: string } | null {
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return null;
  const [y, m] = yyyyMm.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const last = new Date(y, m, 0).getDate();
  const end = `${y}-${String(m).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  if (isPastDate(end, now)) return null;
  const clamped = isPastDate(start, now) ? todayIso(now) : start;
  return { start: clamped, end };
}

export function defaultMonth(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), 1);
  if (now.getDate() > 20) d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function upcomingMonths(count = 12, now = new Date()): { value: string; label: string }[] {
  const fmt = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
  const out: { value: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = fmt.format(d);
    out.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return out;
}

export function shiftWindow(start: string, end: string, days: number): { date: string; dateTo: string } {
  return { date: addDays(start, days), dateTo: addDays(end, days) };
}

export const ALT_OFFSETS = [2, 3, 5, 7, 10, 15] as const;
export const ANY_ALT_OFFSETS = [3, 5, 10, 15] as const;

