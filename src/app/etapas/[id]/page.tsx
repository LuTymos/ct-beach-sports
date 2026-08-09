import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RankingTable } from "@/features/ranking/ranking-table";
import { getStageById, getStageRanking } from "@/features/ranking/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function StageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const stage = await getStageById(id);
  if (!stage) notFound();

  const ranking = await getStageRanking(id);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/etapas">← Todas as etapas</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{stage.title}</h1>
          <Badge variant={stage.status === "completed" ? "default" : "secondary"}>
            {stage.status === "completed" ? "Realizada" : "Agendada"}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {format(parseISO(stage.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          {stage.location ? ` · ${stage.location}` : ""}
        </p>
        {stage.audit_url && (
          <a
            href={stage.audit_url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Link de registro / auditoria
          </a>
        )}
      </div>

      <RankingTable rows={ranking} emptyMessage="Nenhum resultado nesta etapa ainda." />
    </div>
  );
}
