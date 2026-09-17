/** Relative in-app path only — blocks protocol-relative and off-site `next`. */
export function safeInternalPath(
  raw: string | null | undefined,
  fallback: string
): string {
  if (!raw) return fallback;
  const value = raw.trim();
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.includes("\\") || value.includes("@")) return fallback;
  if (value.includes("://")) return fallback;

  try {
    const url = new URL(value, "https://ct.invalid");
    if (url.origin !== "https://ct.invalid") return fallback;
    if (url.username || url.password) return fallback;
    if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) {
      return fallback;
    }
    if (url.pathname.includes("\\")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function isSafeHttpsUrl(raw: string | null | undefined): boolean {
  if (!raw) return false;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    if (!url.hostname || url.hostname.includes(" ") || url.hostname.includes("\n")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function safeHttpsHref(raw: string | null | undefined): string | null {
  return isSafeHttpsUrl(raw) ? raw! : null;
}

function parseOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

/** Origins allowed for Auth invite/recovery `redirectTo`. */
export function allowedSiteOrigins(): string[] {
  const origins = new Set<string>();
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site) {
    const origin = parseOrigin(site);
    if (origin) origins.add(origin);
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const origin = parseOrigin(vercel.includes("://") ? vercel : `https://${vercel}`);
    if (origin) origins.add(origin);
  }
  origins.add("http://localhost:3000");
  origins.add("http://127.0.0.1:3000");
  return [...origins];
}

export function siteOrigin(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const origin = parseOrigin(configured.replace(/\/$/, "")) ?? "http://localhost:3000";
  const allowed = allowedSiteOrigins();
  return allowed.includes(origin) ? origin : allowed[0] ?? "http://localhost:3000";
}
