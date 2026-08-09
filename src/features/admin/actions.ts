"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculatePoints, type Placement, type Series } from "@/lib/scoring";
import { stageFormSchema, updateStageFormSchema } from "@/features/admin/stage-schema";

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
  const series = String(formData.get("series") ?? "") as Series;
  const placementRaw = String(formData.get("placement") ?? "");

  if (!athlete_id || !stage_id || !series) {
    redirect("/admin/resultados?error=Preencha+todos+os+campos");
  }

  const placement: Placement | null =
    series === "participacao" || placementRaw === ""
      ? null
      : (Number(placementRaw) as Placement);

  if (series !== "participacao" && placement == null) {
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
