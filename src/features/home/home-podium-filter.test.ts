import assert from "node:assert/strict";
import test from "node:test";
import type { CategoryRankingRow } from "@/types";
import type { ResultCategory } from "@/lib/categories";
import { rankingRedirectFromHomeSearch } from "@/features/ranking/ranking-href";
import {
  arrangePodium,
  buildPodiumHref,
  parsePodiumFilter,
  pickPodium,
} from "./home-podium-filter";

type Draft = {
  id: string;
  name: string;
  total: number;
  byCategory: Record<ResultCategory, number | null>;
};

function draft(
  id: string,
  name: string,
  total: number,
  byCategory: Partial<Record<ResultCategory, number>> = {}
): Draft {
  return {
    id,
    name,
    total,
    byCategory: {
      misto: byCategory.misto ?? null,
      masculino: byCategory.masculino ?? null,
      feminino: byCategory.feminino ?? null,
    },
  };
}

// Mirrors the app: ties share a position, the next position skips.
function positionOf(points: number, all: number[]): number {
  return all.filter((p) => p > points).length + 1;
}

function build(drafts: Draft[]): CategoryRankingRow[] {
  const totals = drafts.map((d) => d.total);
  const categories: ResultCategory[] = ["misto", "masculino", "feminino"];
  const catPoints = Object.fromEntries(
    categories.map((c) => [
      c,
      drafts.flatMap((d) => (d.byCategory[c] == null ? [] : [d.byCategory[c] as number])),
    ])
  ) as Record<ResultCategory, number[]>;

  return drafts
    .map((d) => ({
      athleteId: d.id,
      name: d.name,
      team: null,
      totalPoints: d.total,
      position: positionOf(d.total, totals),
      byCategory: Object.fromEntries(
        categories.map((c) => {
          const pts = d.byCategory[c];
          return [c, pts == null ? null : { points: pts, position: positionOf(pts, catPoints[c]) }];
        })
      ) as CategoryRankingRow["byCategory"],
    }))
    .sort((a, b) => a.position - b.position);
}

test("parsePodiumFilter falls back to geral", () => {
  assert.equal(parsePodiumFilter(undefined), "geral");
  assert.equal(parsePodiumFilter(""), "geral");
  assert.equal(parsePodiumFilter("xyz"), "geral");
  assert.equal(parsePodiumFilter(["misto", "feminino"]), "geral");
  assert.equal(parsePodiumFilter("misto"), "misto");
});

test("buildPodiumHref omits the query for geral", () => {
  assert.equal(buildPodiumHref("geral"), "/");
  assert.equal(buildPodiumHref("feminino"), "/?podio=feminino");
});

test("podio param does not trigger the legacy ranking redirect", () => {
  assert.equal(rankingRedirectFromHomeSearch({ podio: "misto" } as never), null);
});

test("pickPodium geral returns the top 3 by total, keeping tied positions", () => {
  const rows = build([
    draft("a", "A", 100),
    draft("b", "B", 80),
    draft("c", "C", 80),
    draft("d", "D", 10),
  ]);
  assert.deepEqual(rows.map((r) => r.position), [1, 2, 2, 4]);
  const top = pickPodium(rows, "geral");
  assert.deepEqual(top.map((r) => r.name), ["A", "B", "C"]);
  assert.deepEqual(top.map((r) => r.position), [1, 2, 2]);
  assert.deepEqual(top.map((r) => r.totalPoints), [100, 80, 80]);
});

test("pickPodium by category uses that category's points and ignores athletes without it", () => {
  const rows = build([
    draft("a", "A", 200, { masculino: 200 }),
    draft("b", "B", 130, { feminino: 100, misto: 30 }),
    draft("c", "C", 60, { feminino: 60 }),
    draft("d", "D", 50, { misto: 50 }),
  ]);
  const top = pickPodium(rows, "feminino");
  assert.deepEqual(top.map((r) => r.name), ["B", "C"]);
  assert.deepEqual(top.map((r) => r.totalPoints), [100, 60]);
  assert.deepEqual(top.map((r) => r.position), [1, 2]);
});

test("pickPodium returns [] for empty input", () => {
  assert.deepEqual(pickPodium([], "geral"), []);
  assert.deepEqual(pickPodium([], "misto"), []);
});

test("arrangePodium orders 2nd, 1st, 3rd and pads with null", () => {
  const rows = build([draft("a", "A", 30), draft("b", "B", 20), draft("c", "C", 10)]);
  const [a, b, c] = pickPodium(rows, "geral");
  assert.deepEqual(arrangePodium([a, b, c]), [b, a, c]);
  assert.deepEqual(arrangePodium([a]), [null, a, null]);
  assert.deepEqual(arrangePodium([]), [null, null, null]);
});
