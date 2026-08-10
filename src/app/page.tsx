import { CategoryRankingTable } from "@/features/ranking/category-ranking-table";
import { CategoryTabs } from "@/features/ranking/category-tabs";
import { LevelTabs } from "@/features/ranking/level-tabs";
import { RankingTable } from "@/features/ranking/ranking-table";
import { getCategoryRanking } from "@/features/ranking/queries";
import { toSingleCategoryRanking } from "@/features/ranking/to-single-category-ranking";
import {
  CATEGORY_LABELS,
  isResultCategory,
  isResultLevel,
  LEVEL_LABELS,
  type ResultCategory,
  type ResultLevel,
} from "@/lib/categories";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type PageProps = {
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

export default async function HomePage({ searchParams }: PageProps) {
  const { nivel, categoria: categoriaParam } = await searchParams;
  const level = resolveLevel(nivel);
  const categoria = resolveCategory(categoriaParam);
  const configured = isSupabaseConfigured();
  const ranking = configured ? await getCategoryRanking({ level }) : [];

  const categoryLabel =
    categoria === "todos" ? "Todas as categorias" : CATEGORY_LABELS[categoria];
  const levelLabel = level === "todos" ? null : LEVEL_LABELS[level];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Temporada 2026
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ranking geral</h1>
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
            Copie <code>.env.example</code> para <code>.env.local</code>, preencha as chaves e
            rode as migrations em <code>supabase/migrations</code>.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <CategoryTabs active={categoria} nivel={level} />
        <LevelTabs active={level} categoria={categoria} />
      </div>

      {categoria === "todos" ? (
        <CategoryRankingTable rows={ranking} />
      ) : (
        <RankingTable rows={toSingleCategoryRanking(ranking, categoria)} />
      )}
    </div>
  );
}
