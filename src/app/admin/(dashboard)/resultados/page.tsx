import {
  createResultAction,
  deleteResultAction,
} from "@/features/admin/actions";
import { getAllResults, getAthletes, getStages } from "@/features/ranking/queries";
import { SERIES_LABELS, type Series } from "@/lib/scoring";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
);

export default async function AdminResultsPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const [athletes, stages, results] = await Promise.all([
    getAthletes(),
    getStages(),
    getAllResults(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Resultados</h1>
      <p className="text-sm text-muted-foreground">
        Um atleta pode ter vários resultados na mesma etapa. Participação = 5 pts (sem pódio).
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lançar resultado</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createResultAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="athlete_id">Atleta</Label>
              <select id="athlete_id" name="athlete_id" required className={selectClassName}>
                <option value="">Selecione</option>
                {athletes.map((athlete) => (
                  <option key={athlete.id} value={athlete.id}>
                    {athlete.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage_id">Etapa</Label>
              <select id="stage_id" name="stage_id" required className={selectClassName}>
                <option value="">Selecione</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.title} ({stage.date})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="series">Série</Label>
              <select id="series" name="series" required className={selectClassName} defaultValue="ouro">
                {(Object.keys(SERIES_LABELS) as Series[]).map((series) => (
                  <option key={series} value={series}>
                    {SERIES_LABELS[series]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="placement">Colocação (1–4; vazio se participação)</Label>
              <select id="placement" name="placement" className={selectClassName} defaultValue="1">
                <option value="1">1º</option>
                <option value="2">2º</option>
                <option value="3">3º</option>
                <option value="4">4º</option>
                <option value="">— (participação)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Calcular pontos e salvar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Atleta</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead>Série</TableHead>
              <TableHead>Col.</TableHead>
              <TableHead className="text-right">Pts</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => {
              const athlete = result.athletes as { name?: string } | null;
              const stage = result.stages as { title?: string } | null;
              return (
                <TableRow key={result.id as string}>
                  <TableCell>{athlete?.name ?? "—"}</TableCell>
                  <TableCell>{stage?.title ?? "—"}</TableCell>
                  <TableCell>{result.series as string}</TableCell>
                  <TableCell>{(result.placement as number | null) ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{result.points as number}</TableCell>
                  <TableCell className="text-right">
                    <form action={deleteResultAction}>
                      <input type="hidden" name="id" value={result.id as string} />
                      <Button type="submit" variant="ghost" size="sm">
                        Excluir
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
