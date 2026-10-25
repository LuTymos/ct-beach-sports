import type { Stage } from "@/types";

/** Next scheduled stage, or the most recent completed one. */
export function pickHomeFeaturedStage(stages: Stage[]): Stage | null {
  const scheduled = stages
    .filter((stage) => stage.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date) || a.sort_order - b.sort_order);
  if (scheduled[0]) return scheduled[0];

  const completed = stages
    .filter((stage) => stage.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date) || b.sort_order - a.sort_order);
  return completed[0] ?? null;
}
