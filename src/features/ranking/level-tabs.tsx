import Link from "next/link";
import { cn } from "@/lib/utils";
import { LEVEL_LABELS, RESULT_LEVELS, type ResultLevel } from "@/lib/categories";

type LevelTabsProps = {
  active: ResultLevel | "todos";
  basePath?: string;
};

const TABS: Array<{ value: ResultLevel | "todos"; label: string }> = [
  { value: "todos", label: "Todos" },
  ...RESULT_LEVELS.map((level) => ({ value: level, label: LEVEL_LABELS[level] })),
];

export function LevelTabs({ active, basePath = "/" }: LevelTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const href = tab.value === "todos" ? basePath : `${basePath}?nivel=${tab.value}`;
        const isActive = active === tab.value;

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
