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
    <div className="overflow-x-auto rounded-xl border bg-card">
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
                {row.position <= 3 ? (
                  <Badge variant={row.position === 1 ? "default" : "secondary"}>
                    {row.position}º
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">{row.position}º</span>
                )}
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
  );
}
