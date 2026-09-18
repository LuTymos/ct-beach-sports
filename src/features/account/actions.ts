"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";
import { isAdminUser } from "@/lib/supabase/is-admin";
import { getLinkedAthlete, getSessionUser } from "@/lib/supabase/auth";
import { setInviteLinkFlash } from "@/features/account/invite-link-flash";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { errorQuery, type ErrorCode } from "@/lib/flash-errors";
import { consumeRateLimit, LOGIN_RATE, rateLimitKey } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/password";
import { safeInternalPath, siteOrigin } from "@/lib/safe-url";

function athletePath(id: string, query?: string) {
  return query ? `/atletas/${id}?${query}` : `/atletas/${id}`;
}

function fail(path: string, code: ErrorCode): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${errorQuery(code)}`);
}

export async function athleteLoginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const key = await rateLimitKey(["login-athlete", email.toLowerCase()]);
  const allowed = await consumeRateLimit({
    bucket: "login-athlete",
    key,
    ...LOGIN_RATE,
  });
  if (!allowed) {
    fail("/conta/login", "locked");
  }

  if (!email || !password) {
    fail("/conta/login", "invalid");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    fail("/conta/login", "login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    fail("/conta/login", "login");
  }

  if (isAdminUser(user)) {
    redirect("/admin");
  }

  const linked = await getLinkedAthlete();
  if (linked) {
    redirect(`/atletas/${linked.id}`);
  }

  fail("/conta/login", "forbidden");
}

export async function athleteLogoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/conta/login");
}

export async function updateOwnAthleteProfileAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || isAdminUser(user)) {
    redirect("/conta/login");
  }

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const team = String(formData.get("team") ?? "").trim() || null;

  if (!id) redirect("/");
  if (!name) fail(athletePath(id), "name");

  const supabase = await createClient();
  const { data: athlete } = await supabase
    .from("athletes")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!athlete || athlete.user_id !== user.id) {
    fail(athletePath(id), "forbidden");
  }

  const { error } = await supabase
    .from("athletes")
    .update({ name, team })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    fail(athletePath(id), "failed");
  }

  revalidatePath(`/atletas/${id}`);
  revalidatePath("/");
  revalidatePath("/ranking");
  revalidatePath("/admin/atletas");
  redirect(athletePath(id, "ok=1"));
}

function siteOriginSafe() {
  return siteOrigin();
}

function inviteRedirectTo() {
  const next = safeInternalPath("/conta/definir-senha", "/conta/definir-senha");
  return `${siteOriginSafe()}/auth/callback?next=${encodeURIComponent(next)}`;
}

function buildActivateLink(tokenHash: string, type: "invite" | "recovery") {
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type,
  });
  // Hash so token is not sent as Referer or in server logs of the first GET.
  return `${siteOriginSafe()}/conta/ativar#${params.toString()}`;
}

