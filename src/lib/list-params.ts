export const PAGE_SIZE = 25;

export function parsePage(value: string | undefined | null): number {
  const n = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function parseSearch(value: string | undefined | null): string {
  return (value ?? "").trim();
}

export type ListHrefParams = {
  q?: string;
  page?: number;
  [key: string]: string | number | undefined;
};

/** Build list URL; omits page=1 and empty q. */
export function buildListHref(path: string, params: ListHrefParams = {}): string {
  const search = new URLSearchParams();

  for (const [key, raw] of Object.entries(params)) {
    if (raw === undefined || raw === null) continue;
    if (key === "page") {
      const page = typeof raw === "number" ? raw : parsePage(String(raw));
      if (page > 1) search.set("page", String(page));
      continue;
    }
    if (key === "q") {
      const q = String(raw).trim();
      if (q) search.set("q", q);
      continue;
    }
    const value = String(raw).trim();
    if (value) search.set(key, value);
  }

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function matchesSearch(haystack: string | null | undefined, q: string): boolean {
  if (!q) return true;
  return (haystack ?? "").toLowerCase().includes(q.toLowerCase());
}
