import { z } from "zod";

export const stageStatusSchema = z.enum(["scheduled", "completed"]);

export const stageFormSchema = z.object({
  title: z.string().trim().min(1, { error: "Título obrigatório" }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Data inválida" }),
  location: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null),
  status: stageStatusSchema.default("scheduled"),
  audit_url: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || null)
    .pipe(z.union([z.null(), z.url({ error: "URL de auditoria inválida" })])),
  sort_order: z.coerce.number().int().default(0),
});

export const updateStageFormSchema = stageFormSchema.extend({
  id: z.uuid({ error: "Etapa inválida" }),
});
