import assert from "node:assert/strict";
import test from "node:test";
import { googleFlightsUrl, kiwiBookingUrl, kiwiSearchUrl, skyscannerUrl } from "./links";
import { parseItineraries } from "./kiwi";
import { addDays, errorCompare, isPastDate, referenceDate, skyDate } from "./types";

test("isPastDate treats today as valid", () => {
  assert.equal(isPastDate("2026-08-25", new Date(2026, 7, 25)), false);
  assert.equal(isPastDate("2026-08-24", new Date(2026, 7, 25)), true);
});

test("google and skyscanner links carry the search", () => {
  const p = {
    origin: "BCN",
    dest: "FCO",
    date: "2026-09-15",
    returnDate: "2026-09-22",
    adults: 2,
    cabin: "BUSINESS" as const,
  };
  const g = googleFlightsUrl(p);
  assert.match(g, /google\.com\/travel\/flights/);
  assert.match(g, /BCN/);
  assert.match(g, /FCO/);
  assert.match(g, /2026-09-15/);
  assert.match(g, /2026-09-22/);
  const s = skyscannerUrl(p);
  assert.match(s, /skyscanner\.es\/transporte\/vuelos\/bcn\/fco\/260915\/260922/);
  assert.match(s, /adultsv2=2/);
  assert.match(s, /cabinclass=business/);
  assert.equal(skyDate("2026-09-15"), "260915");
});

test("kiwi booking urls are absolute", () => {
  assert.equal(kiwiBookingUrl("/es/booking/?token=abc"), "https://www.kiwi.com/es/booking/?token=abc");
  assert.equal(kiwiBookingUrl("https://www.kiwi.com/x"), "https://www.kiwi.com/x");
  const search = kiwiSearchUrl({ origin: "JFK", dest: "NRT", date: "2026-10-01", adults: 1 });
  assert.match(search, /kiwi\.com\/es\/search\/results\/jfk\/nrt\/2026-10-01\/no-return/);
});

test("week-ago reference prefers past week unless that date already passed", () => {
  const ref = referenceDate("2026-09-15", new Date(2026, 7, 25));
  assert.equal(ref.date, "2026-09-08");
  const later = referenceDate("2026-08-26", new Date(2026, 7, 25));
  assert.equal(later.date, addDays("2026-08-26", 7));
});

test("error fare needs a real drop vs the reference week", () => {
  assert.equal(errorCompare(200, 1000).looksLikeError, true);
  assert.equal(errorCompare(200, 1000).savedEur, 800);
  assert.equal(errorCompare(90, 100).looksLikeError, false);
  assert.equal(errorCompare(27, null).looksLikeError, false);
});

test("parser reads a live Kiwi one-way payload", () => {
  const flights = parseItineraries(
    {
      data: {
        onewayItineraries: {
          __typename: "Itineraries",
          itineraries: [
            {
              __typename: "ItineraryOneWay",
              id: "x",
              price: { amount: "27" },
              priceEur: { amount: "27" },
              sector: {
                duration: 6900,
                sectorSegments: [
                  {
                    segment: {
                      source: { station: { code: "BCN" }, localTime: "2026-09-15T20:15:00" },
                      destination: { station: { code: "FCO" }, localTime: "2026-09-15T22:10:00" },
                      duration: 6900,
                      carrier: { code: "FR", name: "Ryanair" },
                    },
                  },
                ],
              },
              bookingOptions: { edges: [{ node: { bookingUrl: "/es/booking/?token=t" } }] },
            },
          ],
        },
      },
    },
    false,
  );
  assert.equal(flights.length, 1);
  assert.equal(flights[0].priceEur, 27);
  assert.equal(flights[0].outbound.depart, "20:15");
  assert.equal(flights[0].stopCount, 0);
  assert.equal(flights[0].airlines[0].code, "FR");
  assert.equal(flights[0].ticketedDest, "FCO");
  assert.equal(flights[0].bookingUrl, "https://www.kiwi.com/es/booking/?token=t");
});

test("anywhere links drop the destination airport", () => {
  const p = { origin: "BCN", dest: "ANY", date: "2026-09-15", adults: 1, cabin: "ECONOMY" as const };
  assert.match(googleFlightsUrl(p), /desde/);
  assert.match(decodeURIComponent(googleFlightsUrl(p)), /desde BCN/);
  assert.match(skyscannerUrl(p), /vuelos-desde\/bcn\/260915/);
  assert.match(kiwiSearchUrl(p), /\/bcn\/anywhere\/2026-09-15/);
});
