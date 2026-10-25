"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MESSAGES: Record<string, string> = {
  otp_expired: "O link do e-mail expirou ou já foi usado. Peça um novo convite ao professor.",
  access_denied: "Acesso negado pelo link do e-mail. Peça um novo convite ao professor.",
};

function readHashParams(): URLSearchParams | null {
  const hash = window.location.hash.replace(/^#/, "");
  return hash ? new URLSearchParams(hash) : null;
}

function readErrorMessage(): string | null {
  const params = readHashParams();
  if (!params) return null;
  if (params.get("access_token") && params.get("refresh_token")) return null;

  const errorCode = params.get("error_code") ?? params.get("error");
  const description = params.get("error_description");
  if (!errorCode && !description) return null;

  return (
    (errorCode && MESSAGES[errorCode]) ||
    "Link do e-mail inválido. Peça um novo convite ao professor."
  );
}

const subscribeNever = () => () => {};

/**
 * Handles hash fragments on /conta/login:
 * - errors → show message
 * - access_token (invite/recovery) → set session and go to definir senha
 *
 * O fragmento da URL só existe no navegador. O componente interno só monta
 * depois da hidratação, então lê o fragmento sem divergir do HTML do servidor.
 */
export function AuthHashError() {
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
  return hydrated ? <AuthHashHandler /> : null;
}

function AuthHashHandler() {
  const router = useRouter();
  const [message] = useState(readErrorMessage);

  useEffect(() => {
    const params = readHashParams();
    if (!params) return;

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

    if (!readErrorMessage()) return;

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
