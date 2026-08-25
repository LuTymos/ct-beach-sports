import Link from "next/link";
import { notFound } from "next/navigation";
import {
  clearEntryPodiumAction,
  closeStageEntriesAction,
  createStageEntryAction,
  deleteStageEntryAction,
  setEntryPodiumAction,
  toggleMemberPaidAction,
} from "@/features/entries/actions";
import { getStageEntriesAdmin } from "@/features/entries/queries";
import { getAthletes, getStageById } from "@/features/ranking/queries";
import {
  CATEGORY_LABELS,
  LEVEL_LABELS,
  RESULT_CATEGORIES,
  RESULT_LEVELS,
} from "@/lib/categories";
import { SERIES_LABELS, formatResultLabel } from "@/lib/scoring";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    ok?: string;
    participacao?: string;
  }>;
};

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
);

const PODIUM_OPTIONS = ["ouro", "prata", "bronze", "bronzinho"] as const;

export default async function AdminStageEntriesPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error, ok, participacao } = await searchParams;
  const stage = await getStageById(id);
  if (!stage) notFound();

  const [entries, athletes] = await Promise.all([
    getStageEntriesAdmin(id),
    getAthletes(),
  ]);

  const activeAthletes = athletes.filter((a) => a.active);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Inscrições</h1>
          <p className="text-sm text-muted-foreground">
            {stage.title} · {stage.date}
            {stage.status === "completed" ? " · Realizada" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/etapas/${id}`}>Editar etapa</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/etapas">Todas as etapas</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/etapas/${id}`}>Ver público</Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {ok === "1" && (
        <Alert>
          <AlertDescription>Dupla inscrita.</AlertDescription>
        </Alert>
      )}
      {ok === "podium" && (
        <Alert>
          <AlertDescription>Pódio lançado para a dupla (2 resultados).</AlertDescription>
        </Alert>
      )}
      {ok === "closed" && (
        <Alert>
          <AlertDescription>
            Etapa fechada (status realizada)
            {participacao
              ? ` · ${participacao} participação(ões) gerada(s).`
              : "."}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nova dupla</CardTitle>
          <CardDescription>
            Dois atletas + categoria + nível. O mesmo atleta pode repetir em outra categoria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createStageEntryAction} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="stage_id" value={stage.id} />
            <div className="space-y-2">
              <Label htmlFor="athlete_id_a">Atleta A</Label>
              <select
                id="athlete_id_a"
                name="athlete_id_a"
                required
                className={selectClassName}
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione
                </option>
                {activeAthletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name}
                    {athlete.team ? ` (${athlete.team})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="athlete_id_b">Atleta B</Label>
              <select
                id="athlete_id_b"
                name="athlete_id_b"
                required
                className={selectClassName}
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione
                </option>
                {activeAthletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name}
                    {athlete.team ? ` (${athlete.team})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                name="category"
                required
                className={selectClassName}
                defaultValue="misto"
              >
                {RESULT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Nível</Label>
              <select
                id="level"
                name="level"
                required
                className={selectClassName}
                defaultValue="intermediario"
              >
                {RESULT_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {LEVEL_LABELS[level]}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Inscrever dupla</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Duplas inscritas</CardTitle>
            <CardDescription>
              Pagamento só no admin. Marque o pódio para gerar os 2 results.
            </CardDescription>
          </div>
          <form action={closeStageEntriesAction}>
            <input type="hidden" name="stage_id" value={stage.id} />
            <Button type="submit" variant="secondary">
              Fechar etapa
            </Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-6">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma dupla inscrita ainda.</p>
          ) : (
            RESULT_CATEGORIES.map((category) => {
              const inCategory = entries.filter((e) => e.category === category);
              if (inCategory.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  <h2 className="text-lg font-medium">{CATEGORY_LABELS[category]}</h2>
                  {RESULT_LEVELS.map((level) => {
                    const inLevel = inCategory.filter((e) => e.level === level);
                    if (inLevel.length === 0) return null;

                    return (
                      <div key={`${category}-${level}`} className="space-y-2">
                        <p className="text-sm text-muted-foreground">{LEVEL_LABELS[level]}</p>
                        <div className="overflow-x-auto rounded-xl border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Dupla</TableHead>
                                <TableHead>Pagamento</TableHead>
                                <TableHead>Pódio</TableHead>
                                <TableHead className="w-[1%]" />
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {inLevel.map((entry) => (
                                <TableRow key={entry.id}>
                                  <TableCell className="align-top">
                                    <ul className="space-y-0.5">
                                      {entry.members.map((member) => (
                                        <li key={member.id} className="font-medium">
                                          {member.athleteName}
                                          {member.athleteTeam ? (
                                            <span className="ml-1 text-xs font-normal text-muted-foreground">
                                              ({member.athleteTeam})
                                            </span>
                                          ) : null}
                                        </li>
                                      ))}
                                    </ul>
                                  </TableCell>
                                  <TableCell className="align-top">
                                    <div className="flex flex-col gap-1">
                                      {entry.members.map((member) => (
                                        <form key={member.id} action={toggleMemberPaidAction}>
                                          <input type="hidden" name="stage_id" value={stage.id} />
                                          <input type="hidden" name="member_id" value={member.id} />
                                          <input
                                            type="hidden"
                                            name="paid"
                                            value={member.paid ? "true" : "false"}
                                          />
                                          <Button type="submit" variant="outline" size="sm">
                                            {member.athleteName.split(" ")[0]}:{" "}
                                            {member.paid ? "Pagou" : "Não pagou"}
                                          </Button>
                                        </form>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="align-top">
                                    {entry.podiumSeries && entry.podiumPlacement != null ? (
                                      <div className="space-y-2">
                                        <Badge>
                                          {formatResultLabel(
                                            entry.podiumSeries,
                                            entry.podiumPlacement as 1 | 2 | 3 | 4
                                          )}
                                        </Badge>
                                        <form action={clearEntryPodiumAction}>
                                          <input type="hidden" name="stage_id" value={stage.id} />
                                          <input type="hidden" name="entry_id" value={entry.id} />
                                          <Button type="submit" variant="ghost" size="sm">
                                            Limpar pódio
                                          </Button>
                                        </form>
                                      </div>
                                    ) : (
                                      <form
                                        action={setEntryPodiumAction}
                                        className="flex flex-wrap items-end gap-2"
                                      >
                                        <input type="hidden" name="stage_id" value={stage.id} />
                                        <input type="hidden" name="entry_id" value={entry.id} />
                                        <div className="space-y-1">
                                          <Label className="text-xs">Série</Label>
                                          <select
                                            name="series"
                                            required
                                            className={cn(selectClassName, "w-[9rem]")}
                                            defaultValue="ouro"
                                          >
                                            {PODIUM_OPTIONS.map((series) => (
                                              <option key={series} value={series}>
                                                {SERIES_LABELS[series]}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs">Colocação</Label>
                                          <select
                                            name="placement"
                                            required
                                            className={cn(selectClassName, "w-[5rem]")}
                                            defaultValue="1"
                                          >
                                            {[1, 2, 3, 4].map((n) => (
                                              <option key={n} value={n}>
                                                {n}º
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <Button type="submit" size="sm">
                                          Lançar
                                        </Button>
                                      </form>
                                    )}
                                  </TableCell>
                                  <TableCell className="align-top">
                                    <form action={deleteStageEntryAction}>
                                      <input type="hidden" name="stage_id" value={stage.id} />
                                      <input type="hidden" name="entry_id" value={entry.id} />
                                      <Button type="submit" variant="destructive" size="sm">
                                        Remover
                                      </Button>
                                    </form>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
