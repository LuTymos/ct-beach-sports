"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MESSAGES: Record<string, string> = {
  otp_expired: "O link do e-mail expirou ou já foi usado. Peça um novo convite ao professor.",
  access_denied: "Acesso negado pelo link do e-mail. Peça um novo convite ao professor.",
};

/**
 * Handles hash fragments on /conta/login:
 * - errors → show message
 * - access_token (invite/recovery) → set session and go to definir senha
 */
export function AuthHashError() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const errorCode = params.get("error_code") ?? params.get("error");
    const description = params.get("error_description")?.replace(/\+/g, " ");
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    async function recoverSession() {
      if (!accessToken || !refreshToken) return false;
      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) return false;
      window.history.replaceState(null, "", window.location.pathname);
      router.replace(
        type === "recovery" || type === "invite" || type === "signup"
          ? "/conta/definir-senha"
          : "/conta"
      );
      return true;
    }

    if (accessToken && refreshToken) {
      void recoverSession();
      return;
    }

    if (!errorCode && !description) return;

    setMessage(
      (errorCode && MESSAGES[errorCode]) ||
        description ||
        "Link do e-mail inválido. Peça um novo convite ao professor."
    );

    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, [router]);

  if (!message) return null;

  return (
    <Alert variant="destructive">
      <AlertTitle>Link do e-mail inválido</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
