import assert from "node:assert/strict";
import test from "node:test";
import {
  RANKING_PATH,
  buildRankingHref,
  rankingRedirectFromHomeSearch,
} from "./ranking-href";

test("buildRankingHref omits todos and empty search", () => {
  assert.equal(
    buildRankingHref(RANKING_PATH, { categoria: "todos", nivel: "todos", q: "  " }),
    RANKING_PATH
  );
  assert.equal(
    buildRankingHref(RANKING_PATH, { categoria: "misto", nivel: "iniciante", q: "Ana", page: 2 }),
    "/ranking?categoria=misto&nivel=iniciante&q=Ana&page=2"
  );
});

test("rankingRedirectFromHomeSearch keeps ranking query keys", () => {
  assert.equal(rankingRedirectFromHomeSearch({}), null);
  assert.equal(rankingRedirectFromHomeSearch({ foo: "x" } as never), null);
  assert.equal(
    rankingRedirectFromHomeSearch({ categoria: "misto", nivel: "avancado", q: " Li ", page: "2" }),
    "/ranking?categoria=misto&nivel=avancado&q=Li&page=2"
  );
  assert.equal(rankingRedirectFromHomeSearch({ q: "   " }), null);
});
