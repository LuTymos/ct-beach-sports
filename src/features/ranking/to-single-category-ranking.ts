import type { CategoryRankingRow, RankingRow } from "@/types";
import type { ResultCategory } from "@/lib/categories";

export function toSingleCategoryRanking(
  rows: CategoryRankingRow[],
  category: ResultCategory
): RankingRow[] {
  return rows
    .filter((row) => row.byCategory[category] != null)
    .map((row) => {
      const standing = row.byCategory[category]!;
      return {
        athleteId: row.athleteId,
        name: row.name,
        team: row.team,
        totalPoints: standing.points,
        position: standing.position,
      };
    })
    .sort(
      (a, b) =>
        a.position - b.position ||
        b.totalPoints - a.totalPoints ||
        a.name.localeCompare(b.name, "pt-BR")
    );
}
