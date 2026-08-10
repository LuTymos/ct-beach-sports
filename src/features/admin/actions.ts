"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculatePoints, isParticipationOnly, type Placement, type Series } from "@/lib/scoring";
import { isResultCategory, isResultLevel } from "@/lib/categories";
import { parseImportCsv } from "@/features/admin/import-csv";
import { stageFormSchema, updateStageFormSchema } from "@/features/admin/stage-schema";

const MAX_IMPORT_BYTES = 512 * 1024;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  return supabase;
}

function stageFieldsFromForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    date: String(formData.get("date") ?? ""),
    location: String(formData.get("location") ?? ""),
    status: String(formData.get("status") ?? "scheduled"),
    audit_url: String(formData.get("audit_url") ?? ""),
    sort_order: formData.get("sort_order") ?? 0,
  };
}

function revalidateStagePaths(stageId?: string) {
  revalidatePath("/");
  revalidatePath("/etapas");
  revalidatePath("/admin/etapas");
  if (stageId) {
    revalidatePath(`/etapas/${stageId}`);
    revalidatePath(`/admin/etapas/${stageId}`);
  }
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function createAthleteAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const team = String(formData.get("team") ?? "").trim() || null;
  if (!name) redirect("/admin/atletas?error=Nome+obrigatorio");

  const supabase = await requireAdmin();
  const { error } = await supabase.from("athletes").insert({ name, team });
  if (error) redirect(`/admin/atletas?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin/atletas");
  redirect("/admin/atletas");
}

export async function createStageAction(formData: FormData) {
  const parsed = stageFormSchema.safeParse(stageFieldsFromForm(formData));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
    redirect(`/admin/etapas?error=${encodeURIComponent(message)}`);
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.from("stages").insert(parsed.data);
  if (error) redirect(`/admin/etapas?error=${encodeURIComponent(error.message)}`);

  revalidateStagePaths();
  redirect("/admin/etapas");
}

export async function updateStageAction(formData: FormData) {
  const parsed = updateStageFormSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    ...stageFieldsFromForm(formData),
  });

  if (!parsed.success) {
    const id = String(formData.get("id") ?? "");
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
    const target = id ? `/admin/etapas/${id}` : "/admin/etapas";
    redirect(`${target}?error=${encodeURIComponent(message)}`);
  }

  const { id, ...fields } = parsed.data;
  const supabase = await requireAdmin();
  const { error } = await supabase.from("stages").update(fields).eq("id", id);

  if (error) {
    redirect(`/admin/etapas/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateStagePaths(id);
  redirect("/admin/etapas?updated=1");
}

export async function createResultAction(formData: FormData) {
  const athlete_id = String(formData.get("athlete_id") ?? "");
  const stage_id = String(formData.get("stage_id") ?? "");
  const categoryRaw = String(formData.get("category") ?? "");
  const levelRaw = String(formData.get("level") ?? "");
  const series = String(formData.get("series") ?? "") as Series;
  const placementRaw = String(formData.get("placement") ?? "");

  if (!athlete_id || !stage_id || !series || !categoryRaw || !levelRaw) {
    redirect("/admin/resultados?error=Preencha+todos+os+campos");
  }

  if (!isResultCategory(categoryRaw) || !isResultLevel(levelRaw)) {
    redirect("/admin/resultados?error=Categoria+ou+nivel+invalido");
  }

  const placement: Placement | null =
    isParticipationOnly(series) || placementRaw === ""
      ? null
      : (Number(placementRaw) as Placement);

  if (!isParticipationOnly(series) && placement == null) {
    redirect("/admin/resultados?error=Informe+a+colocacao+1-4");
  }

  let points: number;
  try {
    points = calculatePoints(series, placement);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pontuacao invalida";
    redirect(`/admin/resultados?error=${encodeURIComponent(message)}`);
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.from("results").insert({
    athlete_id,
    stage_id,
    category: categoryRaw,
    level: levelRaw,
    series,
    placement,
    points,
  });

  if (error) redirect(`/admin/resultados?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath(`/etapas/${stage_id}`);
  revalidatePath(`/atletas/${athlete_id}`);
  revalidatePath("/admin/resultados");
  redirect("/admin/resultados");
}

export async function deleteResultAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await requireAdmin();
  await supabase.from("results").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin/resultados");
  redirect("/admin/resultados");
}

export async function importStageResultsAction(formData: FormData) {
  const stage_id = String(formData.get("stage_id") ?? "").trim();
  const file = formData.get("file");

  if (!stage_id) {
    redirect("/admin/importacao?error=" + encodeURIComponent("Selecione a etapa"));
  }

  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/importacao?error=" + encodeURIComponent("Envie um arquivo CSV"));
  }

  if (file.size > MAX_IMPORT_BYTES) {
    redirect(
      "/admin/importacao?error=" + encodeURIComponent("CSV muito grande (max 512 KB)")
    );
  }

  const text = await file.text();
  const parsed = parseImportCsv(text);
  if (!parsed.ok) {
    const preview = parsed.errors.slice(0, 8).join(" | ");
    const extra =
      parsed.errors.length > 8 ? ` (+${parsed.errors.length - 8} erros)` : "";
    redirect(`/admin/importacao?error=${encodeURIComponent(preview + extra)}`);
  }

  const supabase = await requireAdmin();

  const { data: stage, error: stageError } = await supabase
    .from("stages")
    .select("id")
    .eq("id", stage_id)
    .maybeSingle();

  if (stageError || !stage) {
    redirect("/admin/importacao?error=" + encodeURIComponent("Etapa nao encontrada"));
  }

  const { data: existingAthletes, error: athletesError } = await supabase
    .from("athletes")
    .select("id, name");

  if (athletesError) {
    redirect(`/admin/importacao?error=${encodeURIComponent(athletesError.message)}`);
  }

  const byName = new Map<string, string[]>();
  for (const athlete of existingAthletes ?? []) {
    const list = byName.get(athlete.name) ?? [];
    list.push(athlete.id);
    byName.set(athlete.name, list);
  }

  const neededNames = [...new Set(parsed.rows.map((row) => row.athlete))];
  let athletesCreated = 0;

  for (const name of neededNames) {
    const matches = byName.get(name) ?? [];
    if (matches.length > 1) {
      redirect(
        "/admin/importacao?error=" +
          encodeURIComponent(
            `Nome duplicado no cadastro: "${name}". Unifique antes de importar.`
          )
      );
    }
    if (matches.length === 1) continue;

    const { data: created, error } = await supabase
      .from("athletes")
      .insert({ name })
      .select("id, name")
      .single();

    if (error || !created) {
      redirect(
        `/admin/importacao?error=${encodeURIComponent(error?.message ?? "Falha ao criar atleta")}`
      );
    }

    byName.set(created.name, [created.id]);
    athletesCreated += 1;
  }

  const { data: existingResults, error: resultsError } = await supabase
    .from("results")
    .select("athlete_id, category, level, series, placement")
    .eq("stage_id", stage_id);

  if (resultsError) {
    redirect(`/admin/importacao?error=${encodeURIComponent(resultsError.message)}`);
  }

  const existingKeys = new Set(
    (existingResults ?? []).map(
      (result) =>
        `${result.athlete_id}|${result.category}|${result.level}|${result.series}|${result.placement ?? ""}`
    )
  );

  const toInsert: {
    athlete_id: string;
    stage_id: string;
    category: string;
    level: string;
    series: string;
    placement: number | null;
    points: number;
  }[] = [];
  let skipped = 0;

  for (const row of parsed.rows) {
    const athleteId = byName.get(row.athlete)?.[0];
    if (!athleteId) {
      redirect(
        "/admin/importacao?error=" +
          encodeURIComponent(`Atleta nao resolvido: ${row.athlete}`)
      );
    }

    const key = `${athleteId}|${row.category}|${row.level}|${row.series}|${row.placement ?? ""}`;
    if (existingKeys.has(key)) {
      skipped += 1;
      continue;
    }

    existingKeys.add(key);
    toInsert.push({
      athlete_id: athleteId,
      stage_id,
      category: row.category,
      level: row.level,
      series: row.series,
      placement: row.placement,
      points: row.points,
    });
  }

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from("results").insert(toInsert);
    if (insertError) {
      redirect(`/admin/importacao?error=${encodeURIComponent(insertError.message)}`);
    }
  }

  revalidatePath("/");
  revalidatePath("/etapas");
  revalidatePath(`/etapas/${stage_id}`);
  revalidatePath("/admin/resultados");
  revalidatePath("/admin/atletas");
  revalidatePath("/admin/importacao");

  const params = new URLSearchParams({
    ok: "1",
    results: String(toInsert.length),
    athletes: String(athletesCreated),
    skipped: String(skipped),
    stage: stage_id,
  });
  redirect(`/admin/importacao?${params.toString()}`);
}
