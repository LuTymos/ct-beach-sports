import type { CategoryRankingRow, RankingRow } from "@/types";
import { isResultCategory, type ResultCategory } from "@/lib/categories";
import { toSingleCategoryRanking } from "@/features/ranking/to-single-category-ranking";

export type PodiumFilter = ResultCategory | "geral";

const PODIUM_QUERY_KEY = "podio";

const PODIUM_SIZE = 3;

export function parsePodiumFilter(value: string | string[] | undefined): PodiumFilter {
  if (typeof value !== "string" || !value) return "geral";
  return isResultCategory(value) ? value : "geral";
}

export function buildPodiumHref(filter: PodiumFilter): string {
  return filter === "geral" ? "/" : `/?${PODIUM_QUERY_KEY}=${filter}`;
}

export function pickPodium(rows: CategoryRankingRow[], filter: PodiumFilter): RankingRow[] {
  if (filter !== "geral") {
    return toSingleCategoryRanking(rows, filter).slice(0, PODIUM_SIZE);
  }
  return rows.slice(0, PODIUM_SIZE).map((row) => ({
    athleteId: row.athleteId,
    name: row.name,
    team: row.team,
    totalPoints: row.totalPoints,
    position: row.position,
  }));
}

export function arrangePodium(
  top: RankingRow[]
): [RankingRow | null, RankingRow | null, RankingRow | null] {
  return [top[1] ?? null, top[0] ?? null, top[2] ?? null];
}
