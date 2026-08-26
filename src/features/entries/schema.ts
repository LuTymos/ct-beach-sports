import { z } from "zod";

const podiumSeriesSchema = z.enum(["ouro", "prata", "bronze", "bronzinho"]);

export const createStageEntrySchema = z
  .object({
    stage_id: z.uuid({ error: "Etapa inválida" }),
    category: z.enum(["misto", "masculino", "feminino"], { error: "Categoria inválida" }),
    level: z.enum(["iniciante", "intermediario", "avancado"], { error: "Nível inválido" }),
    athlete_id_a: z.uuid({ error: "Atleta A inválido" }),
    athlete_id_b: z.uuid({ error: "Atleta B inválido" }),
  })
  .refine((value) => value.athlete_id_a !== value.athlete_id_b, {
    error: "Escolha dois atletas diferentes",
    path: ["athlete_id_b"],
  });

export const setEntryPodiumSchema = z.object({
  entry_id: z.uuid({ error: "Dupla inválida" }),
  series: podiumSeriesSchema,
  placement: z.coerce
    .number()
    .int()
    .min(1, { error: "Colocação 1–4" })
    .max(4, { error: "Colocação 1–4" }),
});

export type CreateStageEntryInput = z.infer<typeof createStageEntrySchema>;
export type SetEntryPodiumInput = z.infer<typeof setEntryPodiumSchema>;
