import assert from "node:assert/strict";
import test from "node:test";
import { altOffsetsFor, dateHints, filterScan, hiddenCityOf, legalDetourOf, rankFlights, typicalByRoute } from "./rank";
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

test("error fares rank ahead of hidden city; weekly sales are discounts, not errors", () => {
  const now = [
    flight({ id: "direct", priceEur: 200, ticketedDest: "FCO" }),
    flight({ id: "sale", priceEur: 140, ticketedDest: "AMS" }),
    flight({ id: "error", priceEur: 80, ticketedDest: "MAD" }),
    flight({
      id: "detour",
      priceEur: 150,
      ticketedDest: "FCO",
      stopCount: 1,
      outbound: {
        from: "BCN",
        to: "FCO",
        fromName: "Barcelona",
        toName: "Rome",
        depart: "08:00",
        arrive: "14:00",
        durationMin: 360,
        stops: ["CDG"],
        layoverMinutes: 80,
        airlines: [{ code: "VY", name: "Vueling" }],
        date: "2026-09-15",
      },
    }),
    flight({
      id: "hidden",
      priceEur: 90,
      ticketedDest: "RGS",
      stopCount: 1,
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
    flight({ id: "ref-ams", priceEur: 200, ticketedDest: "AMS" }),
    flight({ id: "ref-mad", priceEur: 220, ticketedDest: "MAD" }),
  ];
  const ranked = rankFlights(now, ref, "FCO", 0);
  assert.equal(ranked.error[0]?.flight.id, "error");
  assert.equal(ranked.error[0]?.kind, "error");
  assert.ok((ranked.error[0]?.savePct ?? 0) >= 50);
  assert.equal(ranked.detour[0]?.flight.id, "detour");
  assert.equal(ranked.detour[0]?.savedEur, 50);
  assert.equal(ranked.discount[0]?.flight.id, "sale");
  assert.equal(ranked.discount[0]?.kind, "discount");
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
      { date: "2026-09-17", days: 2, cheapest: 150 },
      { date: "2026-09-18", days: 3, cheapest: 180 },
      { date: "2026-09-20", days: 5, cheapest: 40 },
    ],
    200,
  );
  assert.equal(hints.length, 2);
  assert.equal(hints[0].days, 2);
  assert.equal(hints[0].kind, "discount");
  assert.equal(hints[1].days, 5);
  assert.equal(hints[1].savedEur, 160);
  assert.equal(hints[1].kind, "error");
  assert.deepEqual(altOffsetsFor("ANY", "FCO"), []);
  assert.deepEqual(altOffsetsFor("BCN", "FCO", true), []);
});

test("legal detour needs a real save vs the direct to the same city", () => {
  const stop = flight({
    id: "d",
    priceEur: 150,
    ticketedDest: "FCO",
    stopCount: 1,
    outbound: {
      from: "BCN",
      to: "FCO",
      fromName: "Barcelona",
      toName: "Rome",
      depart: "08:00",
      arrive: "14:00",
      durationMin: 360,
      stops: ["CDG"],
      layoverMinutes: 80,
      airlines: [{ code: "VY", name: "Vueling" }],
      date: "2026-09-15",
    },
  });
  assert.equal(legalDetourOf(stop, "FCO", new Map([["BCN-FCO", 200]]))?.savedEur, 50);
  assert.equal(legalDetourOf(stop, "FCO", new Map([["BCN-FCO", 160]])), null);
});

test("in-scan typical price needs two fares on the same route", () => {
  const cheap = flight({ id: "a", priceEur: 80, ticketedDest: "FCO" });
  const dear = flight({ id: "b", priceEur: 200, ticketedDest: "FCO" });
  const typical = typicalByRoute([cheap, dear]);
  assert.equal(typical.get("BCN-FCO"), 200);
  assert.equal(typicalByRoute([cheap]).size, 0);
});

test("filterScan keeps origin, dest-or-stop, and date window", () => {
  const via = flight({
    id: "via",
    priceEur: 90,
    ticketedDest: "RGS",
    stopCount: 1,
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
  const other = flight({ id: "mad", priceEur: 70, ticketedDest: "MAD" });
  const out = filterScan([via, other], {
    origin: "BCN",
    dest: "FCO",
    date: "2026-09-01",
    dateTo: "2026-09-30",
    airline: "",
    maxLayoverHours: 12,
  });
  assert.equal(out.length, 1);
  assert.equal(out[0].id, "via");
});
