import { SetPasswordForm } from "@/features/account/set-password-form";
import { getSessionUser, isAdminUser } from "@/lib/supabase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SetPasswordPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const user = await getSessionUser();

  if (!user) {
    redirect(
      "/conta/login?error=" +
        encodeURIComponent("Abra o link novo do convite para definir a senha.")
    );
  }

  if (isAdminUser(user)) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-md space-y-6 pt-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Definir senha</h1>
        <p className="text-sm text-muted-foreground">
          Crie a senha da sua conta de atleta. Depois use e-mail + senha em Conta → Entrar.
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível salvar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Nova senha</CardTitle>
          <CardDescription>Mínimo de 6 caracteres. Toque em salvar só uma vez.</CardDescription>
        </CardHeader>
        <CardContent>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
