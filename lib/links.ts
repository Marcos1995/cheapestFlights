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
  const people = `${p.adults} adulto${p.adults === 1 ? "" : "s"}`;
  const trip = p.returnDate
    ? `ida ${p.date} vuelta ${p.returnDate}`
    : `el ${p.date} solo ida`;
  const anywhere = isAnywhere(p.dest);
  let q = anywhere
    ? `Vuelos desde ${p.origin} ${trip}, ${people}, clase ${CABIN_ES[p.cabin]}`
    : `Vuelos de ${p.origin} a ${p.dest} ${trip}, ${people}, clase ${CABIN_ES[p.cabin]}`;
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
  const o = p.origin.toLowerCase();
  const out = skyDate(p.date);
  const ret = p.returnDate ? `${skyDate(p.returnDate)}/` : "";
  const rtn = p.returnDate ? "1" : "0";
  const anywhere = isAnywhere(p.dest);
  if (anywhere) {
    return `https://www.skyscanner.es/transporte/vuelos-desde/${o}/${out}/${ret}?adultsv2=${p.adults}&cabinclass=${CABIN_SKY[p.cabin]}&rtn=${rtn}`;
  }
  const d = p.dest.toLowerCase();
  return `https://www.skyscanner.es/transporte/vuelos/${o}/${d}/${out}/${ret}?adultsv2=${p.adults}&cabinclass=${CABIN_SKY[p.cabin]}&rtn=${rtn}`;
}

export function kiwiSearchUrl(p: {
  origin: string;
  dest: string;
  date: string;
  returnDate?: string | null;
  adults: number;
}): string {
  const ret = p.returnDate ?? "no-return";
  const d = isAnywhere(p.dest) ? "anywhere" : p.dest.toLowerCase();
  return `https://www.kiwi.com/es/search/results/${p.origin.toLowerCase()}/${d}/${p.date}/${ret}?adults=${p.adults}`;
}

export function kiwiBookingUrl(path: string): string {
  if (!path) return "https://www.kiwi.com/es/";
  if (path.startsWith("http")) return path;
  return `https://www.kiwi.com${path.startsWith("/") ? path : `/${path}`}`;
}

export function airlineLogo(code: string): string {
  return `https://images.kiwi.com/airlines/64/${code.toUpperCase()}.png`;
}
