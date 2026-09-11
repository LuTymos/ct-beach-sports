import { updateOwnAthleteProfileAction } from "@/features/account/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Athlete } from "@/types";

type AthleteProfileEditorProps = {
  athlete: Athlete;
};

export function AthleteProfileEditor({ athlete }: AthleteProfileEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar meu perfil</CardTitle>
        <CardDescription>
          Você pode atualizar nome e arena/equipe. E-mail e vínculo da conta ficam com o professor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateOwnAthleteProfileAction} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={athlete.id} />
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" required defaultValue={athlete.name} maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team">Arena / equipe</Label>
            <Input
              id="team"
              name="team"
              defaultValue={athlete.team ?? ""}
              placeholder="Nacional, Summer..."
              maxLength={120}
            />
          </div>
          {athlete.email ? (
            <p className="text-sm text-muted-foreground sm:col-span-2">
              E-mail da conta: <span className="font-medium text-foreground">{athlete.email}</span>
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
