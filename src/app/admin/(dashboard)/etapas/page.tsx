import Link from "next/link";
import { createStageAction } from "@/features/admin/actions";
import { getStages } from "@/features/ranking/queries";
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
import { MappedErrorAlert } from "@/components/mapped-error-alert";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ error?: string; updated?: string }>;
};

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
);

export default async function AdminStagesPage({ searchParams }: PageProps) {
  const { error, updated } = await searchParams;
  const stages = await getStages();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Etapas</h1>
      <MappedErrorAlert error={error} />
      {updated && (
        <Alert>
          <AlertDescription>Etapa atualizada com sucesso.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nova etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createStageAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required placeholder="Etapa 6" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input id="location" name="location" placeholder="Caraguá" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Ordem</Label>
              <Input id="sort_order" name="sort_order" type="number" defaultValue={0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue="scheduled" className={selectClassName}>
                <option value="scheduled">Agendada</option>
                <option value="completed">Realizada</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit_url">Link de auditoria</Label>
              <Input id="audit_url" name="audit_url" type="url" placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Salvar etapa</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ul className="space-y-2 md:hidden">
        {stages.map((stage) => (
          <li key={stage.id} className="space-y-3 rounded-xl border bg-card p-3">
            <div>
              <p className="text-xs text-muted-foreground">#{stage.sort_order}</p>
              <p className="font-medium">{stage.title}</p>
              <p className="text-sm text-muted-foreground">
                {stage.date}
                {stage.location ? ` · ${stage.location}` : ""}
                {" · "}
                {stage.status === "completed" ? "Realizada" : "Agendada"}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="h-11">
                <Link href={`/admin/etapas/${stage.id}/inscricoes`}>Inscrições</Link>
              </Button>
              <Button asChild variant="outline" className="h-11">
                <Link href={`/admin/etapas/${stage.id}`}>Editar</Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[1%] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stages.map((stage) => (
              <TableRow key={stage.id}>
                <TableCell>{stage.sort_order}</TableCell>
                <TableCell className="font-medium">{stage.title}</TableCell>
                <TableCell>{stage.date}</TableCell>
                <TableCell>{stage.location ?? "—"}</TableCell>
                <TableCell>{stage.status === "completed" ? "Realizada" : "Agendada"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/etapas/${stage.id}/inscricoes`}>Inscrições</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/etapas/${stage.id}`}>Editar</Link>
                    </Button>
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
