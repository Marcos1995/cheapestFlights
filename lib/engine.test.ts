import assert from "node:assert/strict";
import test from "node:test";
import { hasHardRisk, isPastDate, searchFlights } from "./engine";

const future = "2026-09-15";

test("past dates are rejected", () => {
  const res = searchFlights(
    { origin: "BCN", dest: "FCO", date: "2020-01-01", maxExtraHours: 6 },
    new Date("2026-08-25"),
  );
  assert.equal(res.emptyReason, "past_date");
  assert.equal(res.simple, null);
});

test("isPastDate treats today as valid", () => {
  assert.equal(isPastDate("2026-08-25", new Date(2026, 7, 25)), false);
  assert.equal(isPastDate("2026-08-24", new Date(2026, 7, 25)), true);
});

test("unknown origin or dest", () => {
  const mad = searchFlights({ origin: "MAD", dest: "FCO", date: future, maxExtraHours: 6 });
  assert.equal(mad.emptyReason, "unknown_route");
  const xyz = searchFlights({ origin: "BCN", dest: "XYZ", date: future, maxExtraHours: 6 });
  assert.equal(xyz.emptyReason, "unknown_route");
});

test("BCN-FCO simple vs legal detour vs hidden city never share a badge", () => {
  const res = searchFlights({ origin: "BCN", dest: "FCO", date: future, maxExtraHours: 6 });
  assert.ok(res.simple);
  assert.ok(res.detour);
  assert.ok(res.hiddenCity);
  assert.equal(res.simple?.bucket, "simple");
  assert.equal(res.detour?.bucket, "detour");
  assert.equal(res.hiddenCity?.bucket, "hidden_city");
  assert.notEqual(res.detour?.bucket, res.hiddenCity?.bucket);
});

test("savings math is simple minus candidate", () => {
  const res = searchFlights({ origin: "BCN", dest: "FCO", date: future, maxExtraHours: 6 });
  assert.equal(res.simple?.priceEur, 198);
  assert.equal(res.detour?.priceEur, 124);
  assert.equal(res.detour?.savedEur, 74);
  assert.equal(res.hiddenCity?.priceEur, 119);
  assert.equal(res.hiddenCity?.savedEur, 79);
});

test("hidden city is the Burgos-via-Rome template", () => {
  const res = searchFlights({ origin: "BCN", dest: "FCO", date: future, maxExtraHours: 6 });
  assert.equal(res.hiddenCity?.ticketedDest, "RGS");
  assert.equal(res.hiddenCity?.getOff, "FCO");
  assert.equal(res.hiddenCity?.flyAllSegments, false);
  assert.ok(res.hiddenCity && hasHardRisk(res.hiddenCity));
  assert.ok(!res.detour || !hasHardRisk(res.detour));
});

test("time cap drops long detours", () => {
  const tight = searchFlights({ origin: "BCN", dest: "AMS", date: future, maxExtraHours: 1 });
  assert.ok(tight.simple);
  assert.equal(tight.detour, null);
  const roomy = searchFlights({ origin: "BCN", dest: "AMS", date: future, maxExtraHours: 6 });
  assert.ok(roomy.detour);
  assert.equal(roomy.detour?.kind, "self_transfer");
});

test("never show a detour that is not cheaper than simple", () => {
  const res = searchFlights({ origin: "BCN", dest: "MXP", date: future, maxExtraHours: 6 });
  assert.ok(res.simple);
  assert.equal(res.detour, null);
  assert.equal(res.hiddenCity, null);
});

test("ATH has simple only", () => {
  const res = searchFlights({ origin: "BCN", dest: "ATH", date: future, maxExtraHours: 6 });
  assert.ok(res.simple);
  assert.equal(res.detour, null);
  assert.equal(res.hiddenCity, null);
});
