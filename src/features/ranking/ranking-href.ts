import type { ResultCategory, ResultLevel } from "@/lib/categories";

export type RankingFilters = {
  categoria?: ResultCategory | "todos";
  nivel?: ResultLevel | "todos";
  /** Search by athlete name; omitted when empty. */
  q?: string;
  /** Display page after full ranking is computed; omitted when 1. */
  page?: number;
};

export function buildRankingHref(basePath: string, filters: RankingFilters): string {
  const params = new URLSearchParams();

  if (filters.categoria && filters.categoria !== "todos") {
    params.set("categoria", filters.categoria);
  }

  if (filters.nivel && filters.nivel !== "todos") {
    params.set("nivel", filters.nivel);
  }

  const q = filters.q?.trim();
  if (q) {
    params.set("q", q);
  }

  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
