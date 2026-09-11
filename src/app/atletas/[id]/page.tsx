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
import { Button } from "@/components/ui/button";
import { AthleteProfileEditor } from "@/features/account/athlete-profile-editor";
import { athleteLogoutAction } from "@/features/account/actions";
import { getAthleteBreakdown, getAthleteById } from "@/features/ranking/queries";
import { isOwnAthleteProfile } from "@/lib/supabase/auth";
import { CATEGORY_LABELS, LEVEL_LABELS } from "@/lib/categories";
import { formatResultLabel, type Placement, type Series } from "@/lib/scoring";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
};

export default async function AthletePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error, ok } = await searchParams;
  const athlete = await getAthleteById(id);
  if (!athlete) notFound();

  const isOwner = await isOwnAthleteProfile(id);
  const { total, byStage, results } = await getAthleteBreakdown(id);

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

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {ok ? (
        <Alert>
          <AlertDescription>Perfil atualizado.</AlertDescription>
        </Alert>
      ) : null}

      {isOwner ? <AthleteProfileEditor athlete={athlete} /> : null}

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
        <div className="rounded-xl border bg-card">
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
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.stage?.title ?? "—"}</TableCell>
                  <TableCell>
                    {CATEGORY_LABELS[result.category] ?? result.category ?? "—"}
                  </TableCell>
                  <TableCell>{LEVEL_LABELS[result.level] ?? result.level ?? "—"}</TableCell>
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
      </section>
    </div>
  );
}
