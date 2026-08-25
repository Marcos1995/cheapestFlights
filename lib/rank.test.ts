import assert from "node:assert/strict";
import test from "node:test";
import { altOffsetsFor, dateHints, hiddenCityOf, rankFlights } from "./rank";
import type { LiveFlight } from "./types";

function flight(partial: Partial<LiveFlight> & Pick<LiveFlight, "id" | "priceEur" | "ticketedDest">): LiveFlight {
  const dest = partial.ticketedDest;
  return {
    bookingUrl: "https://www.kiwi.com/x",
    stopCount: partial.outbound?.stops.length ?? 0,
    durationMin: 120,
    layoverMinutes: partial.outbound?.layoverMinutes ?? 0,
    airlines: [{ code: "FR", name: "Ryanair" }],
    outbound: {
      from: "BCN",
      to: dest,
      fromName: "Barcelona",
      toName: dest,
      depart: "10:00",
      arrive: "12:00",
      durationMin: 120,
      stops: [],
      layoverMinutes: 0,
      airlines: [{ code: "FR", name: "Ryanair" }],
      date: "2026-09-15",
    },
    inbound: null,
    selfTransfer: false,
    ticketedName: dest,
    ...partial,
  };
}

test("error fares rank ahead of hidden city and normal, biggest cut first", () => {
  const now = [
    flight({ id: "direct", priceEur: 200, ticketedDest: "FCO" }),
    flight({ id: "error", priceEur: 80, ticketedDest: "MAD" }),
    flight({
      id: "hidden",
      priceEur: 90,
      ticketedDest: "RGS",
      outbound: {
        from: "BCN",
        to: "RGS",
        fromName: "Barcelona",
        toName: "Burgos",
        depart: "08:00",
        arrive: "14:00",
        durationMin: 360,
        stops: ["FCO"],
        layoverMinutes: 80,
        airlines: [{ code: "IB", name: "Iberia" }],
        date: "2026-09-15",
      },
    }),
  ];
  const ref = [
    flight({ id: "ref-fco", priceEur: 200, ticketedDest: "FCO" }),
    flight({ id: "ref-mad", priceEur: 220, ticketedDest: "MAD" }),
  ];
  const ranked = rankFlights(now, ref, "FCO", 0);
  assert.equal(ranked.error[0]?.flight.id, "error");
  assert.ok((ranked.error[0]?.savePct ?? 0) >= 50);
  assert.equal(ranked.hidden[0]?.flight.id, "hidden");
  assert.equal(ranked.hidden[0]?.getOff, "FCO");
  assert.equal(ranked.normal[0]?.id, "direct");
});

test("hidden city stays off with checked bags", () => {
  const hid = flight({
    id: "h",
    priceEur: 90,
    ticketedDest: "RGS",
    outbound: {
      from: "BCN",
      to: "RGS",
      fromName: "Barcelona",
      toName: "Burgos",
      depart: "08:00",
      arrive: "14:00",
      durationMin: 360,
      stops: ["FCO"],
        layoverMinutes: 80,
        airlines: [{ code: "IB", name: "Iberia" }],
        date: "2026-09-15",
      },
    });
  const map = new Map([["BCN-FCO", 200]]);
  assert.equal(hiddenCityOf(hid, "FCO", 1, map), null);
  assert.ok(hiddenCityOf(hid, "FCO", 0, map));
});

test("error fares compare the same origin-destination pair", () => {
  const now = [
    flight({
      id: "jfk-cheap",
      priceEur: 50,
      ticketedDest: "FCO",
      outbound: {
        from: "JFK",
        to: "FCO",
        fromName: "New York",
        toName: "Rome",
        depart: "10:00",
        arrive: "22:00",
        durationMin: 480,
        stops: [],
        layoverMinutes: 0,
        airlines: [{ code: "AA", name: "American" }],
        date: "2026-09-15",
      },
    }),
  ];
  const ref = [
    flight({ id: "bcn-ref", priceEur: 200, ticketedDest: "FCO" }),
    flight({
      id: "jfk-ref",
      priceEur: 400,
      ticketedDest: "FCO",
      outbound: {
        from: "JFK",
        to: "FCO",
        fromName: "New York",
        toName: "Rome",
        depart: "10:00",
        arrive: "22:00",
        durationMin: 480,
        stops: [],
        layoverMinutes: 0,
        airlines: [{ code: "AA", name: "American" }],
        date: "2026-09-15",
      },
    }),
  ];
  const ranked = rankFlights(now, ref, "ANY", 0);
  assert.equal(ranked.error[0]?.flight.id, "jfk-cheap");
  assert.equal(ranked.error[0]?.refPrice, 400);
});

test("date hints only keep real error drops", () => {
  const hints = dateHints(
    [
      { date: "2026-09-17", days: 2, cheapest: 180 },
      { date: "2026-09-20", days: 5, cheapest: 40 },
    ],
    200,
  );
  assert.equal(hints.length, 1);
  assert.equal(hints[0].days, 5);
  assert.equal(hints[0].savedEur, 160);
  assert.deepEqual(altOffsetsFor("ANY", "FCO"), []);
  assert.deepEqual(altOffsetsFor("BCN", "FCO", true), []);
});
