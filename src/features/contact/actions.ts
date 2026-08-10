"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { contactTicketSchema } from "@/features/contact/schema";
import { createClient } from "@/lib/supabase/server";

export async function submitContactTicketAction(formData: FormData) {
  const parsed = contactTicketSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    reason: String(formData.get("reason") ?? ""),
    message: String(formData.get("message") ?? ""),
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos";
    redirect(`/contato?error=${encodeURIComponent(message)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_tickets").insert({
    name: parsed.data.name,
    reason: parsed.data.reason,
    message: parsed.data.message,
  });

  if (error) {
    redirect(`/contato?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/tickets");
  redirect("/contato?ok=1");
}

export async function markTicketDoneAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/tickets?error=Ticket+inválido");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { error } = await supabase
    .from("contact_tickets")
    .update({ status: "done" })
    .eq("id", id);

  if (error) {
    redirect(`/admin/tickets?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/tickets");
  redirect("/admin/tickets");
}
