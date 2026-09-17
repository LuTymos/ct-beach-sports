import { getSupabaseUrl } from "@/lib/supabase/config";

export function contentSecurityPolicy(): string {
  let connect = "'self'";
  try {
    const supabase = getSupabaseUrl();
    if (supabase) {
      const origin = new URL(supabase).origin;
      connect = `'self' ${origin} ${origin.replace("https://", "wss://")}`;
    }
  } catch {
    // env ausente no build
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    `connect-src ${connect}`,
    "upgrade-insecure-requests",
  ].join("; ");
}

export function securityHeaders(opts?: { referrerPolicy?: string }): { key: string; value: string }[] {
  const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: opts?.referrerPolicy ?? "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  ];

  if (process.env.NODE_ENV === "production") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    });
  }

  return headers;
}

export function applySecurityHeaders(
  headers: Headers,
  opts?: { referrerPolicy?: string }
) {
  for (const { key, value } of securityHeaders(opts)) {
    headers.set(key, value);
  }
}
