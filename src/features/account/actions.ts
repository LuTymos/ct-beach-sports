"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";
import { isAdminUser } from "@/lib/supabase/is-admin";
import { getLinkedAthlete, getSessionUser } from "@/lib/supabase/auth";

function athletePath(id: string, query?: string) {
  return query ? `/atletas/${id}?${query}` : `/atletas/${id}`;
}

export async function athleteLoginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/conta/login?error=" + encodeURIComponent("Informe e-mail e senha"));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/conta/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/conta/login?error=" + encodeURIComponent("Falha no login"));
  }

  if (isAdminUser(user)) {
    redirect("/admin");
  }

  const linked = await getLinkedAthlete();
  if (linked) {
    redirect(`/atletas/${linked.id}`);
  }

  redirect(
    "/conta/login?error=" +
      encodeURIComponent("Conta ainda não vinculada a um atleta. Peça o convite ao professor.")
  );
}

export async function athleteLogoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/conta/login");
}

export async function updateOwnAthleteProfileAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const team = String(formData.get("team") ?? "").trim() || null;

  if (!id) redirect("/");
  if (!name) redirect(athletePath(id, "error=" + encodeURIComponent("Nome obrigatório")));

  const user = await getSessionUser();
  if (!user || isAdminUser(user)) {
    redirect("/conta/login");
  }

  const supabase = await createClient();
  const { data: athlete } = await supabase
    .from("athletes")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!athlete || athlete.user_id !== user.id) {
    redirect(athletePath(id, "error=" + encodeURIComponent("Sem permissão para editar")));
  }

  const { error } = await supabase
    .from("athletes")
    .update({ name, team })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(athletePath(id, `error=${encodeURIComponent(error.message)}`));
  }

  revalidatePath(`/atletas/${id}`);
  revalidatePath("/");
  revalidatePath("/admin/atletas");
  redirect(athletePath(id, "ok=1"));
}

function siteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ).replace(/\/$/, "");
}

function inviteRedirectTo() {
  return `${siteOrigin()}/auth/callback?next=${encodeURIComponent("/conta/definir-senha")}`;
}

async function findAuthUserByEmail(email: string) {
  const service = createServiceClient();
  const normalized = email.toLowerCase();
  let page = 1;
  for (;;) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (found) return found;
    if (data.users.length < 200) return null;
    page += 1;
  }
}

function isEmailRateLimit(message: string) {
  return /rate.?limit/i.test(message);
}

async function requireAdminForInvite() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) redirect("/admin/login");
  if (!hasServiceRoleKey()) {
    redirect(
      `/admin/atletas?error=${encodeURIComponent(
        "Configure SUPABASE_SERVICE_ROLE_KEY no .env.local para convidar atletas"
      )}`
    );
  }
  return supabase;
}

/** Generate invite/recovery link without sending e-mail (bypasses Supabase free-tier rate limit). */
async function generateInviteLinkAndBind(opts: {
  athleteId: string;
  email: string;
  note?: string;
}) {
  const { athleteId, email, note } = opts;
  const supabase = await createClient();
  const service = createServiceClient();
  const redirectTo = inviteRedirectTo();

  let existing = await findAuthUserByEmail(email);
  if (existing && isAdminUser(existing)) {
    redirect(
      `/admin/atletas?error=${encodeURIComponent("Este e-mail é de um admin — use outro")}`
    );
  }

  if (existing && !existing.last_sign_in_at) {
    const { error: deleteError } = await service.auth.admin.deleteUser(existing.id);
    if (deleteError) {
      redirect(`/admin/atletas?error=${encodeURIComponent(deleteError.message)}`);
    }
    existing = null;
  }

  const { data, error } = existing
    ? await service.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      })
    : await service.auth.admin.generateLink({
        type: "invite",
        email,
        options: {
          redirectTo,
          data: { athlete_id: athleteId },
        },
      });

  if (error || !data.user?.id || !data.properties?.action_link) {
    redirect(
      `/admin/atletas?error=${encodeURIComponent(
        error?.message ?? "Não foi possível gerar o link de convite"
      )}`
    );
  }

  const { error: linkError } = await supabase
    .from("athletes")
    .update({ email, user_id: data.user.id })
    .eq("id", athleteId);

  if (linkError) {
    redirect(`/admin/atletas?error=${encodeURIComponent(linkError.message)}`);
  }

  revalidatePath("/admin/atletas");
  revalidatePath(`/atletas/${athleteId}`);

  const prefix =
    note ??
    "Link gerado (sem e-mail — limite do Supabase). Abra em janela anônima:";
  redirect(
    `/admin/atletas?ok=${encodeURIComponent(prefix)}&invite_link=${encodeURIComponent(
      data.properties.action_link
    )}`
  );
}

