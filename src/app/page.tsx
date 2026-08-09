import { RankingTable } from "@/features/ranking/ranking-table";
import { getOverallRanking } from "@/features/ranking/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const ranking = configured ? await getOverallRanking() : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Temporada 2026
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ranking geral</h1>
        <p className="max-w-2xl text-muted-foreground">
          Soma de pontos de todas as etapas do torneio dos alunos do CT Beach Sports.
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

      <RankingTable rows={ranking} />
    </div>
  );
}
