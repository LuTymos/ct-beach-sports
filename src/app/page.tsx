import { CategoryRankingTable } from "@/features/ranking/category-ranking-table";
import { LevelTabs } from "@/features/ranking/level-tabs";
import { getCategoryRanking } from "@/features/ranking/queries";
import { isResultLevel, LEVEL_LABELS, type ResultLevel } from "@/lib/categories";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type PageProps = {
  searchParams: Promise<{ nivel?: string }>;
};

function resolveLevel(value?: string): ResultLevel | "todos" {
  if (!value || value === "todos") return "todos";
  return isResultLevel(value) ? value : "todos";
}

export default async function HomePage({ searchParams }: PageProps) {
  const { nivel } = await searchParams;
  const level = resolveLevel(nivel);
  const configured = isSupabaseConfigured();
  const ranking = configured ? await getCategoryRanking({ level }) : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Temporada 2026
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ranking geral</h1>
        <p className="max-w-2xl text-muted-foreground">
          Colunas por categoria (posição no ranking da categoria + pontos). Use as abas para
          filtrar por nível.
          {level !== "todos" ? ` Exibindo: ${LEVEL_LABELS[level]}.` : ""}
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

      <LevelTabs active={level} />
      <CategoryRankingTable rows={ranking} />
    </div>
  );
}
