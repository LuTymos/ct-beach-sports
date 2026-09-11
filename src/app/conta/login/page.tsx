import { athleteLoginAction } from "@/features/account/actions";
import { AuthHashError } from "@/features/account/auth-hash-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AthleteLoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md space-y-6 pt-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm text-muted-foreground">
          Área do atleta. O professor envia o convite por e-mail; você define a senha no link e
          depois entra aqui.
        </p>
      </div>

      <AuthHashError />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível entrar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Login do atleta</CardTitle>
          <CardDescription>Use o e-mail do convite e a senha que você criou.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={athleteLoginAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Professor?{" "}
        <Link href="/admin/login" className="text-primary underline-offset-4 hover:underline">
          Entrar no admin
        </Link>
      </p>
    </div>
  );
}
