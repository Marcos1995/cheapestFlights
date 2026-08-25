import assert from "node:assert/strict";
import test from "node:test";
import { extrasEur, hasErrorOnDate, hasHardRisk, isPastDate, nextErrorDates, searchFlights } from "./engine";

const future = "2026-09-15";
const baseReq = {
  origin: "BCN",
  dest: "FCO",
  date: future,
  maxLayoverHours: 6,
  bags: 0,
  bagKg: 23 as const,
  seat: false,
};

test("past dates are rejected", () => {
  const res = searchFlights({ ...baseReq, date: "2020-01-01" }, new Date("2026-08-25"));
  assert.equal(res.emptyReason, "past_date");
  assert.equal(res.simple, null);
});

test("isPastDate treats today as valid", () => {
  assert.equal(isPastDate("2026-08-25", new Date(2026, 7, 25)), false);
  assert.equal(isPastDate("2026-08-24", new Date(2026, 7, 25)), true);
});

test("unknown and same airport", () => {
  assert.equal(searchFlights({ ...baseReq, dest: "XYZ" }).emptyReason, "unknown_route");
  assert.equal(searchFlights({ ...baseReq, dest: "BCN" }).emptyReason, "same_airport");
});

test("any world pair gets a simple fare", () => {
  const res = searchFlights({ ...baseReq, origin: "JFK", dest: "NRT" });
  assert.ok(res.simple);
  assert.equal(res.simple?.bucket, "simple");
  assert.ok((res.km ?? 0) > 8000);
});

test("MAD-FCO also works (Barcelona was only an example)", () => {
  const res = searchFlights({ ...baseReq, origin: "MAD", dest: "FCO" });
  assert.ok(res.simple);
  assert.equal(res.emptyReason, null);
});

test("badges never mix", () => {
  const res = searchFlights(baseReq);
  assert.ok(res.simple);
  if (res.detour) assert.equal(res.detour.bucket, "detour");
  if (res.errorFare) assert.equal(res.errorFare.bucket, "error_fare");
  if (res.hiddenCity) assert.equal(res.hiddenCity.bucket, "hidden_city");
});

test("a cheaper detour is actually cheaper than the standard direct", () => {
  const res = searchFlights(baseReq);
  if (res.detour) {
    assert.ok(res.simple);
    assert.ok(res.detour.baseEur < res.simple!.baseEur);
    assert.ok((res.detour.savedEur ?? 0) > 0);
    assert.ok(res.detourBeatsSimple);
  }
});

test("layover cap can drop the detour", () => {
  const tight = searchFlights({ ...baseReq, maxLayoverHours: 1 });
  const roomy = searchFlights({ ...baseReq, maxLayoverHours: 12 });
  if (tight.detour && roomy.detour) {
    assert.ok(tight.detour.layoverMinutes <= 60);
  }
  if (roomy.detour) assert.ok(roomy.detour.layoverMinutes <= 12 * 60);
});

test("bags and seat add the same extras to every bucket", () => {
  const plain = searchFlights(baseReq);
  const loaded = searchFlights({ ...baseReq, bags: 2, bagKg: 23, seat: true });
  const extra = extrasEur(2, 23, true);
  assert.equal(extra, 32 * 2 + 24);
  assert.ok(plain.simple && loaded.simple);
  assert.equal(loaded.simple!.priceEur - plain.simple!.priceEur, extra);
  assert.equal(loaded.extras.extrasEur, extra);
});

test("hidden city stays off if you check bags", () => {
  const carry = searchFlights(baseReq);
  const checked = searchFlights({ ...baseReq, bags: 1 });
  if (carry.hiddenCity) {
    assert.ok(hasHardRisk(carry.hiddenCity));
    assert.equal(checked.hiddenCity, null);
  }
});

test("error fares are deterministic by date", () => {
  const dates = nextErrorDates("BCN", "JFK", future, 40);
  assert.ok(dates.length >= 1);
  for (const d of dates) assert.equal(hasErrorOnDate("BCN", "JFK", d), true);
  const hit = searchFlights({ ...baseReq, origin: "BCN", dest: "JFK", date: dates[0] });
  assert.equal(hit.hasErrorNow, true);
  assert.ok(hit.errorFare);
  assert.ok(hit.simple);
  assert.ok(hit.errorFare!.baseEur < hit.simple!.baseEur);
});
