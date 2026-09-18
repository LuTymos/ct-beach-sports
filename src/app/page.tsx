import Link from "next/link";
import { redirect } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, CalendarDays, MapPin, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getHomeFeaturedStage,
  getOverallRanking,
} from "@/features/ranking/queries";
import {
  RANKING_PATH,
  rankingRedirectFromHomeSearch,
} from "@/features/ranking/ranking-href";
import { PARTICIPATION_POINTS, SERIES_LABELS } from "@/lib/scoring";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CT Beach Sports",
  description: "Centro de treinamento e ranking do torneio dos alunos — temporada 2026.",
};

type PageProps = {
  searchParams: Promise<{ nivel?: string; categoria?: string; q?: string; page?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rankingRedirect = rankingRedirectFromHomeSearch(params);
  if (rankingRedirect) redirect(rankingRedirect);

  const configured = isSupabaseConfigured();
  const [featuredStage, overall] = configured
    ? await Promise.all([getHomeFeaturedStage(), getOverallRanking()])
    : [null, []];
  const topThree = overall.slice(0, 3);

  return (
    <div className="space-y-16 py-4">
      <section className="space-y-5 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-600 dark:text-amber-500">
          Temporada 2026
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">
          <span className="text-amber-600 dark:text-amber-500">CT Beach Sports</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
          Vôlei de praia, comunidade e o ranking interno dos alunos.
        </p>
        <div className="flex justify-center">
          <Button asChild size="lg" className="bg-amber-600 text-white hover:bg-amber-700">
            <Link href={RANKING_PATH}>
              Ver ranking <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {featuredStage ? (
        <section className="space-y-3">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {featuredStage.status === "scheduled"
              ? "Próxima etapa"
              : "Destaque da última etapa"}
          </h2>
          <Link href={`/etapas/${featuredStage.id}`} className="block">
            <Card className="border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-orange-50/50 shadow-sm transition hover:border-amber-500/40 dark:from-slate-900 dark:to-slate-900/50">
              <CardContent className="space-y-3 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500">
                    <Trophy className="h-7 w-7 shrink-0" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {featuredStage.title}
                    </h3>
                  </div>
                  <Badge variant={featuredStage.status === "completed" ? "default" : "secondary"}>
                    {featuredStage.status === "completed" ? "Realizada" : "Agendada"}
                  </Badge>
                </div>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  {format(parseISO(featuredStage.date), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
                {featuredStage.location ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {featuredStage.location}
                  </p>
                ) : null}
                <p className="pt-1 text-sm font-medium text-amber-700 dark:text-amber-400">
                  Ver etapa <ArrowRight className="inline h-4 w-4" />
                </p>
              </CardContent>
            </Card>
          </Link>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Top 3 do geral</h2>
          <p className="text-muted-foreground">
            Os três primeiros do ranking da temporada (todas as categorias).
          </p>
        </div>
        {topThree.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhum resultado lançado ainda.
          </p>
        ) : (
          <ol className="grid gap-3 sm:grid-cols-3">
            {topThree.map((row) => (
              <li key={row.athleteId}>
                <Link href={`/atletas/${row.athleteId}`} className="block h-full">
                  <Card className="h-full transition hover:border-amber-500/40">
                    <CardContent className="space-y-2 p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        {row.position}º
                      </p>
                      <p className="font-semibold">{row.name}</p>
                      <p className="text-sm text-muted-foreground">{row.team ?? "—"}</p>
                      <p className="text-lg font-bold tabular-nums">{row.totalPoints} pts</p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ol>
        )}
        <Button asChild variant="outline">
          <Link href={RANKING_PATH}>
            Ranking completo <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Como pontua?</h2>
          <p className="max-w-2xl text-muted-foreground">
            Pódio nas séries Ouro, Prata e Bronze. {SERIES_LABELS.participacao} e{" "}
            {SERIES_LABELS.bronzinho} valem {PARTICIPATION_POINTS} pts cada. O ranking completo está em{" "}
            <Link href={RANKING_PATH} className="underline underline-offset-4">
              /ranking
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="bg-amber-600 text-white hover:bg-amber-700">
            <Link href="/etapas">Etapas</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sobre">Sobre</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contato">Contato</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
