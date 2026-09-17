"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/supabase/is-admin";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { calculatePoints, isParticipationOnly, type Placement, type Series } from "@/lib/scoring";
import { isResultCategory, isResultLevel } from "@/lib/categories";
import { MAX_IMPORT_ROWS, parseImportCsv } from "@/features/admin/import-csv";
import { setAdminFlashError } from "@/features/admin/flash-error";
import { stageFormSchema, updateStageFormSchema } from "@/features/admin/stage-schema";
import { errorQuery, type ErrorCode } from "@/lib/flash-errors";
import { consumeRateLimit, LOGIN_RATE, rateLimitKey } from "@/lib/rate-limit";

const MAX_IMPORT_BYTES = 512 * 1024;
const CSV_TYPES = new Set([
  "",
  "text/csv",
  "text/plain",
  "application/csv",
  "application/vnd.ms-excel",
]);

function fail(path: string, code: ErrorCode): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${errorQuery(code)}`);
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

function isCsvUpload(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return name.endsWith(".csv") && CSV_TYPES.has(type);
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const key = await rateLimitKey(["login-admin", email]);
  const allowed = await consumeRateLimit({
    bucket: "login-admin",
    key,
    ...LOGIN_RATE,
  });
  if (!allowed) {
    fail("/admin/login", "locked");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    fail("/admin/login", "login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminUser(user)) {
    await supabase.auth.signOut();
    fail("/admin/login", "login");
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function createAthleteAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const team = String(formData.get("team") ?? "").trim() || null;
  if (!name) fail("/admin/atletas", "name");

  const { error } = await supabase.from("athletes").insert({ name, team });
  if (error) fail("/admin/atletas", "failed");

  revalidatePath("/");
  revalidatePath("/admin/atletas");
  redirect("/admin/atletas?ok=Atleta+cadastrado");
}

export async function createStageAction(formData: FormData) {
  await requireAdmin();
  const parsed = stageFormSchema.safeParse(stageFieldsFromForm(formData));
  if (!parsed.success) {
    fail("/admin/etapas", "invalid");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("stages").insert(parsed.data);
  if (error) fail("/admin/etapas", "failed");

  revalidateStagePaths();
  redirect("/admin/etapas");
}

export async function updateStageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = updateStageFormSchema.safeParse({
    id,
    ...stageFieldsFromForm(formData),
  });

  const target = id ? `/admin/etapas/${id}` : "/admin/etapas";
  if (!parsed.success) {
    fail(target, "invalid");
  }

  const { id: stageId, ...fields } = parsed.data;
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("stages").update(fields).eq("id", stageId);

  if (error) {
    fail(`/admin/etapas/${stageId}`, "failed");
  }

  revalidateStagePaths(stageId);
  redirect("/admin/etapas?updated=1");
}

export async function createResultAction(formData: FormData) {
  await requireAdmin();
  const athlete_id = String(formData.get("athlete_id") ?? "");
  const stage_id = String(formData.get("stage_id") ?? "");
  const categoryRaw = String(formData.get("category") ?? "");
  const levelRaw = String(formData.get("level") ?? "");
  const series = String(formData.get("series") ?? "") as Series;
  const placementRaw = String(formData.get("placement") ?? "");

  if (!athlete_id || !stage_id || !series || !categoryRaw || !levelRaw) {
    fail("/admin/resultados", "invalid");
  }

  if (!isResultCategory(categoryRaw) || !isResultLevel(levelRaw)) {
    fail("/admin/resultados", "category");
  }

  const placement: Placement | null =
    isParticipationOnly(series) || placementRaw === ""
      ? null
      : (Number(placementRaw) as Placement);

  if (!isParticipationOnly(series) && placement == null) {
    fail("/admin/resultados", "placement");
  }

  let points: number;
  try {
    points = calculatePoints(series, placement);
  } catch {
    fail("/admin/resultados", "points");
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("results").insert({
    athlete_id,
    stage_id,
    category: categoryRaw,
    level: levelRaw,
    series,
    placement,
    points,
  });

  if (error) fail("/admin/resultados", "failed");

  revalidatePath("/");
  revalidatePath(`/etapas/${stage_id}`);
  revalidatePath(`/atletas/${athlete_id}`);
  revalidatePath("/admin/resultados");
  redirect("/admin/resultados?ok=Resultado+lancado");
}

export async function deleteResultAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("results").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin/resultados");
  redirect("/admin/resultados");
}

export async function importStageResultsAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const stage_id = String(formData.get("stage_id") ?? "").trim();
  const file = formData.get("file");

  if (!stage_id) {
    fail("/admin/importacao", "stage");
  }

  if (!(file instanceof File) || file.size === 0) {
    fail("/admin/importacao", "file");
  }

  if (file.size > MAX_IMPORT_BYTES) {
    fail("/admin/importacao", "csv_size");
  }

  if (!isCsvUpload(file)) {
    fail("/admin/importacao", "csv_type");
  }

  const text = await file.text();
  const parsed = parseImportCsv(text);
  if (!parsed.ok) {
    const preview = parsed.errors.slice(0, 8).join(" | ");
    const extra =
      parsed.errors.length > 8 ? ` (+${parsed.errors.length - 8} erros)` : "";
    await setAdminFlashError(preview + extra);
    fail("/admin/importacao", "import");
  }

  if (parsed.rows.length > MAX_IMPORT_ROWS) {
    fail("/admin/importacao", "csv_rows");
  }

  const { data: stage, error: stageError } = await supabase
    .from("stages")
    .select("id")
    .eq("id", stage_id)
    .maybeSingle();

  if (stageError || !stage) {
    fail("/admin/importacao", "not_found");
  }

  const { data: existingAthletes, error: athletesError } = await supabase
    .from("athletes")
    .select("id, name");

  if (athletesError) {
    fail("/admin/importacao", "failed");
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
      await setAdminFlashError(`Nome duplicado no cadastro: "${name}". Unifique antes de importar.`);
      fail("/admin/importacao", "import");
    }
    if (matches.length === 1) continue;

    const { data: created, error } = await supabase
      .from("athletes")
      .insert({ name })
      .select("id, name")
      .single();

    if (error || !created) {
      fail("/admin/importacao", "failed");
    }

    byName.set(created.name, [created.id]);
    athletesCreated += 1;
  }

  const { data: existingResults, error: resultsError } = await supabase
    .from("results")
    .select("athlete_id, category, level, series, placement")
    .eq("stage_id", stage_id);

  if (resultsError) {
    fail("/admin/importacao", "failed");
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
      await setAdminFlashError(`Atleta não resolvido: ${row.athlete}`);
      fail("/admin/importacao", "import");
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
      fail("/admin/importacao", "failed");
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
