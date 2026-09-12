import { Suspense } from "react";
import { ActivateAccountClient } from "@/features/account/activate-account-client";

export default function ActivateAccountPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 pt-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Convite</h1>
        <p className="text-sm text-muted-foreground">
          CT Beach Sports — confirme o convite para acessar sua ficha e o ranking.
        </p>
      </div>
      <Suspense
        fallback={
          <p className="text-center text-sm text-muted-foreground">Carregando convite…</p>
        }
      >
        <ActivateAccountClient />
      </Suspense>
    </div>
  );
}
