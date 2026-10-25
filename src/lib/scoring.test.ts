import assert from "node:assert/strict";
import test from "node:test";
import {
  PARTICIPATION_POINTS,
  PLACEMENTS,
  PODIUM_SERIES,
  calculatePoints,
  getPodiumTable,
} from "./scoring";

test("calculatePoints follows the podium table for Ouro, Prata and Bronze", () => {
  assert.deepEqual(PLACEMENTS.map((p) => calculatePoints("ouro", p)), [100, 80, 60, 50]);
  assert.deepEqual(PLACEMENTS.map((p) => calculatePoints("prata", p)), [50, 40, 30, 20]);
  assert.deepEqual(PLACEMENTS.map((p) => calculatePoints("bronze", p)), [30, 20, 10, 5]);
});

test("bronzinho is always 5 points and participacao needs no placement", () => {
  for (const placement of PLACEMENTS) {
    assert.equal(calculatePoints("bronzinho", placement), 5);
  }
  assert.equal(PARTICIPATION_POINTS, 5);
  assert.equal(calculatePoints("participacao", null), PARTICIPATION_POINTS);
});

test("calculatePoints rejects a missing placement for podium series and bronzinho", () => {
  assert.throws(() => calculatePoints("ouro", null));
  assert.throws(() => calculatePoints("bronzinho", null));
});

test("getPodiumTable has one row per placement, in order, with every podium series", () => {
  const table = getPodiumTable();
  assert.deepEqual(table.map((row) => row.placement), [1, 2, 3, 4]);
  for (const row of table) {
    assert.deepEqual(Object.keys(row.points), [...PODIUM_SERIES]);
  }
});

test("getPodiumTable matches calculatePoints for every cell", () => {
  for (const row of getPodiumTable()) {
    for (const series of PODIUM_SERIES) {
      assert.equal(row.points[series], calculatePoints(series, row.placement));
    }
  }
});
