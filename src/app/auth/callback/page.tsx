import { Suspense } from "react";
import { AuthCallbackClient } from "@/features/account/auth-callback-client";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md pt-12 text-center text-sm text-muted-foreground">
          Validando link…
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
