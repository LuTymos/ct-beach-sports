import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  RESULT_CATEGORIES,
  type ResultCategory,
  type ResultLevel,
} from "@/lib/categories";
import type {
  Athlete,
  AthleteStageBreakdown,
  CategoryRankingRow,
  CategoryStanding,
  RankingRow,
  Result,
  Stage,
} from "@/types";

function assignPositions<T extends { totalPoints: number }>(
  rows: T[]
): (T & { position: number })[] {
  let lastPoints: number | null = null;
  let lastPosition = 0;

  return rows.map((row, index) => {
    if (lastPoints === null || row.totalPoints !== lastPoints) {
      lastPosition = index + 1;
      lastPoints = row.totalPoints;
    }

    return { ...row, position: lastPosition };
  });
}

function buildCategoryRanking(
  athletes: { id: string; name: string; team: string | null }[],
  results: { athlete_id: string; category: string; points: number }[]
): CategoryRankingRow[] {
  const pointsByAthlete = new Map<string, Map<ResultCategory, number>>();

  for (const result of results) {
    const category = result.category as ResultCategory;
    if (!RESULT_CATEGORIES.includes(category)) continue;

    const byCategory = pointsByAthlete.get(result.athlete_id) ?? new Map();
    byCategory.set(category, (byCategory.get(category) ?? 0) + result.points);
    pointsByAthlete.set(result.athlete_id, byCategory);
  }

  const positionByCategory = new Map<ResultCategory, Map<string, number>>();

  for (const category of RESULT_CATEGORIES) {
    const ranked = athletes
      .map((athlete) => ({
        athleteId: athlete.id,
        totalPoints: pointsByAthlete.get(athlete.id)?.get(category) ?? 0,
      }))
      .filter((row) => row.totalPoints > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints);

    const withPosition = assignPositions(ranked);
    positionByCategory.set(
      category,
      new Map(withPosition.map((row) => [row.athleteId, row.position]))
    );
  }

  const rows = athletes
    .map((athlete) => {
      const byCategory = {} as Record<ResultCategory, CategoryStanding | null>;
      let totalPoints = 0;

      for (const category of RESULT_CATEGORIES) {
        const points = pointsByAthlete.get(athlete.id)?.get(category) ?? 0;
        if (points <= 0) {
          byCategory[category] = null;
          continue;
        }

        totalPoints += points;
        byCategory[category] = {
          points,
          position: positionByCategory.get(category)?.get(athlete.id) ?? 0,
        };
      }

      return {
        athleteId: athlete.id,
        name: athlete.name,
        team: athlete.team,
        byCategory,
        totalPoints,
      };
    })
    .filter((row) => row.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints || a.name.localeCompare(b.name));

  return assignPositions(rows);
}

export async function getStages(): Promise<Stage[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stages")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Stage[];
}

export async function getStageById(id: string): Promise<Stage | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("stages").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Stage | null;
}

export async function getAthletes(): Promise<Athlete[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("athletes")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Athlete[];
}

export async function getAthleteById(id: string): Promise<Athlete | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("athletes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Athlete | null;
}

export async function getOverallRanking(): Promise<RankingRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const [{ data: athletes, error: athletesError }, { data: results, error: resultsError }] =
    await Promise.all([
      supabase.from("athletes").select("id, name, team, active").eq("active", true),
      supabase.from("results").select("athlete_id, points"),
    ]);

  if (athletesError) throw athletesError;
  if (resultsError) throw resultsError;

  const totals = new Map<string, number>();
  for (const result of results ?? []) {
    totals.set(result.athlete_id, (totals.get(result.athlete_id) ?? 0) + result.points);
  }

  const rows = (athletes ?? [])
    .map((athlete) => ({
      athleteId: athlete.id as string,
      name: athlete.name as string,
      team: (athlete.team as string | null) ?? null,
      totalPoints: totals.get(athlete.id as string) ?? 0,
    }))
    .filter((row) => row.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints || a.name.localeCompare(b.name));

  return assignPositions(rows);
}

export async function getCategoryRanking(options?: {
  level?: ResultLevel | "todos";
  stageId?: string;
}): Promise<CategoryRankingRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  let resultsQuery = supabase.from("results").select("athlete_id, category, points, level");
  if (options?.stageId) {
    resultsQuery = resultsQuery.eq("stage_id", options.stageId);
  }
  if (options?.level && options.level !== "todos") {
    resultsQuery = resultsQuery.eq("level", options.level);
  }

  const [{ data: athletes, error: athletesError }, { data: results, error: resultsError }] =
    await Promise.all([
      supabase.from("athletes").select("id, name, team").eq("active", true),
      resultsQuery,
    ]);

  if (athletesError) throw athletesError;
  if (resultsError) throw resultsError;

  return buildCategoryRanking(
    (athletes ?? []).map((athlete) => ({
      id: athlete.id as string,
      name: athlete.name as string,
      team: (athlete.team as string | null) ?? null,
    })),
    (results ?? []).map((result) => ({
      athlete_id: result.athlete_id as string,
      category: result.category as string,
      points: result.points as number,
    }))
  );
}

export async function getStageRanking(stageId: string): Promise<RankingRow[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const [{ data: athletes, error: athletesError }, { data: results, error: resultsError }] =
    await Promise.all([
      supabase.from("athletes").select("id, name, team, active").eq("active", true),
      supabase.from("results").select("athlete_id, points").eq("stage_id", stageId),
    ]);

  if (athletesError) throw athletesError;
  if (resultsError) throw resultsError;

  const totals = new Map<string, number>();
  for (const result of results ?? []) {
    totals.set(result.athlete_id, (totals.get(result.athlete_id) ?? 0) + result.points);
  }

  const athleteMap = new Map((athletes ?? []).map((a) => [a.id as string, a]));

  const rows = [...totals.entries()]
    .map(([athleteId, totalPoints]) => {
      const athlete = athleteMap.get(athleteId);
      return {
        athleteId,
        name: (athlete?.name as string) ?? "Atleta",
        team: (athlete?.team as string | null) ?? null,
        totalPoints,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints || a.name.localeCompare(b.name));

  return assignPositions(rows);
}

export async function getAthleteBreakdown(athleteId: string): Promise<{
  total: number;
  byStage: AthleteStageBreakdown[];
  results: (Result & { stage?: Stage })[];
}> {
  if (!isSupabaseConfigured()) {
    return { total: 0, byStage: [], results: [] };
  }

  const supabase = await createClient();
  const { data: results, error } = await supabase
    .from("results")
    .select("*, stages(*)")
    .eq("athlete_id", athleteId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const byStageMap = new Map<string, AthleteStageBreakdown>();
  let total = 0;

  for (const row of results ?? []) {
    const stage = row.stages as Stage | null;
    total += row.points as number;
    if (!stage) continue;

    const current = byStageMap.get(stage.id) ?? {
      stageId: stage.id,
      stageTitle: stage.title,
      stageDate: stage.date,
      points: 0,
    };
    current.points += row.points as number;
    byStageMap.set(stage.id, current);
  }

  const byStage = [...byStageMap.values()].sort((a, b) => a.stageDate.localeCompare(b.stageDate));

  return {
    total,
    byStage,
    results: (results ?? []).map((row) => ({
      ...(row as Result),
      stage: row.stages as Stage,
    })),
  };
}

export async function getAllResults() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("results")
    .select("*, athletes(name), stages(title, date)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
