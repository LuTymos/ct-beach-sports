import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LEVEL_LABELS,
  RESULT_LEVELS,
  type ResultCategory,
  type ResultLevel,
} from "@/lib/categories";
import { buildRankingHref } from "@/features/ranking/ranking-href";

type LevelTabsProps = {
  active: ResultLevel | "todos";
  categoria: ResultCategory | "todos";
  basePath?: string;
  q?: string;
};

const TABS: Array<{ value: ResultLevel | "todos"; label: string }> = [
  { value: "todos", label: "Todos" },
  ...RESULT_LEVELS.map((level) => ({ value: level, label: LEVEL_LABELS[level] })),
];

export function LevelTabs({ active, categoria, basePath = "/", q }: LevelTabsProps) {
  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
      role="navigation"
      aria-label="Nível"
    >
      {TABS.map((tab) => {
        const href = buildRankingHref(basePath, {
          categoria,
          nivel: tab.value,
          q,
        });
        const isActive = active === tab.value;

        return (
          <Link
            key={tab.value}
            href={href}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full border px-3.5 text-sm transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
