import Link from "next/link";
import {
  CATEGORY_LABELS,
  LEVEL_LABELS,
  RESULT_CATEGORIES,
  RESULT_LEVELS,
} from "@/lib/categories";
import { formatResultLabel } from "@/lib/scoring";
import type { StageEntryPublic } from "@/features/entries/queries";

type StageEntriesPublicListProps = {
  entries: StageEntryPublic[];
};

export function StageEntriesPublicList({ entries }: StageEntriesPublicListProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        Nenhuma dupla inscrita nesta etapa ainda.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {RESULT_CATEGORIES.map((category) => {
        const inCategory = entries.filter((e) => e.category === category);
        if (inCategory.length === 0) return null;

        return (
          <section key={category} className="space-y-3">
            <h3 className="text-lg font-medium">{CATEGORY_LABELS[category]}</h3>
            {RESULT_LEVELS.map((level) => {
              const inLevel = inCategory.filter((e) => e.level === level);
              if (inLevel.length === 0) return null;

              return (
                <div key={`${category}-${level}`} className="space-y-2">
                  <p className="text-sm text-muted-foreground">{LEVEL_LABELS[level]}</p>
                  <ul className="divide-y rounded-xl border bg-card">
                    {inLevel.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
                      >
                        <div className="text-sm">
                          {entry.members.map((member, index) => (
                            <span key={member.id}>
                              {index > 0 ? (
                                <span className="text-muted-foreground"> · </span>
                              ) : null}
                              <Link
                                href={`/atletas/${member.athleteId}`}
                                className="font-medium hover:underline"
                              >
                                {member.athleteName}
                              </Link>
                            </span>
                          ))}
                        </div>
                        {entry.podiumSeries && entry.podiumPlacement != null ? (
                          <span className="text-xs text-muted-foreground">
                            {formatResultLabel(
                              entry.podiumSeries,
                              entry.podiumPlacement as 1 | 2 | 3 | 4
                            )}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
