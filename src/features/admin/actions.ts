"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculatePoints, type Placement, type Series } from "@/lib/scoring";

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

  const supabase = await createClient();
  const { error } = await supabase.from("athletes").insert({ name, team });
  if (error) redirect(`/admin/atletas?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/");
  revalidatePath("/admin/atletas");
  redirect("/admin/atletas");
}

export async function createStageAction(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const location = String(formData.get("location") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "scheduled");
  const audit_url = String(formData.get("audit_url") ?? "").trim() || null;
  const sort_order = Number(formData.get("sort_order") ?? 0);

  if (!title || !date) redirect("/admin/etapas?error=Titulo+e+data+obrigatorios");

  const supabase = await createClient();
  const { error } = await supabase.from("stages").insert({
    title,
    date,
    location,
    status,
    audit_url,
    sort_order,
  });
  if (error) redirect(`/admin/etapas?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/etapas");
  revalidatePath("/admin/etapas");
  redirect("/admin/etapas");
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

  const supabase = await createClient();
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

  const supabase = await createClient();
  await supabase.from("results").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/admin/resultados");
  redirect("/admin/resultados");
}
