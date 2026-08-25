import type { Cabin } from "./types";
import { isAnywhere, skyDate } from "./types";

const CABIN_ES: Record<Cabin, string> = {
  ECONOMY: "turista",
  PREMIUM_ECONOMY: "turista premium",
  BUSINESS: "business",
  FIRST: "primera",
};

const CABIN_SKY: Record<Cabin, string> = {
  ECONOMY: "economy",
  PREMIUM_ECONOMY: "premiumeconomy",
  BUSINESS: "business",
  FIRST: "first",
};

export function googleFlightsUrl(p: {
  origin: string;
  dest: string;
  date: string;
  returnDate?: string | null;
  adults: number;
  cabin: Cabin;
  airlineName?: string;
}): string {
  const anyOrigin = isAnywhere(p.origin);
  const anyDest = isAnywhere(p.dest);
  const people = `${p.adults} adulto${p.adults === 1 ? "" : "s"}`;
  const trip = p.returnDate
    ? `ida ${p.date} vuelta ${p.returnDate}`
    : `el ${p.date} solo ida`;
  let q: string;
  if (anyOrigin && anyDest) q = `Vuelos baratos ${trip}, ${people}, clase ${CABIN_ES[p.cabin]}`;
  else if (anyOrigin) q = `Vuelos a ${p.dest} ${trip}, ${people}, clase ${CABIN_ES[p.cabin]}`;
  else if (anyDest) q = `Vuelos desde ${p.origin} ${trip}, ${people}, clase ${CABIN_ES[p.cabin]}`;
  else q = `Vuelos de ${p.origin} a ${p.dest} ${trip}, ${people}, clase ${CABIN_ES[p.cabin]}`;
  if (p.airlineName) q += `, aerolínea ${p.airlineName}`;
  return `https://www.google.com/travel/flights?hl=es&gl=ES&curr=EUR&q=${encodeURIComponent(q)}`;
}

export function skyscannerUrl(p: {
  origin: string;
  dest: string;
  date: string;
  returnDate?: string | null;
  adults: number;
  cabin: Cabin;
}): string {
  const out = skyDate(p.date);
  const ret = p.returnDate ? `${skyDate(p.returnDate)}/` : "";
  const rtn = p.returnDate ? "1" : "0";
  const anyOrigin = isAnywhere(p.origin);
  const anyDest = isAnywhere(p.dest);
  const cabin = `adultsv2=${p.adults}&cabinclass=${CABIN_SKY[p.cabin]}&rtn=${rtn}`;
  if (anyOrigin && anyDest) {
    return `https://www.skyscanner.es/vuelos/?${cabin}`;
  }
  if (anyOrigin) {
    return `https://www.skyscanner.es/transporte/vuelos-hacia/${p.dest.toLowerCase()}/${out}/${ret}?${cabin}`;
  }
  if (anyDest) {
    return `https://www.skyscanner.es/transporte/vuelos-desde/${p.origin.toLowerCase()}/${out}/${ret}?${cabin}`;
  }
  return `https://www.skyscanner.es/transporte/vuelos/${p.origin.toLowerCase()}/${p.dest.toLowerCase()}/${out}/${ret}?${cabin}`;
}

export function kiwiSearchUrl(p: {
  origin: string;
  dest: string;
  date: string;
  returnDate?: string | null;
  adults: number;
}): string {
  const ret = p.returnDate ?? "no-return";
  const o = isAnywhere(p.origin) ? "anywhere" : p.origin.toLowerCase();
  const d = isAnywhere(p.dest) ? "anywhere" : p.dest.toLowerCase();
  return `https://www.kiwi.com/es/search/results/${o}/${d}/${p.date}/${ret}?adults=${p.adults}`;
}

export function kiwiBookingUrl(path: string): string {
  if (!path) return "https://www.kiwi.com/es/";
  if (path.startsWith("http")) return path;
  return `https://www.kiwi.com${path.startsWith("/") ? path : `/${path}`}`;
}

export function airlineLogo(code: string): string {
  return `https://images.kiwi.com/airlines/64/${code.toUpperCase()}.png`;
}
