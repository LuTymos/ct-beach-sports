import assert from "node:assert/strict";
import test from "node:test";
import { pickHomeFeaturedStage } from "./pick-home-stage";
import type { Stage } from "../../types";

function stage(partial: Partial<Stage> & Pick<Stage, "id" | "date" | "status">): Stage {
  return {
    title: partial.title ?? partial.id,
    location: null,
    audit_url: null,
    sort_order: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

test("pickHomeFeaturedStage prefers the next scheduled stage", () => {
  const next = pickHomeFeaturedStage([
    stage({ id: "done", date: "2026-03-01", status: "completed", sort_order: 1 }),
    stage({ id: "later", date: "2026-08-01", status: "scheduled", sort_order: 3 }),
    stage({ id: "soon", date: "2026-06-01", status: "scheduled", sort_order: 2 }),
  ]);
  assert.equal(next?.id, "soon");
});

test("pickHomeFeaturedStage falls back to the last completed stage", () => {
  const last = pickHomeFeaturedStage([
    stage({ id: "older", date: "2026-02-01", status: "completed", sort_order: 1 }),
    stage({ id: "newer", date: "2026-04-01", status: "completed", sort_order: 2 }),
  ]);
  assert.equal(last?.id, "newer");
});

test("pickHomeFeaturedStage returns null when there are no stages", () => {
  assert.equal(pickHomeFeaturedStage([]), null);
});