async function findAuthUserByEmail(email: string) {
  const service = await createAdminServiceClient();
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
  const { supabase } = await requireAdmin();
  if (!hasServiceRoleKey()) {
    fail("/admin/atletas", "failed");
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
  const service = await createAdminServiceClient();
  const redirectTo = inviteRedirectTo();

  let existing = await findAuthUserByEmail(email);
  if (existing && isAdminUser(existing)) {
    fail("/admin/atletas", "forbidden");
  }

  if (existing && !existing.last_sign_in_at) {
    const { error: deleteError } = await service.auth.admin.deleteUser(existing.id);
    if (deleteError) {
      fail("/admin/atletas", "failed");
    }
    existing = null;
  }

  const linkType = existing ? ("recovery" as const) : ("invite" as const);
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

  const tokenHash = data?.properties?.hashed_token;
  if (error || !data?.user?.id || !tokenHash) {
    fail("/admin/atletas", "failed");
  }

  const { error: linkError } = await supabase
    .from("athletes")
    .update({ email, user_id: data.user.id })
    .eq("id", athleteId);

  if (linkError) {
    fail("/admin/atletas", "failed");
  }

  revalidatePath("/admin/atletas");
  revalidatePath(`/atletas/${athleteId}`);

  await setInviteLinkFlash(buildActivateLink(tokenHash, linkType));

  const prefix =
    note ??
    "Link gerado. Envie no WhatsApp; a atleta toca em “Ativar minha conta” e define a senha.";
  redirect(`/admin/atletas?ok=${encodeURIComponent(prefix)}`);
}

/** Invite or re-send: creates Auth user if needed, always sends a fresh e-mail when possible. */
export async function inviteAthleteAction(formData: FormData) {
  const supabase = await requireAdminForInvite();
  const athleteId = String(formData.get("athlete_id") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!athleteId) redirect("/admin/atletas");
  if (!email || !email.includes("@")) {
    fail("/admin/atletas", "invalid");
  }

  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("id, name, email, user_id")
    .eq("id", athleteId)
    .maybeSingle();

  if (athleteError || !athlete) {
    fail("/admin/atletas", "not_found");
  }

  const { error: emailError } = await supabase
    .from("athletes")
    .update({ email })
    .eq("id", athleteId);

  if (emailError) {
    fail("/admin/atletas", "failed");
  }

  const service = await createAdminServiceClient();
  const redirectTo = inviteRedirectTo();

  let existing = await findAuthUserByEmail(email);

  if (existing && isAdminUser(existing)) {
    fail("/admin/atletas", "forbidden");
  }

  if (existing && !existing.last_sign_in_at) {
    const { error: deleteError } = await service.auth.admin.deleteUser(existing.id);
    if (deleteError) {
      fail("/admin/atletas", "failed");
    }
    existing = null;
  }

  if (existing) {
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
      fail("/admin/atletas", "failed");
    }

    const { error: linkError } = await supabase
      .from("athletes")
      .update({ email, user_id: existing.id })
      .eq("id", athleteId);

    if (linkError) {
      fail("/admin/atletas", "failed");
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
    fail("/admin/atletas", "failed");
  }

  const { error: linkError } = await supabase
    .from("athletes")
    .update({ email, user_id: invited.user.id })
    .eq("id", athleteId);

  if (linkError) {
    fail("/admin/atletas", "failed");
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
  const supabase = await requireAdminForInvite();
  const athleteId = String(formData.get("athlete_id") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!athleteId) redirect("/admin/atletas");
  if (!email || !email.includes("@")) {
    fail("/admin/atletas", "invalid");
  }

  const { data: athlete, error: athleteError } = await supabase
    .from("athletes")
    .select("id")
    .eq("id", athleteId)
    .maybeSingle();

  if (athleteError || !athlete) {
    fail("/admin/atletas", "not_found");
  }

  const { error: emailError } = await supabase
    .from("athletes")
    .update({ email })
    .eq("id", athleteId);

  if (emailError) {
    fail("/admin/atletas", "failed");
  }

  await generateInviteLinkAndBind({ athleteId, email });
}

export async function setAthletePasswordAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || isAdminUser(user)) {
    redirect("/conta/login");
  }

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirm") ?? "");

  const passwordError = validatePassword(password);
  if (passwordError) {
    fail("/conta/definir-senha", passwordError);
  }
  if (password !== confirm) {
    fail("/conta/definir-senha", "mismatch");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    const samePassword = /different from the old password/i.test(error.message);

    if (samePassword && user.email) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });
      if (!signInError) {
        const linked = await getLinkedAthlete();
        redirect(linked ? `/atletas/${linked.id}` : "/conta");
      }
      fail("/conta/definir-senha", "password_weak");
    }

    fail("/conta/definir-senha", "failed");
  }

  const linked = await getLinkedAthlete();
  redirect(linked ? `/atletas/${linked.id}` : "/conta");
}

export async function unlinkAthleteAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const athleteId = String(formData.get("athlete_id") ?? "").trim();
  if (!athleteId) redirect("/admin/atletas");

  const { error } = await supabase
    .from("athletes")
    .update({ user_id: null })
    .eq("id", athleteId);

  if (error) {
    fail("/admin/atletas", "failed");
  }

  revalidatePath("/admin/atletas");
  revalidatePath(`/atletas/${athleteId}`);
  redirect("/admin/atletas?ok=" + encodeURIComponent("Vínculo removido"));
}
