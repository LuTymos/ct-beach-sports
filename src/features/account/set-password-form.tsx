"use client";

import { useFormStatus } from "react-dom";
import { setAthletePasswordAction } from "@/features/account/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_PASSWORD_LENGTH } from "@/lib/password";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Salvando…" : "Salvar e entrar"}
    </Button>
  );
}

/** Client form so iOS double-taps don't submit twice (second save hits "same password"). */
export function SetPasswordForm() {
  return (
    <form action={setAthletePasswordAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password_confirm">Confirmar senha</Label>
        <Input
          id="password_confirm"
          name="password_confirm"
          type="password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="new-password"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
