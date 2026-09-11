"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Invite/recovery from `generateLink` uses implicit flow (#access_token=...).
 * Magic-link / PKCE uses ?code=. Handle both; never fail before reading the hash.
 */
export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Validando link…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = createClient();
      const nextRaw = searchParams.get("next") ?? "/conta/definir-senha";
      const next = nextRaw.startsWith("/") ? nextRaw : "/conta/definir-senha";
      const code = searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (error) {
          router.replace(
            `/conta/login?error=${encodeURIComponent(error.message || "Link inválido ou expirado")}`
          );
          return;
        }
        router.replace(next);
        return;
      }

      const hash = window.location.hash.replace(/^#/, "");
      if (hash) {
        const params = new URLSearchParams(hash);
        const errorCode = params.get("error_code") ?? params.get("error");
        const errorDescription = params.get("error_description")?.replace(/\+/g, " ");

        if (errorCode || errorDescription) {
          router.replace(
            `/conta/login?error=${encodeURIComponent(
              errorDescription ||
                (errorCode === "otp_expired"
                  ? "Link expirado ou já usado. Peça um novo convite."
                  : "Link inválido. Peça um novo convite ao professor.")
            )}`
          );
          return;
        }

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (cancelled) return;
          if (error) {
            router.replace(
              `/conta/login?error=${encodeURIComponent(error.message || "Não foi possível abrir a sessão")}`
            );
            return;
          }
          // Drop hash so tokens aren't left in the address bar
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          router.replace(next);
          return;
        }
      }

      // No code and no tokens yet — brief wait in case the hash arrives late
      setMessage("Link inválido ou incompleto. Peça um novo convite ao professor.");
      router.replace(
        `/conta/login?error=${encodeURIComponent(
          "Link inválido ou expirado. Peça um novo convite ao professor."
        )}`
      );
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="mx-auto max-w-md space-y-2 pt-12 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
