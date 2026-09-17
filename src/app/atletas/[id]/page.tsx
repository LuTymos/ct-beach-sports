import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MappedErrorAlert } from "@/components/mapped-error-alert";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/pagination-controls";
import { AthleteProfileEditor } from "@/features/account/athlete-profile-editor";
import { athleteLogoutAction } from "@/features/account/actions";
import { getAthleteBreakdown, getAthleteById } from "@/features/ranking/queries";
import { getSessionUser, isOwnAthleteProfile } from "@/lib/supabase/auth";
import { CATEGORY_LABELS, LEVEL_LABELS } from "@/lib/categories";
import { parsePage } from "@/lib/list-params";
import { paginate } from "@/lib/paginate";
import { formatResultLabel, type Placement, type Series } from "@/lib/scoring";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string; page?: string }>;
};

export default async function AthletePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error, ok, page: pageRaw } = await searchParams;
  const page = parsePage(pageRaw);
  const athlete = await getAthleteById(id);
  if (!athlete) notFound();

  const isOwner = await isOwnAthleteProfile(id);
  const sessionUser = isOwner ? await getSessionUser() : null;
  const { total, byStage, results } = await getAthleteBreakdown(id);
  /** Newest first for the detail list. */
  const resultsNewestFirst = [...results].reverse();
  const paginatedResults = paginate(resultsNewestFirst, page);
  const detailPath = `/atletas/${id}`;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{athlete.name}</h1>
          <p className="text-muted-foreground">
            {athlete.team ?? "Sem equipe"} ·{" "}
            <span className="font-semibold text-foreground">{total}</span> pts no ranking
          </p>
        </div>
        {isOwner ? (
          <form action={athleteLogoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sair
            </Button>
          </form>
        ) : null}
      </div>

      <MappedErrorAlert error={error} />
      {ok ? (
        <Alert>
          <AlertDescription>Perfil atualizado.</AlertDescription>
        </Alert>
      ) : null}

      {isOwner ? (
        <AthleteProfileEditor athlete={athlete} accountEmail={sessionUser?.email ?? null} />
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Por etapa</h2>
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Etapa</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byStage.map((row) => (
                <TableRow key={row.stageId}>
                  <TableCell className="font-medium">{row.stageTitle}</TableCell>
                  <TableCell>
                    {format(parseISO(row.stageDate), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.points}</TableCell>
                </TableRow>
              ))}
              {byStage.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Sem resultados ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Detalhe dos resultados</h2>

        {paginatedResults.total === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            Sem resultados ainda.
          </p>
        ) : (
          <>
            <ul className="space-y-2 md:hidden">
              {paginatedResults.items.map((result) => (
                <li key={result.id} className="rounded-xl border bg-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{result.stage?.title ?? "—"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {CATEGORY_LABELS[result.category] ?? result.category ?? "—"}
                        {" · "}
                        {LEVEL_LABELS[result.level] ?? result.level ?? "—"}
                      </p>
                      <p className="mt-1 text-sm">
                        {formatResultLabel(
                          result.series as Series,
                          result.placement as Placement | null
                        )}
                      </p>
                    </div>
                    <p className="shrink-0 text-base font-semibold tabular-nums">{result.points}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden rounded-xl border bg-card md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Cat.</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead className="text-right">Pontos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedResults.items.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.stage?.title ?? "—"}</TableCell>
                      <TableCell>
                        {CATEGORY_LABELS[result.category] ?? result.category ?? "—"}
                      </TableCell>
                      <TableCell>
                        {LEVEL_LABELS[result.level] ?? result.level ?? "—"}
                      </TableCell>
                      <TableCell>
                        {formatResultLabel(
                          result.series as Series,
                          result.placement as Placement | null
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{result.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <PaginationControls path={detailPath} paginated={paginatedResults} />
          </>
        )}
      </section>
    </div>
  );
}
