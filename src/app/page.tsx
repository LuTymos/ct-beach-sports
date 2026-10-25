import { redirect } from "next/navigation";
import { HomeCtIntro } from "@/features/home/home-ct-intro";
import { HomeFeaturedStage } from "@/features/home/home-featured-stage";
import { HomePodium } from "@/features/home/home-podium";
import { parsePodiumFilter, pickPodium } from "@/features/home/home-podium-filter";
import {
  getCategoryRanking,
  getHomeFeaturedStage,
} from "@/features/ranking/queries";
import { rankingRedirectFromHomeSearch } from "@/features/ranking/ranking-href";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CT Beach Sports",
  description: "Centro de treinamento e ranking do torneio dos alunos — temporada 2026.",
};

type PageProps = {
  searchParams: Promise<{
    nivel?: string;
    categoria?: string;
    q?: string;
    page?: string;
    podio?: string | string[];
  }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rankingRedirect = rankingRedirectFromHomeSearch(params);
  if (rankingRedirect) redirect(rankingRedirect);

  const filter = parsePodiumFilter(params.podio);
  const configured = isSupabaseConfigured();
  const [featuredStage, categoryRows] = configured
    ? await Promise.all([getHomeFeaturedStage(), getCategoryRanking()])
    : [null, []];

  return (
    <div className="space-y-12 py-4">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Ranking 2026</h1>
      <HomePodium active={filter} top={pickPodium(categoryRows, filter)} />
      {featuredStage ? <HomeFeaturedStage stage={featuredStage} /> : null}
      <HomeCtIntro />
    </div>
  );
}
