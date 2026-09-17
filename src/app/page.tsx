import { CategoryRankingTable } from "@/features/ranking/category-ranking-table";
import { CategoryTabs } from "@/features/ranking/category-tabs";
import { LevelTabs } from "@/features/ranking/level-tabs";
import { RankingTable } from "@/features/ranking/ranking-table";
import { getCategoryRanking } from "@/features/ranking/queries";
import { toSingleCategoryRanking } from "@/features/ranking/to-single-category-ranking";
import { ListSearch } from "@/components/list-search";
import { PaginationControls } from "@/components/pagination-controls";
import {
  CATEGORY_LABELS,
  isResultCategory,
  isResultLevel,
  LEVEL_LABELS,
  type ResultCategory,
  type ResultLevel,
} from "@/lib/categories";
import { matchesSearch, parsePage, parseSearch } from "@/lib/list-params";
import { paginate } from "@/lib/paginate";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type PageProps = {
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

export default async function HomePage({ searchParams }: PageProps) {
  const { nivel, categoria: categoriaParam, q: qRaw, page: pageRaw } = await searchParams;
  const level = resolveLevel(nivel);
  const categoria = resolveCategory(categoriaParam);
  const q = parseSearch(qRaw);
  const page = parsePage(pageRaw);
  const configured = isSupabaseConfigured();
  /** Full ranking is computed server-side for correct positions; we only paginate the display slice. */
  const ranking = configured ? await getCategoryRanking({ level }) : [];

  const filteredRanking = q
    ? ranking.filter((row) => matchesSearch(row.name, q))
    : ranking;

  const categoryLabel =
    categoria === "todos" ? "Todas as categorias" : CATEGORY_LABELS[categoria];
  const levelLabel = level === "todos" ? null : LEVEL_LABELS[level];

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
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Temporada 2026
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ranking geral do torneio
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Use as abas para filtrar por categoria e nível.
          {` Exibindo: ${categoryLabel}`}
          {levelLabel ? ` · ${levelLabel}` : ""}.
        </p>
      </div>

      {!configured && (
        <Alert>
          <AlertTitle>Supabase ainda não configurado</AlertTitle>
          <AlertDescription>
            Copie <code>.env.example</code> para <code>.env.local</code>,
            preencha as chaves e rode as migrations em{" "}
            <code>supabase/migrations</code>.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <CategoryTabs active={categoria} nivel={level} q={q} />
        <LevelTabs active={level} categoria={categoria} q={q} />
      </div>

      <ListSearch
        action="/"
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
            {q ? "Nenhum atleta encontrado." : "Nenhum resultado lançado ainda."}
          </p>
        ) : paginatedTodos ? (
          <>
            <CategoryRankingTable
              rows={paginatedTodos.items}
              emptyMessage="Nenhum resultado lançado ainda."
            />
            <PaginationControls path="/" paginated={paginatedTodos} params={listParams} />
          </>
        ) : null
      ) : paginatedSingle && paginatedSingle.total === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {q ? "Nenhum atleta encontrado." : "Nenhum resultado lançado ainda."}
        </p>
      ) : paginatedSingle ? (
        <>
          <RankingTable
            rows={paginatedSingle.items}
            emptyMessage="Nenhum resultado lançado ainda."
          />
          <PaginationControls path="/" paginated={paginatedSingle} params={listParams} />
        </>
      ) : null}
    </div>
  );
}
