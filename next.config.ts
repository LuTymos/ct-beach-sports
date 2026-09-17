import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders(),
      },
      {
        source: "/conta/ativar",
        headers: securityHeaders({ referrerPolicy: "no-referrer" }),
      },
    ];
  },
};

export default nextConfig;
