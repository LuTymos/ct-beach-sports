"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/is-admin";
import {
  calculatePoints,
  type Placement,
  type Series,
} from "@/lib/scoring";
import {
  createStageEntrySchema,
  setEntryPodiumSchema,
} from "@/features/entries/schema";

const PODIUM_SERIES = new Set(["ouro", "prata", "bronze", "bronzinho"]);

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  return supabase;
}

function entriesPath(stageId: string, query?: string) {
  const base = `/admin/etapas/${stageId}/inscricoes`;
  return query ? `${base}?${query}` : base;
}

function revalidateEntryPaths(stageId: string, athleteIds: string[] = []) {
  revalidatePath("/");
  revalidatePath("/etapas");
  revalidatePath(`/etapas/${stageId}`);
  revalidatePath("/admin/etapas");
  revalidatePath(`/admin/etapas/${stageId}`);
  revalidatePath(`/admin/etapas/${stageId}/inscricoes`);
  revalidatePath("/admin/resultados");
  for (const athleteId of athleteIds) {
    revalidatePath(`/atletas/${athleteId}`);
  }
}

export async function createStageEntryAction(formData: FormData) {
  const parsed = createStageEntrySchema.safeParse({
    stage_id: String(formData.get("stage_id") ?? ""),
    category: String(formData.get("category") ?? ""),
    level: String(formData.get("level") ?? ""),
    athlete_id_a: String(formData.get("athlete_id_a") ?? ""),
    athlete_id_b: String(formData.get("athlete_id_b") ?? ""),
  });

  if (!parsed.success) {
    const stageId = String(formData.get("stage_id") ?? "");
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
    if (!stageId) redirect("/admin/etapas");
    redirect(entriesPath(stageId, `error=${encodeURIComponent(message)}`));
  }

  const { stage_id, category, level, athlete_id_a, athlete_id_b } = parsed.data;
  const supabase = await requireAdmin();

  const { data: entry, error: entryError } = await supabase
    .from("stage_entries")
    .insert({
      stage_id,
      category,
      level,
      source: "admin",
    })
    .select("id")
    .single();

  if (entryError || !entry) {
    redirect(
      entriesPath(stage_id, `error=${encodeURIComponent(entryError?.message ?? "Falha ao criar dupla")}`)
    );
  }

  const { error: membersError } = await supabase.from("stage_entry_members").insert([
    {
      entry_id: entry.id,
      stage_id,
      category,
      athlete_id: athlete_id_a,
      paid: false,
    },
    {
      entry_id: entry.id,
      stage_id,
      category,
      athlete_id: athlete_id_b,
      paid: false,
    },
  ]);

  if (membersError) {
    await supabase.from("stage_entries").delete().eq("id", entry.id);
    const message =
      membersError.code === "23505"
        ? "Atleta já inscrito nesta categoria nesta etapa"
        : membersError.message;
    redirect(entriesPath(stage_id, `error=${encodeURIComponent(message)}`));
  }

  revalidateEntryPaths(stage_id, [athlete_id_a, athlete_id_b]);
  redirect(entriesPath(stage_id, "ok=1"));
}

export async function deleteStageEntryAction(formData: FormData) {
  const stageId = String(formData.get("stage_id") ?? "").trim();
  const entryId = String(formData.get("entry_id") ?? "").trim();
  if (!stageId || !entryId) {
    redirect("/admin/etapas");
  }

  const supabase = await requireAdmin();

  const { data: entry } = await supabase
    .from("stage_entries")
    .select("id, stage_id, category, level, podium_series, podium_placement")
    .eq("id", entryId)
    .eq("stage_id", stageId)
    .maybeSingle();

  if (!entry) {
    redirect(entriesPath(stageId, `error=${encodeURIComponent("Dupla não encontrada")}`));
  }

  const { data: members } = await supabase
    .from("stage_entry_members")
    .select("athlete_id")
    .eq("entry_id", entryId);

  const athleteIds = (members ?? []).map((m) => m.athlete_id as string);

  if (entry.podium_series && entry.podium_placement != null && athleteIds.length > 0) {
    await supabase
      .from("results")
      .delete()
      .eq("stage_id", stageId)
      .eq("category", entry.category)
      .eq("level", entry.level)
      .eq("series", entry.podium_series)
      .eq("placement", entry.podium_placement)
      .in("athlete_id", athleteIds);
  }

  const { error } = await supabase.from("stage_entries").delete().eq("id", entryId);
  if (error) {
    redirect(entriesPath(stageId, `error=${encodeURIComponent(error.message)}`));
  }

  revalidateEntryPaths(stageId, athleteIds);
  redirect(entriesPath(stageId));
}

