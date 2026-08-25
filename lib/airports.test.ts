import assert from "node:assert/strict";
import test from "node:test";
import { getAirport, searchAirports } from "./airports";

test("Frankfurt has both FRA and Hahn", () => {
  assert.ok(getAirport("FRA"));
  assert.ok(getAirport("HHN"));
  assert.equal(getAirport("HHN")?.city, "Fráncfort");
  const hits = searchAirports("franc", 12).map((a) => a.iata);
  assert.ok(hits.includes("FRA"));
  assert.ok(hits.includes("HHN"));
  assert.ok(hits.indexOf("FRA") < hits.indexOf("CDG") || !hits.includes("CDG"));
});
