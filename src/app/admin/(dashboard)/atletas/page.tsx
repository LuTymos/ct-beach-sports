import { createAthleteAction } from "@/features/admin/actions";
import {
  generateAthleteInviteLinkAction,
  inviteAthleteAction,
  unlinkAthleteAction,
} from "@/features/account/actions";
import { peekInviteLinkFlash } from "@/features/account/invite-link-flash";
import { getAthletes } from "@/features/ranking/queries";
import { hasServiceRoleKey } from "@/lib/supabase/service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ error?: string; ok?: string }>;
};

export default async function AdminAthletesPage({ searchParams }: PageProps) {
  const { error, ok } = await searchParams;
  const athletes = await getAthletes();
  const canInvite = hasServiceRoleKey();
  const inviteLink = await peekInviteLinkFlash();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Atletas</h1>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {ok && (
        <Alert>
          <AlertDescription className="space-y-2">
            <p>{ok}</p>
            {inviteLink ? (
              <p className="break-all">
                <a
                  href={inviteLink}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {inviteLink}
                </a>
              </p>
            ) : null}
          </AlertDescription>
        </Alert>
      )}
      {!canInvite && (
        <Alert>
          <AlertDescription>
            Para convidar atletas, adicione <code>SUPABASE_SERVICE_ROLE_KEY</code> no{" "}
            <code>.env.local</code> (só no servidor; nunca no browser).
          </AlertDescription>
        </Alert>
      )}
      <Alert>
        <AlertDescription>
          Prefira <strong>Gerar link</strong> e enviar no <strong>WhatsApp</strong> — links de
          e-mail (Gmail/Google no iPhone) costumam “queimar” sozinhos. A atleta abre o link, toca
          em <strong>Ativar minha conta</strong> e define a senha. Em Supabase → URL Configuration
          inclua o domínio de produção e <code>/auth/callback</code>.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Novo atleta</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAthleteAction} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Arena / equipe (opcional)</Label>
              <Input id="team" name="team" placeholder="Nacional, Summer..." />
            </div>
            <div className="flex items-end">
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Arena / equipe</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead className="min-w-[18rem]">Vincular / convidar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athletes.map((athlete) => (
              <TableRow key={athlete.id}>
                <TableCell className="font-medium">
                  <Link href={`/atletas/${athlete.id}`} className="hover:underline">
                    {athlete.name}
                  </Link>
                </TableCell>
                <TableCell>{athlete.team ?? "—"}</TableCell>
                <TableCell>
                  {athlete.user_id ? (
                    <Badge>Vinculado</Badge>
                  ) : athlete.email ? (
                    <Badge variant="secondary">Convite: {athlete.email}</Badge>
                  ) : (
                    <span className="text-muted-foreground">Sem conta</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <form className="flex flex-col gap-2">
                      <input type="hidden" name="athlete_id" value={athlete.id} />
                      <div className="flex flex-wrap items-end gap-2">
                        <div className="min-w-[12rem] flex-1 space-y-1">
                          <Label htmlFor={`email-${athlete.id}`} className="sr-only">
                            E-mail
                          </Label>
                          <Input
                            id={`email-${athlete.id}`}
                            name="email"
                            type="email"
                            required
                            placeholder="email@exemplo.com"
                            defaultValue={athlete.email ?? ""}
                          />
                        </div>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!canInvite}
                          formAction={inviteAthleteAction}
                        >
                          {athlete.user_id ? "Reenviar e-mail" : "Convidar"}
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          variant="secondary"
                          disabled={!canInvite}
                          formAction={generateAthleteInviteLinkAction}
                        >
                          Gerar link (sem e-mail)
                        </Button>
                      </div>
                    </form>
                    {athlete.user_id ? (
                      <form action={unlinkAthleteAction}>
                        <input type="hidden" name="athlete_id" value={athlete.id} />
                        <Button type="submit" variant="outline" size="sm">
                          Desvincular
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