/** Invite or re-send: creates Auth user if needed, always sends a fresh e-mail when possible. */
export async function inviteAthleteAction(formData: FormData) {
  const athleteId = String(formData.get("athlete_id") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!athleteId) redirect("/admin/atletas");
  if (!email || !email.includes("@")) {
    redirect(
      `/admin/atletas?error=${encodeURIComponent("Informe um e-mail válido para convidar")}`
    );
  }

  const supabase = await requireAdminForInvite();

  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("id, name, email, user_id")
    .eq("id", athleteId)
    .maybeSingle();

  if (athleteError || !athlete) {
    redirect(`/admin/atletas?error=${encodeURIComponent("Atleta não encontrado")}`);
  }

  const { error: emailError } = await supabase
    .from("athletes")
    .update({ email })
    .eq("id", athleteId);

  if (emailError) {
    redirect(`/admin/atletas?error=${encodeURIComponent(emailError.message)}`);
  }

  const service = createServiceClient();
  const redirectTo = inviteRedirectTo();

  let existing = await findAuthUserByEmail(email);

  if (existing && isAdminUser(existing)) {
    redirect(
      `/admin/atletas?error=${encodeURIComponent("Este e-mail é de um admin — use outro")}`
    );
  }

  // Never signed in → stale invite: delete Auth user and send a fresh invite e-mail
  if (existing && !existing.last_sign_in_at) {
    const { error: deleteError } = await service.auth.admin.deleteUser(existing.id);
    if (deleteError) {
      redirect(`/admin/atletas?error=${encodeURIComponent(deleteError.message)}`);
    }
    existing = null;
  }

  if (existing) {
    // Already used the account → password recovery e-mail
    const { error: resetError } = await service.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (resetError) {
      if (isEmailRateLimit(resetError.message)) {
        await generateInviteLinkAndBind({
          athleteId,
          email,
          note: "Limite de e-mail do Supabase. Use este link (janela anônima):",
        });
      }
      redirect(`/admin/atletas?error=${encodeURIComponent(resetError.message)}`);
    }

    const { error: linkError } = await supabase
      .from("athletes")
      .update({ email, user_id: existing.id })
      .eq("id", athleteId);

    if (linkError) {
      redirect(`/admin/atletas?error=${encodeURIComponent(linkError.message)}`);
    }

    revalidatePath("/admin/atletas");
    revalidatePath(`/atletas/${athleteId}`);
    redirect(
      "/admin/atletas?ok=" +
        encodeURIComponent(
          `Conta já existia — e-mail de redefinição de senha enviado para ${email}`
        )
    );
  }

  const { data: invited, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { athlete_id: athleteId },
  });

  if (inviteError || !invited.user?.id) {
    if (inviteError && isEmailRateLimit(inviteError.message)) {
      await generateInviteLinkAndBind({
        athleteId,
        email,
        note: "Limite de e-mail do Supabase. Use este link (janela anônima):",
      });
    }
    redirect(
      `/admin/atletas?error=${encodeURIComponent(inviteError?.message ?? "Falha ao convidar")}`
    );
  }

  const { error: linkError } = await supabase
    .from("athletes")
    .update({ email, user_id: invited.user.id })
    .eq("id", athleteId);

  if (linkError) {
    redirect(`/admin/atletas?error=${encodeURIComponent(linkError.message)}`);
  }

  revalidatePath("/admin/atletas");
  revalidatePath(`/atletas/${athleteId}`);
  redirect(
    "/admin/atletas?ok=" +
      encodeURIComponent(
        `Convite enviado para ${email}. O atleta abre o e-mail, define a senha e entra em Conta.`
      )
  );
}

/** Explicit no-email invite — use when Supabase hits "email rate limit exceeded". */
export async function generateAthleteInviteLinkAction(formData: FormData) {
  const athleteId = String(formData.get("athlete_id") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!athleteId) redirect("/admin/atletas");
  if (!email || !email.includes("@")) {
    redirect(
      `/admin/atletas?error=${encodeURIComponent("Informe um e-mail válido para gerar o link")}`
    );
  }

  const supabase = await requireAdminForInvite();

  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("id")
    .eq("id", athleteId)
    .maybeSingle();

  if (athleteError || !athlete) {
    redirect(`/admin/atletas?error=${encodeURIComponent("Atleta não encontrado")}`);
  }

  const { error: emailError } = await supabase
    .from("athletes")
    .update({ email })
    .eq("id", athleteId);

  if (emailError) {
    redirect(`/admin/atletas?error=${encodeURIComponent(emailError.message)}`);
  }

  await generateInviteLinkAndBind({ athleteId, email });
}

export async function setAthletePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirm") ?? "");

  if (password.length < 6) {
    redirect(
      "/conta/definir-senha?error=" + encodeURIComponent("Senha precisa ter ao menos 6 caracteres")
    );
  }
  if (password !== confirm) {
    redirect("/conta/definir-senha?error=" + encodeURIComponent("As senhas não coincidem"));
  }

  const user = await getSessionUser();
  if (!user || isAdminUser(user)) {
    redirect("/conta/login");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/conta/definir-senha?error=${encodeURIComponent(error.message)}`);
  }

  const linked = await getLinkedAthlete();
  redirect(linked ? `/atletas/${linked.id}` : "/conta");
}

export async function unlinkAthleteAction(formData: FormData) {
  const athleteId = String(formData.get("athlete_id") ?? "").trim();
  if (!athleteId) redirect("/admin/atletas");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) redirect("/admin/login");

  const { error } = await supabase
    .from("athletes")
    .update({ user_id: null })
    .eq("id", athleteId);

  if (error) {
    redirect(`/admin/atletas?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/atletas");
  revalidatePath(`/atletas/${athleteId}`);
  redirect("/admin/atletas?ok=" + encodeURIComponent("Vínculo removido"));
}
