"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { contactTicketSchema } from "@/features/contact/schema";
import { createServiceClient, hasServiceRoleKey } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { errorQuery, type ErrorCode } from "@/lib/flash-errors";
import { consumeRateLimit, CONTACT_RATE, rateLimitKey } from "@/lib/rate-limit";

function fail(path: string, code: ErrorCode): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${errorQuery(code)}`);
}

export async function submitContactTicketAction(formData: FormData) {
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot) {
    redirect("/contato?ok=1");
  }

  const key = await rateLimitKey(["contact"]);
  const allowed = await consumeRateLimit({
    bucket: "contact",
    key,
    ...CONTACT_RATE,
  });
  if (!allowed) {
    fail("/contato", "rate");
  }

  const parsed = contactTicketSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    reason: String(formData.get("reason") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    fail("/contato", "invalid");
  }

  if (!hasServiceRoleKey()) {
    fail("/contato", "failed");
  }

  const service = createServiceClient();
  const { error } = await service.from("contact_tickets").insert({
    name: parsed.data.name,
    reason: parsed.data.reason,
    message: parsed.data.message,
    status: "open",
  });

  if (error) {
    fail("/contato", "failed");
  }

  revalidatePath("/admin/tickets");
  redirect("/contato?ok=1");
}

export async function markTicketDoneAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) fail("/admin/tickets", "invalid");

  const { error } = await supabase
    .from("contact_tickets")
    .update({ status: "done" })
    .eq("id", id);

  if (error) {
    fail("/admin/tickets", "failed");
  }

  revalidatePath("/admin/tickets");
  redirect("/admin/tickets");
}
