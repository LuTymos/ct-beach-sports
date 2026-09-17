"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmailOtpType } from "@supabase/supabase-js";

const ALLOWED_TYPES = new Set<EmailOtpType>(["invite", "recovery", "magiclink", "signup", "email"]);

/**
 * Scanners (Gmail/Google) often prefetch the Supabase /verify URL and burn the one-time token.
 * Token lives in the URL hash (not query) so it is not sent as Referer; we move it to state
 * and strip the fragment. verifyOtp runs only when the athlete taps the button.
 */
export function ActivateAccountClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenHash, setTokenHash] = useState<string | null>(null);
  const [type, setType] = useState<EmailOtpType>("invite");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const fromHash = hash.get("token_hash") ?? "";
    const fromQuery = searchParams.get("token_hash") ?? "";
    const token = fromHash || fromQuery;
    const typeRaw = (hash.get("type") || searchParams.get("type") || "invite") as EmailOtpType;
    // Hash/query only exist after mount; strip them so the token is not in Referer.
    queueMicrotask(() => {
      setTokenHash(token || null);
      setType(ALLOWED_TYPES.has(typeRaw) ? typeRaw : "invite");
      setReady(true);
    });
    if (window.location.hash || fromQuery) {
      window.history.replaceState(null, "", "/conta/ativar");
    }
  }, [searchParams]);

  async function activate() {
    if (!tokenHash) {
      setError("Link incompleto. Peça um novo convite ao professor.");
      return;
    }

    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (verifyError) {
      setPending(false);
      setError(
        "Link expirado ou já usado. Peça um novo ao professor (WhatsApp costuma funcionar melhor)."
      );
      return;
    }

    router.replace("/conta/definir-senha");
    router.refresh();
  }

  if (!ready) {
    return <p className="text-center text-sm text-muted-foreground">Carregando convite…</p>;
  }

  if (!tokenHash) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Link inválido</AlertTitle>
        <AlertDescription>
          Peça um novo convite ao professor. Prefira abrir o link pelo WhatsApp no Safari.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ativar conta</CardTitle>
        <CardDescription>
          Toque no botão abaixo para confirmar o convite e criar sua senha. Não feche esta tela
          até terminar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Não foi possível ativar</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="button" className="w-full" disabled={pending} onClick={() => void activate()}>
          {pending ? "Ativando…" : "Ativar minha conta"}
        </Button>
      </CardContent>
    </Card>
  );
}
