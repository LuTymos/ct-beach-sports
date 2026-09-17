import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  RESULT_CATEGORIES,
  type ResultCategory,
  type ResultLevel,
} from "@/lib/categories";
import { buildRankingHref } from "@/features/ranking/ranking-href";

type CategoryTabsProps = {
  active: ResultCategory | "todos";
  nivel: ResultLevel | "todos";
  basePath?: string;
  q?: string;
};

const TABS: Array<{ value: ResultCategory | "todos"; label: string }> = [
  { value: "todos", label: "Todos" },
  ...RESULT_CATEGORIES.map((category) => ({
    value: category,
    label: CATEGORY_LABELS[category],
  })),
];

export function CategoryTabs({ active, nivel, basePath = "/", q }: CategoryTabsProps) {
  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
      role="navigation"
      aria-label="Categoria"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.value;
        const href = buildRankingHref(basePath, { categoria: tab.value, nivel, q });

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
