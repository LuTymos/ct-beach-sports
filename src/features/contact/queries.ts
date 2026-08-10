import { createClient } from "@/lib/supabase/server";
import type { TicketReason } from "@/features/contact/reasons";

export type ContactTicket = {
  id: string;
  name: string;
  reason: TicketReason;
  message: string;
  status: "open" | "done";
  created_at: string;
};

export async function getContactTickets(): Promise<ContactTicket[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_tickets")
    .select("id, name, reason, message, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ContactTicket[];
}
