import type { ResultCategory, ResultLevel } from "@/lib/categories";

export const RANKING_PATH = "/ranking";

export const HOME_RANKING_QUERY_KEYS = ["categoria", "nivel", "q", "page"] as const;

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

type HomeSearchParams = {
  categoria?: string;
  nivel?: string;
  q?: string;
  page?: string;
};

/** Old home deep links (`/?categoria=` etc.) move to `/ranking` with the same params. */
export function rankingRedirectFromHomeSearch(search: HomeSearchParams): string | null {
  const params = new URLSearchParams();

  for (const key of HOME_RANKING_QUERY_KEYS) {
    const value = search[key]?.trim();
    if (value) params.set(key, value);
  }

  if ([...params.keys()].length === 0) return null;
  return `${RANKING_PATH}?${params.toString()}`;
}
