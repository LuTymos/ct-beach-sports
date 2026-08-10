import type { ResultCategory, ResultLevel } from "@/lib/categories";

export type RankingFilters = {
  categoria?: ResultCategory | "todos";
  nivel?: ResultLevel | "todos";
};

export function buildRankingHref(basePath: string, filters: RankingFilters): string {
  const params = new URLSearchParams();

  if (filters.categoria && filters.categoria !== "todos") {
    params.set("categoria", filters.categoria);
  }

  if (filters.nivel && filters.nivel !== "todos") {
    params.set("nivel", filters.nivel);
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
