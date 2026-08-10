export type ResultCategory = "misto" | "masculino" | "feminino";
export type ResultLevel = "iniciante" | "intermediario" | "avancado";

export const RESULT_CATEGORIES: ResultCategory[] = ["masculino", "misto", "feminino"];
export const RESULT_LEVELS: ResultLevel[] = ["iniciante", "intermediario", "avancado"];

export const CATEGORY_LABELS: Record<ResultCategory, string> = {
  masculino: "Masculino",
  misto: "Misto",
  feminino: "Feminino",
};

export const LEVEL_LABELS: Record<ResultLevel, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export function isResultCategory(value: string): value is ResultCategory {
  return RESULT_CATEGORIES.includes(value as ResultCategory);
}

export function isResultLevel(value: string): value is ResultLevel {
  return RESULT_LEVELS.includes(value as ResultLevel);
}
