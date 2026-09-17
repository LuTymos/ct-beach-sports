"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="h-11 w-full md:h-9" disabled={pending}>
      {pending ? "Entrando…" : "Entrar"}
    </Button>
  );
}
