import Link from "next/link";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListSearch } from "@/components/list-search";
import { PaginationControls } from "@/components/pagination-controls";
import { CategoryRankingTable } from "@/features/ranking/category-ranking-table";
import { CategoryTabs } from "@/features/ranking/category-tabs";
import { LevelTabs } from "@/features/ranking/level-tabs";
import { RankingTable } from "@/features/ranking/ranking-table";
import { getCategoryRanking, getStageById } from "@/features/ranking/queries";
import { toSingleCategoryRanking } from "@/features/ranking/to-single-category-ranking";
import { getStageEntriesPublic } from "@/features/entries/queries";
import { StageEntriesPublicList } from "@/features/entries/stage-entries-public-list";
import {
  isResultCategory,
  isResultLevel,
  type ResultCategory,
  type ResultLevel,
} from "@/lib/categories";
import { matchesSearch, parsePage, parseSearch } from "@/lib/list-params";
import { paginate } from "@/lib/paginate";
import { safeHttpsHref } from "@/lib/safe-url";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nivel?: string; categoria?: string; q?: string; page?: string }>;
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
  const { nivel, categoria: categoriaParam, q: qRaw, page: pageRaw } = await searchParams;
  const level = resolveLevel(nivel);
  const categoria = resolveCategory(categoriaParam);
  const q = parseSearch(qRaw);
  const page = parsePage(pageRaw);
  const stage = await getStageById(id);
  if (!stage) notFound();

  const basePath = `/etapas/${id}`;

  const [ranking, entries] = await Promise.all([
    getCategoryRanking({ stageId: id, level }),
    getStageEntriesPublic(id),
  ]);

  const filteredRanking = q
    ? ranking.filter((row) => matchesSearch(row.name, q))
    : ranking;

  const listParams = {
    q,
    categoria: categoria === "todos" ? undefined : categoria,
    nivel: level === "todos" ? undefined : level,
  };

  const paginatedTodos =
    categoria === "todos" ? paginate(filteredRanking, page) : null;
  const paginatedSingle =
    categoria === "todos"
      ? null
      : paginate(toSingleCategoryRanking(filteredRanking, categoria), page);

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
        {safeHttpsHref(stage.audit_url) && (
          <a
            href={safeHttpsHref(stage.audit_url)!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Link de registro / auditoria
          </a>
        )}
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Inscritos</h2>
          <p className="text-sm text-muted-foreground">
            Duplas por categoria e nível (sem informação de pagamento).
          </p>
        </div>
        <StageEntriesPublicList entries={entries} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Ranking da etapa</h2>
        <div className="space-y-3">
          <CategoryTabs active={categoria} nivel={level} basePath={basePath} q={q} />
          <LevelTabs active={level} categoria={categoria} basePath={basePath} q={q} />
        </div>

        <ListSearch
          action={basePath}
          q={q}
          placeholder="Buscar atleta no ranking…"
          preserve={{
            ...(categoria !== "todos" ? { categoria } : {}),
            ...(level !== "todos" ? { nivel: level } : {}),
          }}
        />

        {categoria === "todos" ? (
          paginatedTodos && paginatedTodos.total === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
              {q ? "Nenhum atleta encontrado." : "Nenhum resultado nesta etapa ainda."}
            </p>
          ) : paginatedTodos ? (
            <>
              <CategoryRankingTable
                rows={paginatedTodos.items}
                emptyMessage="Nenhum resultado nesta etapa ainda."
              />
              <PaginationControls
                path={basePath}
                paginated={paginatedTodos}
                params={listParams}
              />
            </>
          ) : null
        ) : paginatedSingle && paginatedSingle.total === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            {q ? "Nenhum atleta encontrado." : "Nenhum resultado nesta etapa ainda."}
          </p>
        ) : paginatedSingle ? (
          <>
            <RankingTable
              rows={paginatedSingle.items}
              emptyMessage="Nenhum resultado nesta etapa ainda."
            />
            <PaginationControls
              path={basePath}
              paginated={paginatedSingle}
              params={listParams}
            />
          </>
        ) : null}
      </section>
    </div>
  );
}
