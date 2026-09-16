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
import type { RankingRow } from "@/types";

type RankingTableProps = {
  rows: RankingRow[];
  emptyMessage?: string;
};

function PositionBadge({ position }: { position: number }) {
  if (position <= 3) {
    return (
      <Badge variant={position === 1 ? "default" : "secondary"}>{position}º</Badge>
    );
  }
  return <span className="text-muted-foreground">{position}º</span>;
}

export function RankingTable({
  rows,
  emptyMessage = "Nenhum resultado lançado ainda.",
}: RankingTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14 sm:w-16">#</TableHead>
            <TableHead>Atleta</TableHead>
            <TableHead className="hidden sm:table-cell">Equipe</TableHead>
            <TableHead className="text-right">Pontos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.athleteId}>
              <TableCell>
                <PositionBadge position={row.position} />
              </TableCell>
              <TableCell className="max-w-[12rem] font-medium sm:max-w-none">
                <Link
                  href={`/atletas/${row.athleteId}`}
                  className="block truncate hover:underline"
                >
                  {row.name}
                </Link>
                {row.team ? (
                  <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground sm:hidden">
                    {row.team}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {row.team ?? "—"}
              </TableCell>
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
