import { athleteLogoutAction } from "@/features/account/actions";
import { getLinkedAthlete, getSessionUser, isAdminUser } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function ContaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/conta/login");
  if (isAdminUser(user)) redirect("/admin");

  const athlete = await getLinkedAthlete();
  if (!athlete) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Minha conta</h1>
        <Card>
          <CardHeader>
            <CardTitle>Conta ainda não vinculada</CardTitle>
            <CardDescription>
              Seu login existe, mas o professor ainda não vinculou ao cadastro de atleta. Peça o
              convite no admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={athleteLogoutAction}>
              <Button type="submit" variant="outline">
                Sair
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  redirect(`/atletas/${athlete.id}`);
}