export async function toggleMemberPaidAction(formData: FormData) {
  const stageId = String(formData.get("stage_id") ?? "").trim();
  const memberId = String(formData.get("member_id") ?? "").trim();
  const paid = String(formData.get("paid") ?? "") === "true";

  if (!stageId || !memberId) {
    redirect("/admin/etapas");
  }

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("stage_entry_members")
    .update({ paid: !paid })
    .eq("id", memberId)
    .eq("stage_id", stageId);

  if (error) {
    redirect(entriesPath(stageId, `error=${encodeURIComponent(error.message)}`));
  }

  revalidateEntryPaths(stageId);
  redirect(entriesPath(stageId));
}

export async function setEntryPodiumAction(formData: FormData) {
  const stageId = String(formData.get("stage_id") ?? "").trim();
  const parsed = setEntryPodiumSchema.safeParse({
    entry_id: String(formData.get("entry_id") ?? ""),
    series: String(formData.get("series") ?? ""),
    placement: formData.get("placement"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
    if (!stageId) redirect("/admin/etapas");
    redirect(entriesPath(stageId, `error=${encodeURIComponent(message)}`));
  }

  if (!stageId) redirect("/admin/etapas");

  const { entry_id, series, placement } = parsed.data;
  const placementValue = placement as Placement;
  const supabase = await requireAdmin();

  const { data: entry, error: entryError } = await supabase
    .from("stage_entries")
    .select("id, stage_id, category, level, podium_series, podium_placement")
    .eq("id", entry_id)
    .eq("stage_id", stageId)
    .maybeSingle();

  if (entryError || !entry) {
    redirect(entriesPath(stageId, `error=${encodeURIComponent("Dupla não encontrada")}`));
  }

  const { data: members, error: membersError } = await supabase
    .from("stage_entry_members")
    .select("athlete_id")
    .eq("entry_id", entry_id);

  if (membersError || !members || members.length !== 2) {
    redirect(
      entriesPath(stageId, `error=${encodeURIComponent("Dupla precisa ter exatamente 2 atletas")}`)
    );
  }

  const athleteIds = members.map((m) => m.athlete_id as string);

  let points: number;
  try {
    points = calculatePoints(series as Series, placementValue);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pontuação inválida";
    redirect(entriesPath(stageId, `error=${encodeURIComponent(message)}`));
  }

  if (entry.podium_series && entry.podium_placement != null) {
    await supabase
      .from("results")
      .delete()
      .eq("stage_id", stageId)
      .eq("category", entry.category)
      .eq("level", entry.level)
      .eq("series", entry.podium_series)
      .eq("placement", entry.podium_placement)
      .in("athlete_id", athleteIds);
  }

  // Remove participação auto da mesma cat/nível se existir (correção pós-fechamento)
  await supabase
    .from("results")
    .delete()
    .eq("stage_id", stageId)
    .eq("category", entry.category)
    .eq("level", entry.level)
    .eq("series", "participacao")
    .in("athlete_id", athleteIds);

  const rows = athleteIds.map((athlete_id) => ({
    athlete_id,
    stage_id: stageId,
    category: entry.category,
    level: entry.level,
    series,
    placement: placementValue,
    points,
  }));

  const { error: insertError } = await supabase.from("results").insert(rows);
  if (insertError) {
    redirect(entriesPath(stageId, `error=${encodeURIComponent(insertError.message)}`));
  }

  const { error: updateError } = await supabase
    .from("stage_entries")
    .update({
      podium_series: series,
      podium_placement: placementValue,
    })
    .eq("id", entry_id);

  if (updateError) {
    redirect(entriesPath(stageId, `error=${encodeURIComponent(updateError.message)}`));
  }

  revalidateEntryPaths(stageId, athleteIds);
  redirect(entriesPath(stageId, "ok=podium"));
}

export async function clearEntryPodiumAction(formData: FormData) {
  const stageId = String(formData.get("stage_id") ?? "").trim();
  const entryId = String(formData.get("entry_id") ?? "").trim();
  if (!stageId || !entryId) redirect("/admin/etapas");

  const supabase = await requireAdmin();

  const { data: entry } = await supabase
    .from("stage_entries")
    .select("id, category, level, podium_series, podium_placement")
    .eq("id", entryId)
    .eq("stage_id", stageId)
    .maybeSingle();

  if (!entry?.podium_series || entry.podium_placement == null) {
    redirect(entriesPath(stageId));
  }

  const { data: members } = await supabase
    .from("stage_entry_members")
    .select("athlete_id")
    .eq("entry_id", entryId);

  const athleteIds = (members ?? []).map((m) => m.athlete_id as string);

  if (athleteIds.length > 0) {
    await supabase
      .from("results")
      .delete()
      .eq("stage_id", stageId)
      .eq("category", entry.category)
      .eq("level", entry.level)
      .eq("series", entry.podium_series)
      .eq("placement", entry.podium_placement)
      .in("athlete_id", athleteIds);
  }

  const { error } = await supabase
    .from("stage_entries")
    .update({ podium_series: null, podium_placement: null })
    .eq("id", entryId);

  if (error) {
    redirect(entriesPath(stageId, `error=${encodeURIComponent(error.message)}`));
  }

  revalidateEntryPaths(stageId, athleteIds);
  redirect(entriesPath(stageId));
}

export async function closeStageEntriesAction(formData: FormData) {
  const stageId = String(formData.get("stage_id") ?? "").trim();
  if (!stageId) redirect("/admin/etapas");

  const supabase = await requireAdmin();

  const { data: entries, error: entriesError } = await supabase
    .from("stage_entries")
    .select(
      `
      id,
      category,
      level,
      podium_series,
      stage_entry_members ( athlete_id )
    `
    )
    .eq("stage_id", stageId);

  if (entriesError) {
    redirect(entriesPath(stageId, `error=${encodeURIComponent(entriesError.message)}`));
  }

  const { data: existingResults, error: resultsError } = await supabase
    .from("results")
    .select("athlete_id, category, level, series")
    .eq("stage_id", stageId);

  if (resultsError) {
    redirect(entriesPath(stageId, `error=${encodeURIComponent(resultsError.message)}`));
  }

  const hasPodium = new Set(
    (existingResults ?? [])
      .filter((r) => PODIUM_SERIES.has(r.series as string))
      .map((r) => `${r.athlete_id}|${r.category}|${r.level}`)
  );

  const hasParticipation = new Set(
    (existingResults ?? [])
      .filter((r) => r.series === "participacao")
      .map((r) => `${r.athlete_id}|${r.category}|${r.level}`)
  );

  const toInsert: {
    athlete_id: string;
    stage_id: string;
    category: string;
    level: string;
    series: "participacao";
    placement: null;
    points: number;
  }[] = [];
  const athleteIds = new Set<string>();

  for (const entry of entries ?? []) {
    if (entry.podium_series) continue;
    const members = (entry.stage_entry_members ?? []) as { athlete_id: string }[];
    for (const member of members) {
      const key = `${member.athlete_id}|${entry.category}|${entry.level}`;
      if (hasPodium.has(key) || hasParticipation.has(key)) continue;
      hasParticipation.add(key);
      athleteIds.add(member.athlete_id);
      toInsert.push({
        athlete_id: member.athlete_id,
        stage_id: stageId,
        category: entry.category,
        level: entry.level,
        series: "participacao",
        placement: null,
        points: calculatePoints("participacao", null),
      });
    }
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from("results").insert(toInsert);
    if (insertError) {
      redirect(entriesPath(stageId, `error=${encodeURIComponent(insertError.message)}`));
    }
  }

  const { error: statusError } = await supabase
    .from("stages")
    .update({ status: "completed" })
    .eq("id", stageId);

  if (statusError) {
    redirect(entriesPath(stageId, `error=${encodeURIComponent(statusError.message)}`));
  }

  revalidateEntryPaths(stageId, [...athleteIds]);
  redirect(entriesPath(stageId, `ok=closed&participacao=${toInsert.length}`));
}
