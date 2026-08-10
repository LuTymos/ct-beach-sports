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
};

const TABS: Array<{ value: ResultCategory | "todos"; label: string }> = [
  { value: "todos", label: "Todos" },
  ...RESULT_CATEGORIES.map((category) => ({
    value: category,
    label: CATEGORY_LABELS[category],
  })),
];

export function CategoryTabs({ active, nivel, basePath = "/" }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive = active === tab.value;
        const href = buildRankingHref(basePath, { categoria: tab.value, nivel });

        return (
          <Link
            key={tab.value}
            href={href}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
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
