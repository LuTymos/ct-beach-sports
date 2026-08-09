import Link from "next/link";
import { notFound } from "next/navigation";
import { updateStageAction } from "@/features/admin/actions";
import { getStageById } from "@/features/ranking/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
);

export default async function AdminEditStagePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error } = await searchParams;
  const stage = await getStageById(id);

  if (!stage) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">Editar etapa</h1>
        <Button asChild variant="outline">
          <Link href="/admin/etapas">Voltar</Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{stage.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateStageAction} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="id" value={stage.id} />
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required defaultValue={stage.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" name="date" type="date" required defaultValue={stage.date} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                name="location"
                placeholder="Caraguá"
                defaultValue={stage.location ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Ordem</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={stage.sort_order}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={stage.status}
                className={selectClassName}
              >
                <option value="scheduled">Agendada</option>
                <option value="completed">Realizada</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audit_url">Link de auditoria</Label>
              <Input
                id="audit_url"
                name="audit_url"
                type="url"
                placeholder="https://..."
                defaultValue={stage.audit_url ?? ""}
              />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit">Salvar alterações</Button>
              <Button asChild variant="outline">
                <Link href="/admin/etapas">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
