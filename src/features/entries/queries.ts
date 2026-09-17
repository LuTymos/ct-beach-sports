import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";
import { isAdminUser } from "@/lib/supabase/is-admin";
import type { ResultCategory, ResultLevel } from "@/lib/categories";

export type StageEntryMemberPublic = {
  id: string;
  athleteId: string;
  athleteName: string;
  athleteTeam: string | null;
};

export type StageEntryMemberAdmin = StageEntryMemberPublic & {
  paid: boolean;
};

type StageEntryBase = {
  id: string;
  stageId: string;
  category: ResultCategory;
  level: ResultLevel;
  podiumSeries: "ouro" | "prata" | "bronze" | "bronzinho" | null;
  podiumPlacement: number | null;
  source: "admin" | "athlete";
  createdAt: string;
};

export type StageEntryPublic = StageEntryBase & {
  members: StageEntryMemberPublic[];
};

export type StageEntryAdmin = StageEntryBase & {
  members: StageEntryMemberAdmin[];
};

type MemberRow = {
  id: string;
  entry_id: string;
  athlete_id: string;
  paid?: boolean;
  athletes: { name: string; team: string | null } | { name: string; team: string | null }[] | null;
};

type EntryRow = {
  id: string;
  stage_id: string;
  category: string;
  level: string;
  podium_series: string | null;
  podium_placement: number | null;
  source: string;
  created_at: string;
  stage_entry_members: MemberRow[] | null;
};

function athleteFromJoin(
  athletes: MemberRow["athletes"]
): { name: string; team: string | null } {
  if (!athletes) return { name: "Atleta", team: null };
  if (Array.isArray(athletes)) {
    return athletes[0] ?? { name: "Atleta", team: null };
  }
  return athletes;
}

function mapPublicMember(row: MemberRow): StageEntryMemberPublic {
  const athlete = athleteFromJoin(row.athletes);
  return {
    id: row.id,
    athleteId: row.athlete_id,
    athleteName: athlete.name,
    athleteTeam: athlete.team,
  };
}

function mapAdminMember(row: MemberRow): StageEntryMemberAdmin {
  return {
    ...mapPublicMember(row),
    paid: Boolean(row.paid),
  };
}

function mapEntryBase(row: EntryRow): StageEntryBase {
  return {
    id: row.id,
    stageId: row.stage_id,
    category: row.category as ResultCategory,
    level: row.level as ResultLevel,
    podiumSeries: row.podium_series as StageEntryBase["podiumSeries"],
    podiumPlacement: row.podium_placement,
    source: row.source as "admin" | "athlete",
    createdAt: row.created_at,
  };
}

export async function getStageEntriesPublic(stageId: string): Promise<StageEntryPublic[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stage_entries")
    .select(
      `
      id,
      stage_id,
      category,
      level,
      podium_series,
      podium_placement,
      source,
      created_at,
      stage_entry_members (
        id,
        entry_id,
        athlete_id,
        athletes ( name, team )
      )
    `
    )
    .eq("stage_id", stageId)
    .order("category", { ascending: true })
    .order("level", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as EntryRow[]).map((row) => ({
    ...mapEntryBase(row),
    members: (row.stage_entry_members ?? []).map(mapPublicMember),
  }));
}

export async function getStageEntriesAdmin(stageId: string): Promise<StageEntryAdmin[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminUser(user)) {
    throw new Error("Admin required");
  }
  const client = hasServiceRoleKey() ? createServiceClient() : supabase;
  const memberSelect = hasServiceRoleKey()
    ? `id, entry_id, athlete_id, paid, athletes ( name, team )`
    : `id, entry_id, athlete_id, athletes ( name, team )`;

  const { data, error } = await client
    .from("stage_entries")
    .select(
      `
      id,
      stage_id,
      category,
      level,
      podium_series,
      podium_placement,
      source,
      created_at,
      stage_entry_members (
        ${memberSelect}
      )
    `
    )
    .eq("stage_id", stageId)
    .order("category", { ascending: true })
    .order("level", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as EntryRow[]).map((row) => ({
    ...mapEntryBase(row),
    members: (row.stage_entry_members ?? []).map(mapAdminMember),
  }));
}
