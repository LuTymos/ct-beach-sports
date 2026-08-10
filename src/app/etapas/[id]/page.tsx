import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryRankingTable } from "@/features/ranking/category-ranking-table";
import { CategoryTabs } from "@/features/ranking/category-tabs";
import { LevelTabs } from "@/features/ranking/level-tabs";
import { RankingTable } from "@/features/ranking/ranking-table";
import { getCategoryRanking, getStageById } from "@/features/ranking/queries";
import { toSingleCategoryRanking } from "@/features/ranking/to-single-category-ranking";
import {
  isResultCategory,
  isResultLevel,
  type ResultCategory,
  type ResultLevel,
} from "@/lib/categories";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nivel?: string; categoria?: string }>;
};

function resolveLevel(value?: string): ResultLevel | "todos" {
  if (!value || value === "todos") return "todos";
  return isResultLevel(value) ? value : "todos";
}

function resolveCategory(value?: string): ResultCategory | "todos" {
  if (!value || value === "todos") return "todos";
  return isResultCategory(value) ? value : "todos";
}

export default async function StageDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { nivel, categoria: categoriaParam } = await searchParams;
  const level = resolveLevel(nivel);
  const categoria = resolveCategory(categoriaParam);
  const stage = await getStageById(id);
  if (!stage) notFound();

  const ranking = await getCategoryRanking({ stageId: id, level });

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

      <div className="space-y-3">
        <CategoryTabs active={categoria} nivel={level} basePath={`/etapas/${id}`} />
        <LevelTabs active={level} categoria={categoria} basePath={`/etapas/${id}`} />
      </div>

      {categoria === "todos" ? (
        <CategoryRankingTable
          rows={ranking}
          emptyMessage="Nenhum resultado nesta etapa ainda."
        />
      ) : (
        <RankingTable
          rows={toSingleCategoryRanking(ranking, categoria)}
          emptyMessage="Nenhum resultado nesta etapa ainda."
        />
      )}
    </div>
  );
}
