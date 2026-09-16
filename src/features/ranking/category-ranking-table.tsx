import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_LABELS, RESULT_CATEGORIES } from "@/lib/categories";
import type { CategoryRankingRow, CategoryStanding } from "@/types";

type CategoryRankingTableProps = {
  rows: CategoryRankingRow[];
  emptyMessage?: string;
};

function formatStanding(standing: CategoryStanding | null) {
  if (!standing) return "—";
  return `${standing.position}º (${standing.points})`;
}

function PositionBadge({ position }: { position: number }) {
  if (position <= 3) {
    return (
      <Badge variant={position === 1 ? "default" : "secondary"}>{position}º</Badge>
    );
  }
  return <span className="text-muted-foreground">{position}º</span>;
}

export function CategoryRankingTable({
  rows,
  emptyMessage = "Nenhum resultado lançado ainda.",
}: CategoryRankingTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-2 md:hidden">
        {rows.map((row) => (
          <li key={row.athleteId} className="rounded-xl border bg-card p-3">
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <PositionBadge position={row.position} />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/atletas/${row.athleteId}`}
                  className="block truncate font-medium hover:underline"
                >
                  {row.name}
                </Link>
                {row.team ? (
                  <p className="truncate text-xs text-muted-foreground">{row.team}</p>
                ) : null}
                <dl className="mt-2 grid grid-cols-3 gap-1 text-center text-xs">
                  {RESULT_CATEGORIES.map((category) => (
                    <div key={category} className="rounded-md bg-muted/60 px-1 py-1.5">
                      <dt className="text-[0.65rem] text-muted-foreground">
                        {CATEGORY_LABELS[category].slice(0, 3)}
                      </dt>
                      <dd className="tabular-nums text-foreground">
                        {formatStanding(row.byCategory[category])}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-base font-semibold tabular-nums">{row.totalPoints}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Nome</TableHead>
              {RESULT_CATEGORIES.map((category) => (
                <TableHead key={category} className="text-center">
                  {CATEGORY_LABELS[category]}
                </TableHead>
              ))}
              <TableHead className="text-right">Pontuação total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.athleteId}>
                <TableCell>
                  <PositionBadge position={row.position} />
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/atletas/${row.athleteId}`} className="hover:underline">
                    {row.name}
                  </Link>
                  {row.team ? (
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      {row.team}
                    </span>
                  ) : null}
                </TableCell>
                {RESULT_CATEGORIES.map((category) => (
                  <TableCell key={category} className="text-center tabular-nums">
                    {formatStanding(row.byCategory[category])}
                  </TableCell>
                ))}
                <TableCell className="text-right font-semibold tabular-nums">
                  {row.totalPoints}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
