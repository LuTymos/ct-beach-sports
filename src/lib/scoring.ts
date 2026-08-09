export type Series = "ouro" | "prata" | "bronze" | "participacao";
export type Placement = 1 | 2 | 3 | 4;

const PODIUM_POINTS: Record<Exclude<Series, "participacao">, Record<Placement, number>> = {
  ouro: { 1: 100, 2: 80, 3: 60, 4: 50 },
  prata: { 1: 50, 2: 40, 3: 30, 4: 20 },
  bronze: { 1: 30, 2: 20, 3: 10, 4: 5 },
};

export const PARTICIPATION_POINTS = 5;

export const SERIES_LABELS: Record<Series, string> = {
  ouro: "Série Ouro",
  prata: "Série Prata",
  bronze: "Série Bronze",
  participacao: "Participação",
};

/**
 * Unique source of truth for tournament points (CT Beach Sports).
 * Participation is a separate result type — never stacked on podium points.
 */
export function calculatePoints(series: Series, placement: Placement | null): number {
  if (series === "participacao") {
    return PARTICIPATION_POINTS;
  }

  if (placement == null || placement < 1 || placement > 4) {
    throw new Error("Colocação deve ser 1–4 para séries Ouro/Prata/Bronze");
  }

  return PODIUM_POINTS[series][placement as Placement];
}

export function formatResultLabel(series: Series, placement: Placement | null): string {
  if (series === "participacao") {
    return SERIES_LABELS.participacao;
  }

  const placeLabel =
    placement === 1 ? "1º" : placement === 2 ? "2º" : placement === 3 ? "3º" : "4º";

  return `${SERIES_LABELS[series]} — ${placeLabel}`;
}
