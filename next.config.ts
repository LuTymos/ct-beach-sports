import type { NextConfig } from "next";

function contentSecurityPolicy(): string {
  let connect = "'self'";
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (supabase) {
    try {
      const origin = new URL(supabase).origin;
      connect = `'self' ${origin} ${origin.replace("https://", "wss://")}`;
    } catch {
      // env inválida
    }
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

function securityHeaders(referrerPolicy = "strict-origin-when-cross-origin") {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: referrerPolicy },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Content-Security-Policy", value: contentSecurityPolicy() },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ];
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(),
      },
      {
        source: "/conta/ativar",
        headers: securityHeaders("no-referrer"),
      },
    ];
  },
};

export default nextConfig;
