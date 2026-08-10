export type Series = "ouro" | "prata" | "bronze" | "participacao" | "bronzinho";
export type Placement = 1 | 2 | 3 | 4;
export type PodiumSeries = "ouro" | "prata" | "bronze";

const PODIUM_POINTS: Record<PodiumSeries, Record<Placement, number>> = {
  ouro: { 1: 100, 2: 80, 3: 60, 4: 50 },
  prata: { 1: 50, 2: 40, 3: 30, 4: 20 },
  bronze: { 1: 30, 2: 20, 3: 10, 4: 5 },
};

export const PARTICIPATION_POINTS = 5;

export const SERIES_LABELS: Record<Series, string> = {
  ouro: "Série Ouro",
  prata: "Série Prata",
  bronze: "Série Bronze",
  bronzinho: "Bronzinho",
  participacao: "Participação",
};

/** Only participação has no podium placement. */
export function isParticipationOnly(series: Series): boolean {
  return series === "participacao";
}

/** Bronzinho records a placement, but every place is worth 5 pts. */
export function isBronzinho(series: Series): boolean {
  return series === "bronzinho";
}

/**
 * Unique source of truth for tournament points (CT Beach Sports).
 * Participação: 5 pts, no placement.
 * Bronzinho: placement 1–4 required, always 5 pts (never podium table).
 */
export function calculatePoints(series: Series, placement: Placement | null): number {
  if (isParticipationOnly(series)) {
    return PARTICIPATION_POINTS;
  }

  if (placement == null || placement < 1 || placement > 4) {
    throw new Error(
      series === "bronzinho"
        ? "Bronzinho exige colocação 1–4 (vale sempre 5 pts)"
        : "Colocação deve ser 1–4 para séries Ouro/Prata/Bronze"
    );
  }

  if (isBronzinho(series)) {
    return PARTICIPATION_POINTS;
  }

  return PODIUM_POINTS[series as PodiumSeries][placement as Placement];
}

export function formatResultLabel(series: Series, placement: Placement | null): string {
  if (isParticipationOnly(series)) {
    return SERIES_LABELS.participacao;
  }

  const placeLabel =
    placement === 1 ? "1º" : placement === 2 ? "2º" : placement === 3 ? "3º" : "4º";

  if (isBronzinho(series)) {
    return `${SERIES_LABELS.bronzinho} — ${placeLabel}`;
  }

  return `${SERIES_LABELS[series]} — ${placeLabel}`;
}
