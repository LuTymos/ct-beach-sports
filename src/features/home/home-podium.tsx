import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS, RESULT_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { RANKING_PATH } from "@/features/ranking/ranking-href";
import type { RankingRow } from "@/types";
import {
  arrangePodium,
  buildPodiumHref,
  type PodiumFilter,
} from "./home-podium-filter";

type HomePodiumProps = {
  active: PodiumFilter;
  top: RankingRow[];
};

const CHIPS: Array<{ value: PodiumFilter; label: string }> = [
  { value: "geral", label: "Geral" },
  ...RESULT_CATEGORIES.map((category) => ({
    value: category as PodiumFilter,
    label: CATEGORY_LABELS[category],
  })),
];

// Ordem do DOM: 2º, 1º, 3º; colunas explícitas mantêm o 1º centralizado com vagas vazias.
const PODIUM_COLUMNS = ["col-start-1", "col-start-2", "col-start-3"];

export function HomePodium({ active, top }: HomePodiumProps) {
  const cells = arrangePodium(top);
  const emptyText =
    active === "geral"
      ? "Nenhum resultado lançado ainda."
      : `Nenhum resultado em ${CATEGORY_LABELS[active]} ainda.`;

  return (
    <div className="space-y-4">
      <nav
        aria-label="Filtrar pódio"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
      >
        {CHIPS.map((chip) => {
          const isActive = active === chip.value;
          return (
            <Link
              key={chip.value}
              href={buildPodiumHref(chip.value)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full border px-3.5 text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              {chip.label}
            </Link>
          );
        })}
      </nav>

      {top.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <ol aria-label="Pódio" className="grid grid-cols-3 items-end gap-2 sm:gap-3">
          {cells.map((row, index) => {
            if (!row) return null;
            const first = row.position === 1;
            return (
              <li key={row.athleteId} className={cn("min-w-0", PODIUM_COLUMNS[index])}>
                <Link
                  href={`/atletas/${row.athleteId}`}
                  className={cn(
                    "flex min-w-0 flex-col justify-end gap-1 rounded-lg border bg-card p-3 text-card-foreground transition-colors sm:p-4",
                    first
                      ? "min-h-40 border-amber-500/50 bg-amber-500/10 hover:border-amber-500"
                      : "min-h-32 border-border hover:border-primary/40"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      first
                        ? "text-amber-700"
                        : "text-muted-foreground"
                    )}
                  >
                    {row.position}º
                  </span>
                  <span title={row.name} className="min-w-0 truncate text-sm font-semibold sm:text-base">
                    {row.name}
                  </span>
                  <span title={row.team ?? undefined} className="min-w-0 truncate text-xs text-muted-foreground sm:text-sm">
                    {row.team ?? "—"}
                  </span>
                  <span className="text-base font-bold tabular-nums sm:text-lg">
                    {row.totalPoints} pts
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href={RANKING_PATH}>
            Ver ranking completo <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/pontuacao">Como pontua</Link>
        </Button>
      </div>
    </div>
  );
}
