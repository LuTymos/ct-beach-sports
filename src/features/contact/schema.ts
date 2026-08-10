import { z } from "zod";
import { TICKET_REASONS } from "@/features/contact/reasons";

export const contactTicketSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Nome obrigatório" })
    .max(120, { error: "Nome muito longo" }),
  reason: z.enum(TICKET_REASONS, { error: "Motivo inválido" }),
  message: z
    .string()
    .trim()
    .min(1, { error: "Mensagem obrigatória" })
    .max(4000, { error: "Mensagem muito longa" }),
});

export type ContactTicketInput = z.infer<typeof contactTicketSchema>;
