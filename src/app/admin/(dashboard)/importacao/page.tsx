import { importStageResultsAction } from "@/features/admin/actions";
import { peekAdminFlashError } from "@/features/admin/flash-error";
import { getStages } from "@/features/ranking/queries";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MappedErrorAlert } from "@/components/mapped-error-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    ok?: string;
    results?: string;
    athletes?: string;
    skipped?: string;
  }>;
};

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
);

export default async function AdminImportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const stages = await getStages();
  const flashError = await peekAdminFlashError();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Importar CSV</h1>
          <p className="text-sm text-muted-foreground">
            Uma planilha por etapa. Pontos calculados por{" "}
            <code className="text-xs">scoring.ts</code>. Atleta existente (nome
            exato) é reutilizado; senão, cadastra.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/exemplos/importacao-etapa-exemplo.csv" download>
            Baixar CSV de exemplo
          </a>
        </Button>
      </div>

      {flashError ? (
        <Alert variant="destructive">
          <AlertTitle>Importação bloqueada</AlertTitle>
          <AlertDescription className="break-words">{flashError}</AlertDescription>
        </Alert>
      ) : (
        <MappedErrorAlert error={params.error} title="Importação bloqueada" />
      )}

      {params.ok === "1" && (
        <Alert>
          <AlertTitle>Importação concluída</AlertTitle>
          <AlertDescription>
            {params.results ?? "0"} resultado(s) criados · {params.athletes ?? "0"}{" "}
            atleta(s) novos · {params.skipped ?? "0"} linha(s) ignoradas (já
            existiam na etapa).
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Arquivo da etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={importStageResultsAction} className="grid max-w-xl gap-4">
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
              <Label htmlFor="file">CSV</Label>
              <Input id="file" name="file" type="file" accept=".csv,text/csv" required />
            </div>
            <Button type="submit">Importar resultados</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Cabeçalho obrigatório (vírgula ou ponto-e-vírgula):{" "}
            <code className="text-xs text-foreground">
              atleta,categoria,nivel,serie,colocacao
            </code>
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <code className="text-xs">categoria</code>: misto | masculino | feminino
            </li>
            <li>
              <code className="text-xs">nivel</code>: iniciante | intermediario | avancado
            </li>
            <li>
              <code className="text-xs">serie</code>: ouro | prata | bronze | bronzinho |
              participacao
            </li>
            <li>
              <code className="text-xs">colocacao</code>: 1–4 (obrigatório, exceto
              participacao)
            </li>
          </ul>
          <p>
            Linhas duplicadas na mesma etapa (mesmo atleta + categoria + nível + série +
            colocação) são ignoradas — dá para reimportar com segurança parcial.
          </p>
          <p>Máximo 400 linhas de dados e 512 KB. Só arquivos .csv de texto.</p>
          <p>
            Use o botão <span className="text-foreground">Baixar CSV de exemplo</span> para
            um modelo com ouro, bronzinho e participação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
