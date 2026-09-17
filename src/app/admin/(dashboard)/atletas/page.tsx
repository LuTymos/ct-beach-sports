import { createAthleteAction } from "@/features/admin/actions";
import {
  generateAthleteInviteLinkAction,
  inviteAthleteAction,
  unlinkAthleteAction,
} from "@/features/account/actions";
import { peekInviteLinkFlash } from "@/features/account/invite-link-flash";
import { getAthletes } from "@/features/ranking/queries";
import { hasServiceRoleKey } from "@/lib/supabase/service";
import { ListSearch } from "@/components/list-search";
import { PaginationControls } from "@/components/pagination-controls";
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
import { matchesSearch, parsePage, parseSearch } from "@/lib/list-params";
import { paginate } from "@/lib/paginate";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ error?: string; ok?: string; q?: string; page?: string }>;
};

function AthleteAccountBadge({
  userId,
  email,
}: {
  userId: string | null;
  email: string | null;
}) {
  if (userId) return <Badge>Vinculado</Badge>;
  if (email) return <Badge variant="secondary">Convite: {email}</Badge>;
  return <span className="text-muted-foreground">Sem conta</span>;
}

function AthleteInviteActions({
  athleteId,
  email,
  userId,
  canInvite,
}: {
  athleteId: string;
  email: string | null;
  userId: string | null;
  canInvite: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <form className="flex flex-col gap-2">
        <input type="hidden" name="athlete_id" value={athleteId} />
        <div className="space-y-1">
          <Label htmlFor={`email-${athleteId}`} className="sr-only">
            E-mail
          </Label>
          <Input
            id={`email-${athleteId}`}
            name="email"
            type="email"
            required
            placeholder="email@exemplo.com"
            defaultValue={email ?? ""}
            className="h-11 md:h-9"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="submit"
            size="sm"
            disabled={!canInvite}
            formAction={inviteAthleteAction}
            className="h-11 md:h-8"
          >
            {userId ? "Reenviar e-mail" : "Convidar"}
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="secondary"
            disabled={!canInvite}
            formAction={generateAthleteInviteLinkAction}
            className="h-11 md:h-8"
          >
            Gerar link (sem e-mail)
          </Button>
        </div>
      </form>
      {userId ? (
        <form action={unlinkAthleteAction}>
          <input type="hidden" name="athlete_id" value={athleteId} />
          <Button type="submit" variant="outline" size="sm" className="h-11 w-full md:h-8 md:w-auto">
            Desvincular
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export default async function AdminAthletesPage({ searchParams }: PageProps) {
  const { error, ok, q: qRaw, page: pageRaw } = await searchParams;
  const q = parseSearch(qRaw);
  const page = parsePage(pageRaw);
  const athletes = await getAthletes();
  const filtered = q
    ? athletes.filter(
        (athlete) => matchesSearch(athlete.name, q) || matchesSearch(athlete.team, q)
      )
    : athletes;
  const paginated = paginate(filtered, page);
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
              <Input id="name" name="name" required className="h-11 md:h-9" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Arena / equipe (opcional)</Label>
              <Input
                id="team"
                name="team"
                placeholder="Nacional, Summer..."
                className="h-11 md:h-9"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="h-11 w-full md:h-9 md:w-auto">
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ListSearch action="/admin/atletas" q={q} placeholder="Buscar por nome ou equipe…" />

      {paginated.total === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {q ? "Nenhum atleta encontrado." : "Nenhum atleta cadastrado."}
        </p>
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {paginated.items.map((athlete) => (
              <li key={athlete.id} className="space-y-3 rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/atletas/${athlete.id}`}
                      className="font-medium hover:underline"
                    >
                      {athlete.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {athlete.team ?? "Sem equipe"}
                    </p>
                  </div>
                  <AthleteAccountBadge userId={athlete.user_id} email={athlete.email} />
                </div>
                <AthleteInviteActions
                  athleteId={athlete.id}
                  email={athlete.email}
                  userId={athlete.user_id}
                  canInvite={canInvite}
                />
              </li>
            ))}
          </ul>

          <div className="hidden rounded-xl border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Arena / equipe</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Vincular / convidar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.items.map((athlete) => (
                  <TableRow key={athlete.id}>
                    <TableCell className="font-medium">
                      <Link href={`/atletas/${athlete.id}`} className="hover:underline">
                        {athlete.name}
                      </Link>
                    </TableCell>
                    <TableCell>{athlete.team ?? "—"}</TableCell>
                    <TableCell>
                      <AthleteAccountBadge userId={athlete.user_id} email={athlete.email} />
                    </TableCell>
                    <TableCell>
                      <AthleteInviteActions
                        athleteId={athlete.id}
                        email={athlete.email}
                        userId={athlete.user_id}
                        canInvite={canInvite}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            path="/admin/atletas"
            paginated={paginated}
            params={{ q }}
          />
        </>
      )}
    </div>
  );
}
