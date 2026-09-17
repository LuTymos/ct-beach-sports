import { PAGE_SIZE } from "@/lib/list-params";

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
};

/**
 * Slice an already-loaded/filtered list for display pagination.
 * Ranking still computes the full ordered list in memory so positions stay correct.
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number = PAGE_SIZE
): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);

  return {
    items: slice,
    page: safePage,
    pageSize,
    total,
    totalPages,
    from: total === 0 ? 0 : start + 1,
    to: total === 0 ? 0 : start + slice.length,
  };
}
